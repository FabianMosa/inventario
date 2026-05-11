import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, rejectIfDemoReadonly } from "@/lib/http";
import {
  LIMITS,
  clean_string,
  to_non_negative_int,
  to_optional_int,
  validation_error,
} from "@/lib/validation";

/** Devuelve un artículo con sus saldos y si tiene movimientos asociados. */
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

/**
 * Actualiza parcialmente un artículo. Solo se tocan los campos presentes en el body.
 * Aplica los mismos caps de longitud que el POST.
 */
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
    if (body.sku !== undefined) {
      const sku = clean_string(body.sku, LIMITS.sku, "sku");
      if (!sku) return jsonError("SKU no puede estar vacío", 400);
      data.sku = sku;
    }
    if (body.name !== undefined) {
      const name = clean_string(body.name, LIMITS.name, "name");
      if (!name) return jsonError("Nombre no puede estar vacío", 400);
      data.name = name;
    }
    if (body.description !== undefined) {
      data.description = clean_string(body.description, LIMITS.description, "description");
    }
    if (body.unit !== undefined) {
      data.unit = clean_string(body.unit, LIMITS.unit, "unit") ?? "u";
    }
    if (body.minStock !== undefined) {
      data.minStock = to_non_negative_int(body.minStock, 0);
    }
    if (body.maxStock !== undefined) {
      data.maxStock = to_optional_int(body.maxStock);
    }
    if (body.categoryId !== undefined) {
      data.categoryId = clean_string(body.categoryId, 64, "categoryId");
    }
    if (body.imageUrl !== undefined) {
      data.imageUrl = clean_string(body.imageUrl, LIMITS.image_url, "imageUrl");
    }
    if (body.barcode !== undefined) {
      data.barcode = clean_string(body.barcode, LIMITS.barcode, "barcode");
    }
  } catch (e) {
    if (e instanceof validation_error) {
      return jsonError(e.message, e.code === "STRING_TOO_LONG" ? 413 : 400);
    }
    throw e;
  }

  if (body.active !== undefined) {
    data.active = Boolean(body.active);
  }

  try {
    const updated = await prisma.item.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e) {
    if (e.code === "P2002") return jsonError("SKU ya existe", 409);
    if (e.code === "P2003") return jsonError("Categoría no encontrada", 400);
    return jsonError("Artículo no encontrado", 404);
  }
}

/** Elimina el artículo si no tiene movimientos registrados. */
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
