import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isDemoReadonly } from "@/lib/demo";
import { CategoryInsumos } from "@/components/CategoryInsumos";

/**
 * Panel inicial: totales, alertas por stock bajo el mínimo y enlaces rápidos.
 * Sin autenticación: datos pensados para demo de portafolio.
 */
export default async function HomePage() {
  const readonly = isDemoReadonly();
  const items = await prisma.item.findMany({
    where: { active: true },
    include: { category: true, balances: true },
    orderBy: { name: "asc" },
  });

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
            Panel de inventario: artículos, ubicaciones y movimientos en
            una interfaz rápida y lista para desplegar.
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

      <section className="ui-card p-5 sm:p-7">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Explorar por categoría
        </h2>
        <CategoryInsumos />
      </section>

      <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-soft backdrop-blur-sm sm:p-7 dark:border-amber-800/60 dark:from-amber-950/40 dark:to-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-400"
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
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Alertas de stock
                </h2>
                {alerts.length > 0 ? (
                  <span className="inline-flex items-center justify-center rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                    {alerts.length}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Artículos cuyo stock total no alcanza el mínimo configurado
              </p>
            </div>
          </div>
          <Link href="/items" className="ui-link text-sm">
            Ver catálogo →
          </Link>
        </div>
        {alerts.length === 0 ? (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/80 px-4 py-6 text-center text-sm text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>No hay alertas en este momento. Todo en orden.</span>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-amber-100 rounded-xl border border-amber-200 bg-white/90 dark:divide-amber-800/40 dark:border-amber-800/50 dark:bg-slate-900/80">
            {alerts.map((i) => (
              <li
                key={i.id}
                className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{i.name}</span>
                  <span className="ml-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {i.sku}
                  </span>
                  {i.category ? (
                    <span className="ml-2 inline-flex items-center rounded-full bg-amber-100/70 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                      {i.category.name}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <span className="text-slate-600 dark:text-slate-400">
                    Stock: <span className="tabular-nums text-amber-700 dark:text-amber-400">{i.total}</span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Mín: {i.minStock}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}


