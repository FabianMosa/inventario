import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

export async function GET() {
  const rows = await prisma.location.findMany({
    orderBy: { name: "asc" },
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
  const code =
    body.code == null || body.code === ""
      ? null
      : String(body.code).trim() || null;
  if (!name) return jsonError("El nombre es obligatorio", 400);

  const created = await prisma.location.create({ data: { name, code } });
  return NextResponse.json(created, { status: 201 });
}
