import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, rejectIfDemoReadonly } from "@/lib/http";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
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

  const withTotal = rows.map((item) => ({
    ...item,
    totalQuantity: item.balances.reduce((s, b) => s + b.quantity, 0),
  }));

  return NextResponse.json(withTotal);
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

  const sku = typeof body.sku === "string" ? body.sku.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description =
    body.description == null
      ? null
      : String(body.description).trim() || null;
  const unit =
    typeof body.unit === "string" && body.unit.trim()
      ? body.unit.trim()
      : "u";
  const minStock = Number.isFinite(Number(body.minStock))
    ? Math.max(0, parseInt(body.minStock, 10))
    : 0;
  const maxStock =
    body.maxStock === null || body.maxStock === ""
      ? null
      : Number.isFinite(Number(body.maxStock))
        ? parseInt(body.maxStock, 10)
        : null;
  const categoryId =
    body.categoryId && String(body.categoryId).trim()
      ? String(body.categoryId).trim()
      : null;
  const imageUrl =
    body.imageUrl && String(body.imageUrl).trim()
      ? String(body.imageUrl).trim()
      : null;
  const barcode =
    body.barcode && String(body.barcode).trim()
      ? String(body.barcode).trim()
      : null;

  if (!sku) return jsonError("SKU es obligatorio", 400);
  if (!name) return jsonError("Nombre es obligatorio", 400);

  try {
    const created = await prisma.item.create({
      data: {
        sku,
        name,
        description,
        unit,
        minStock,
        maxStock,
        categoryId,
        imageUrl,
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
