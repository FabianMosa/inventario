import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isDemoReadonly } from "@/lib/demo";

/**
 * Panel inicial: totales, alertas por stock bajo el mínimo y enlaces rápidos.
 * Sin autenticación: datos pensados para demo de portafolio.
 */
export default async function HomePage() {
  const readonly = isDemoReadonly();
  const [itemCount, locationCount, movementCount, items] = await Promise.all([
    prisma.item.count({ where: { active: true } }),
    prisma.location.count(),
    prisma.movement.count(),
    prisma.item.findMany({
      where: { active: true },
      include: { category: true, balances: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const withTotals = items.map((i) => ({
    ...i,
    total: i.balances.reduce((s, b) => s + b.quantity, 0),
  }));

  const alerts = withTotals.filter((i) => i.total < i.minStock);

  return (
    <div className="space-y-10">
      {/* Hero: mensaje principal y acentos visuales sin sacrificar claridad */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-card backdrop-blur-sm sm:p-8 lg:p-10">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-brand-400/30 to-cyan-300/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-gradient-to-tr from-violet-400/25 to-brand-300/20 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Controla tu stock con claridad
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
            Panel de inventario sin login: artículos, ubicaciones y movimientos en
            una interfaz rápida y lista para desplegar con PostgreSQL (por ejemplo en
            Railway).
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/items" className="ui-btn-primary">
              Ver catálogo
            </Link>
            {readonly ? (
              <span className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600">
                Alta desactivada (solo lectura)
              </span>
            ) : (
              <>
                <Link href="/items/new" className="ui-btn-secondary">
                  Nuevo artículo
                </Link>
                <Link href="/movements/new" className="ui-btn-secondary">
                  Registrar movimiento
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Artículos activos"
          value={itemCount}
          accent="from-brand-500 to-indigo-600"
        />
        <StatCard
          title="Ubicaciones"
          value={locationCount}
          accent="from-cyan-500 to-teal-600"
        />
        <StatCard
          title="Movimientos"
          value={movementCount}
          accent="from-violet-500 to-purple-600"
        />
      </div>

      <section className="ui-card p-5 sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"
              aria-hidden
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Alertas: stock bajo el mínimo
              </h2>
              <p className="text-sm text-slate-500">
                Artículos cuyo total global no alcanza el mínimo configurado
              </p>
            </div>
          </div>
          <Link href="/items" className="ui-link text-sm">
            Ver catálogo →
          </Link>
        </div>
        {alerts.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-slate-600">
            No hay alertas en este momento. Todo en orden.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
            {alerts.map((i) => (
              <li
                key={i.id}
                className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-900">{i.name}</span>
                  <span className="ml-2 font-mono text-xs text-slate-500">
                    {i.sku}
                  </span>
                </div>
                <div className="text-sm font-medium text-amber-800">
                  Total: {i.total} · Mínimo: {i.minStock}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Tarjeta métrica con barra superior en gradiente para jerarquía visual */
function StatCard({ title, value, accent }) {
  return (
    <div className="ui-card relative overflow-hidden p-5">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`}
        aria-hidden
      />
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-extrabold tabular-nums tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}
