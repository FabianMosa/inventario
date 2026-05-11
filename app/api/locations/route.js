import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, rejectIfDemoReadonly } from "@/lib/http";
import { LIMITS, clean_string, validation_error } from "@/lib/validation";

/** Lista todas las ubicaciones por nombre ASC. */
export async function GET() {
  const rows = await prisma.location.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(rows);
}

/** Crea una nueva ubicación. Aplica caps de longitud para evitar inputs abusivos. */
export async function POST(request) {
  const denied = rejectIfDemoReadonly();
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("JSON inválido", 400);
  }

  let name, code;
  try {
    name = clean_string(body.name, LIMITS.name, "name");
    code = clean_string(body.code, LIMITS.code, "code");
  } catch (e) {
    if (e instanceof validation_error) {
      return jsonError(e.message, e.code === "STRING_TOO_LONG" ? 413 : 400);
    }
    throw e;
  }
  if (!name) return jsonError("El nombre es obligatorio", 400);

  const created = await prisma.location.create({ data: { name, code } });
  return NextResponse.json(created, { status: 201 });
}
