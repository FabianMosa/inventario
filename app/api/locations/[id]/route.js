import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, rejectIfDemoReadonly } from "@/lib/http";
import { LIMITS, clean_string, validation_error } from "@/lib/validation";

/** Actualiza nombre/código de una ubicación. Solo cambia los campos enviados. */
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

  const data = {};
  try {
    if (body.name !== undefined) {
      const name = clean_string(body.name, LIMITS.name, "name");
      if (!name) return jsonError("El nombre no puede estar vacío", 400);
      data.name = name;
    }
    if (body.code !== undefined) {
      data.code = clean_string(body.code, LIMITS.code, "code");
    }
  } catch (e) {
    if (e instanceof validation_error) {
      return jsonError(e.message, e.code === "STRING_TOO_LONG" ? 413 : 400);
    }
    throw e;
  }

  try {
    const updated = await prisma.location.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return jsonError("Ubicación no encontrada", 404);
  }
}

/** Elimina una ubicación si no tiene saldos asociados. */
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
