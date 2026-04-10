import { NextResponse } from "next/server";

/** Respuesta JSON de error con código HTTP coherente (API sin auth, demo portafolio). */
export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
