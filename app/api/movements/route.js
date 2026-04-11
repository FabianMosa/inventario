import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, rejectIfDemoReadonly } from "@/lib/http";
import { applyMovementTx } from "@/lib/movements";

const ALLOWED = new Set(["IN", "OUT", "TRANSFER", "ADJUST"]);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const take = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("take") || "30", 10) || 30)
  );

  const rows = await prisma.movement.findMany({
    take,
    orderBy: { createdAt: "desc" },
    include: {
      lines: {
        include: {
          item: true,
          fromLocation: true,
          toLocation: true,
        },
      },
    },
  });
  return NextResponse.json(rows);
}

export async function POST(request) {
  const denied = rejectIfDemoReadonly();
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("JSON inválido", 400);
  }

  const type = typeof body.type === "string" ? body.type.toUpperCase() : "";
  if (!ALLOWED.has(type)) {
    return jsonError("Tipo inválido: use IN, OUT, TRANSFER o ADJUST", 400);
  }

  const reference =
    body.reference == null || body.reference === ""
      ? null
      : String(body.reference).trim().slice(0, 200) || null;
  const notes =
    body.notes == null || body.notes === ""
      ? null
      : String(body.notes).trim().slice(0, 2000) || null;

  const linesIn = Array.isArray(body.lines) ? body.lines : null;
  if (!linesIn?.length) return jsonError("Debe incluir al menos una línea", 400);

  const lines = [];
  for (const raw of linesIn) {
    const itemId =
      raw.itemId && String(raw.itemId).trim() ? String(raw.itemId).trim() : "";
    const quantity = parseInt(raw.quantity, 10);
    const fromLocationId =
      raw.fromLocationId && String(raw.fromLocationId).trim()
        ? String(raw.fromLocationId).trim()
        : null;
    const toLocationId =
      raw.toLocationId && String(raw.toLocationId).trim()
        ? String(raw.toLocationId).trim()
        : null;

    if (!itemId) return jsonError("Cada línea requiere itemId", 400);
    if (!Number.isFinite(quantity)) {
      return jsonError("Cantidad numérica inválida", 400);
    }
    if (type !== "ADJUST" && quantity <= 0) {
      return jsonError("Para este tipo la cantidad debe ser mayor que cero", 400);
    }

    lines.push({
      itemId,
      quantity,
      fromLocationId,
      toLocationId,
    });
  }

  try {
    const movement = await prisma.$transaction(async (tx) => {
      const m = await tx.movement.create({
        data: { type, reference, notes },
      });
      for (const line of lines) {
        await tx.movementLine.create({
          data: {
            movementId: m.id,
            itemId: line.itemId,
            quantity: line.quantity,
            fromLocationId: line.fromLocationId,
            toLocationId: line.toLocationId,
          },
        });
      }
      await applyMovementTx(tx, { type, lines });
      return tx.movement.findUnique({
        where: { id: m.id },
        include: {
          lines: {
            include: {
              item: true,
              fromLocation: true,
              toLocation: true,
            },
          },
        },
      });
    });

    return NextResponse.json(movement, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Stock insuficiente") || msg.includes("requiere")) {
      return jsonError(msg, 409);
    }
    if (typeof e === "object" && e && "code" in e && e.code === "P2003") {
      return jsonError("Referencia inválida (artículo o ubicación)", 400);
    }
    console.error(e);
    return jsonError("No se pudo registrar el movimiento", 500);
  }
}
