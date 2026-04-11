import { isDemoReadonly } from "@/lib/demo";

/**
 * Aviso global cuando la demo bloquea escritura (API + formularios).
 * Server Component: lee la variable en el request/build según Next.
 */
export function DemoReadonlyBanner() {
  if (!isDemoReadonly()) return null;

  return (
    <div
      className="border-b border-amber-200/90 bg-amber-50/95 px-4 py-2.5 text-center text-sm text-amber-950 shadow-sm"
      role="status"
    >
      <strong className="font-semibold">Demo solo lectura:</strong>{" "}
      formularios deshabilitados y la API no acepta altas ni cambios. Para editar en
      local, pon{" "}
      <code className="rounded-md bg-amber-100/90 px-1.5 py-0.5 font-mono text-xs text-amber-900">
        NEXT_PUBLIC_DEMO_READONLY=false
      </code>{" "}
      en <span className="font-mono">.env</span> y reinicia el servidor.
    </div>
  );
}
