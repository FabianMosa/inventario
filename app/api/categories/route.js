import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

/** Listado y alta de categorías (demo sin autenticación). */
export async function GET() {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return NextResponse.json(rows);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("JSON inválido", 400);
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return jsonError("El nombre es obligatorio", 400);

  const created = await prisma.category.create({ data: { name } });
  return NextResponse.json(created, { status: 201 });
}
