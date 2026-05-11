import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, rejectIfDemoReadonly } from "@/lib/http";
import { LIMITS, clean_string, validation_error } from "@/lib/validation";

/** Listado de categorías con contador de artículos asociados. */
export async function GET() {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return NextResponse.json(rows);
}

/** Alta de categoría (demo sin autenticación). Aplica cap de longitud sobre `name`. */
export async function POST(request) {
  const denied = rejectIfDemoReadonly();
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("JSON inválido", 400);
  }

  let name;
  try {
    name = clean_string(body.name, LIMITS.name, "name");
  } catch (e) {
    if (e instanceof validation_error) {
      return jsonError(e.message, e.code === "STRING_TOO_LONG" ? 413 : 400);
    }
    throw e;
  }
  if (!name) return jsonError("El nombre es obligatorio", 400);

  const created = await prisma.category.create({ data: { name } });
  return NextResponse.json(created, { status: 201 });
}
