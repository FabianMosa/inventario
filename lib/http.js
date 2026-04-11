import { NextResponse } from "next/server";
import { isDemoReadonly } from "@/lib/demo";

/** Respuesta JSON de error con código HTTP coherente (API sin auth, demo portafolio). */
export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Bloquea POST/PATCH/DELETE cuando la demo está en solo lectura (403). */
export function rejectIfDemoReadonly() {
  if (!isDemoReadonly()) return null;
  return jsonError(
    "Demo en solo lectura: no se permiten cambios. Quita o pon en false NEXT_PUBLIC_DEMO_READONLY para editar datos.",
    403
  );
}
