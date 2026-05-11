import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, rejectIfDemoReadonly } from "@/lib/http";
import {
  LIMITS,
  clean_search_query,
  clean_string,
  to_non_negative_int,
  to_optional_int,
  validation_error,
} from "@/lib/validation";

/**
 * Lista los artículos activos.
 * Acepta `?q=` opcional para buscar por nombre, SKU o código de barras
 * (recortado a `LIMITS.query` para acotar el coste del `contains`).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = clean_search_query(searchParams.get("q"));
  const where = {
    active: true,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { barcode: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const rows = await prisma.item.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      category: true,
      balances: { include: { location: true } },
    },
  });

  const with_total = rows.map((item) => ({
    ...item,
    totalQuantity: item.balances.reduce((s, b) => s + b.quantity, 0),
  }));

  return NextResponse.json(with_total);
}

/**
 * Crea un nuevo artículo. Aplica caps de longitud para evitar inputs gigantes
 * (DoS / bloat de DB) sobre los campos textuales y la `imageUrl` (que puede
 * llegar como data URL de la cámara).
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

  let sku, name, description, unit, image_url, barcode, category_id;
  try {
    sku = clean_string(body.sku, LIMITS.sku, "sku");
    name = clean_string(body.name, LIMITS.name, "name");
    description = clean_string(body.description, LIMITS.description, "description");
    unit = clean_string(body.unit, LIMITS.unit, "unit") ?? "u";
    image_url = clean_string(body.imageUrl, LIMITS.image_url, "imageUrl");
    barcode = clean_string(body.barcode, LIMITS.barcode, "barcode");
    category_id = clean_string(body.categoryId, 64, "categoryId");
  } catch (e) {
    if (e instanceof validation_error) {
      return jsonError(e.message, e.code === "STRING_TOO_LONG" ? 413 : 400);
    }
    throw e;
  }

  const min_stock = to_non_negative_int(body.minStock, 0);
  const max_stock = to_optional_int(body.maxStock);

  if (!sku) return jsonError("SKU es obligatorio", 400);
  if (!name) return jsonError("Nombre es obligatorio", 400);

  try {
    const created = await prisma.item.create({
      data: {
        sku,
        name,
        description,
        unit,
        minStock: min_stock,
        maxStock: max_stock,
        categoryId: category_id,
        imageUrl: image_url,
        barcode,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e.code === "P2002") return jsonError("SKU ya existe", 409);
    if (e.code === "P2003") return jsonError("Categoría no encontrada", 400);
    throw e;
  }
}
