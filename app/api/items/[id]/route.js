import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, rejectIfDemoReadonly } from "@/lib/http";

export async function GET(_request, context) {
  const { id } = await context.params;
  const row = await prisma.item.findUnique({
    where: { id },
    include: {
      category: true,
      balances: { include: { location: true } },
      _count: { select: { lines: true } },
    },
  });
  if (!row) return jsonError("Artículo no encontrado", 404);
  const { _count, ...rest } = row;
  return NextResponse.json({
    ...rest,
    hasMovements: _count.lines > 0,
    totalQuantity: rest.balances.reduce((s, b) => s + b.quantity, 0),
  });
}

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
  if (body.sku !== undefined) {
    const sku = typeof body.sku === "string" ? body.sku.trim() : "";
    if (!sku) return jsonError("SKU no puede estar vacío", 400);
    data.sku = sku;
  }
  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return jsonError("Nombre no puede estar vacío", 400);
    data.name = name;
  }
  if (body.description !== undefined) {
    data.description =
      body.description == null
        ? null
        : String(body.description).trim() || null;
  }
  if (body.unit !== undefined) {
    data.unit =
      typeof body.unit === "string" && body.unit.trim()
        ? body.unit.trim()
        : "u";
  }
  if (body.minStock !== undefined) {
    data.minStock = Number.isFinite(Number(body.minStock))
      ? Math.max(0, parseInt(body.minStock, 10))
      : 0;
  }
  if (body.maxStock !== undefined) {
    data.maxStock =
      body.maxStock === null || body.maxStock === ""
        ? null
        : Number.isFinite(Number(body.maxStock))
          ? parseInt(body.maxStock, 10)
          : null;
  }
  if (body.categoryId !== undefined) {
    data.categoryId =
      body.categoryId && String(body.categoryId).trim()
        ? String(body.categoryId).trim()
        : null;
  }
  if (body.active !== undefined) {
    data.active = Boolean(body.active);
  }

  try {
    const updated = await prisma.item.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e.code === "P2002") return jsonError("SKU ya existe", 409);
    return jsonError("Artículo no encontrado", 404);
  }
}

export async function DELETE(_request, context) {
  const denied = rejectIfDemoReadonly();
  if (denied) return denied;

  const { id } = await context.params;
  const lines = await prisma.movementLine.count({ where: { itemId: id } });
  if (lines > 0) {
    return jsonError(
      "No se puede eliminar: el artículo tiene movimientos registrados",
      409
    );
  }
  try {
    await prisma.stockBalance.deleteMany({ where: { itemId: id } });
    await prisma.item.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return jsonError("No se pudo eliminar el artículo", 409);
  }
}
