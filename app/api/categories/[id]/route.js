import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

export async function GET(_request, context) {
  const { id } = await context.params;
  const row = await prisma.category.findUnique({
    where: { id },
    include: { items: { where: { active: true }, take: 50 } },
  });
  if (!row) return jsonError("Categoría no encontrada", 404);
  return NextResponse.json(row);
}

export async function PATCH(request, context) {
  const { id } = await context.params;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("JSON inválido", 400);
  }
  const name =
    typeof body.name === "string" ? body.name.trim() : undefined;
  if (name !== undefined && !name) return jsonError("El nombre no puede estar vacío", 400);

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: { ...(name !== undefined ? { name } : {}) },
    });
    return NextResponse.json(updated);
  } catch {
    return jsonError("Categoría no encontrada", 404);
  }
}

export async function DELETE(_request, context) {
  const { id } = await context.params;
  try {
    await prisma.category.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return jsonError("No se pudo eliminar (¿tiene artículos asociados?)", 409);
  }
}
