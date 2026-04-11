import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, rejectIfDemoReadonly } from "@/lib/http";

export async function PATCH(request, context) {
  const denied = rejectIfDemoReadonly();
  if (denied) return denied;

  const { id } = await context.params;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("JSON inválido", 400);
  }
  const name =
    typeof body.name === "string" ? body.name.trim() : undefined;
  const code =
    body.code === undefined
      ? undefined
      : body.code == null || body.code === ""
        ? null
        : String(body.code).trim() || null;
  if (name !== undefined && !name) return jsonError("El nombre no puede estar vacío", 400);

  try {
    const updated = await prisma.location.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(code !== undefined ? { code } : {}),
      },
    });
    return NextResponse.json(updated);
  } catch {
    return jsonError("Ubicación no encontrada", 404);
  }
}

export async function DELETE(_request, context) {
  const denied = rejectIfDemoReadonly();
  if (denied) return denied;

  const { id } = await context.params;
  const balances = await prisma.stockBalance.count({ where: { locationId: id } });
  if (balances > 0) {
    return jsonError("No se puede eliminar: hay saldos en esta ubicación", 409);
  }
  try {
    await prisma.location.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return jsonError("No se pudo eliminar la ubicación", 409);
  }
}
