import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, rejectIfDemoReadonly } from "@/lib/http";
import { applyMovementTx } from "@/lib/movements";
import {
  LIMITS,
  clean_string,
  is_movement_type,
  parse_movement_lines,
  parse_take,
  validation_error,
} from "@/lib/validation";

/**
 * Lista los movimientos más recientes (orden descendente).
 * `?take=` se clava entre 1 y 50.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const take = parse_take(searchParams.get("take"), { default_value: 30, max: 50 });

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

/**
 * Crea un movimiento (IN/OUT/TRANSFER/ADJUST) en una sola transacción que
 * también actualiza los saldos a través de `applyMovementTx`.
 *
 * Aplica caps de longitud sobre `reference`/`notes` y limita el número de
 * líneas para evitar payloads abusivos en la API pública.
 */
export async function POST(request) {
  const denied = rejectIfDemoReadonly();
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("JSON inválido", 400);
  }

  if (!is_movement_type(body.type)) {
    return jsonError("Tipo inválido: use IN, OUT, TRANSFER o ADJUST", 400);
  }
  const type = String(body.type).toUpperCase();

  let reference, notes, lines;
  try {
    reference = clean_string(body.reference, LIMITS.reference, "reference");
    notes = clean_string(body.notes, LIMITS.notes, "notes");
    lines = parse_movement_lines(body.lines, type);
  } catch (e) {
    if (e instanceof validation_error) {
      return jsonError(e.message, e.code === "STRING_TOO_LONG" ? 413 : 400);
    }
    throw e;
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
