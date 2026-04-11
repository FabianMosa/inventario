/**
 * Modo demo solo lectura: activo si NEXT_PUBLIC_DEMO_READONLY es "1" o "true" (insensible a mayúsculas).
 * Misma variable en servidor (API) y cliente (formularios); documentado en .env.example.
 */
export function isDemoReadonly() {
  const v = (process.env.NEXT_PUBLIC_DEMO_READONLY ?? "").trim();
  return v === "1" || /^true$/i.test(v);
}
