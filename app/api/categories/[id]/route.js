import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, rejectIfDemoReadonly } from "@/lib/http";
import { LIMITS, clean_string, validation_error } from "@/lib/validation";

/** Devuelve una categoría con un avance de hasta 50 artículos activos. */
export async function GET(_request, context) {
  const { id } = await context.params;
  const row = await prisma.category.findUnique({
    where: { id },
    include: { items: { where: { active: true }, take: 50 } },
  });
  if (!row) return jsonError("Categoría no encontrada", 404);
  return NextResponse.json(row);
}

/** Actualiza solo los campos enviados (por ahora `name`). */
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
  } catch (e) {
    if (e instanceof validation_error) {
      return jsonError(e.message, e.code === "STRING_TOO_LONG" ? 413 : 400);
    }
    throw e;
  }

  try {
    const updated = await prisma.category.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return jsonError("Categoría no encontrada", 404);
  }
}

/** Elimina la categoría si no tiene artículos asociados (Prisma lo rechaza si los hay). */
export async function DELETE(_request, context) {
  const denied = rejectIfDemoReadonly();
  if (denied) return denied;

  const { id } = await context.params;
  try {
    await prisma.category.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return jsonError("No se pudo eliminar (¿tiene artículos asociados?)", 409);
  }
}
