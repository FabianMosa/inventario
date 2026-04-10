import Link from "next/link";
import { prisma } from "@/lib/prisma";

/**
 * Panel inicial: narrativa orientada al visitante (portafolio), métricas y alertas.
 * Copy alineado con estrategia de valor: claridad operativa + transparencia “demo sin login”.
 */
export default async function HomePage() {
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
      {/* Hero: jerarquía awareness → acción; CTAs medibles (explorar vs crear) */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-card backdrop-blur-sm sm:p-8 lg:p-10">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-brand-400/30 to-cyan-300/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-gradient-to-tr from-violet-400/25 to-brand-300/20 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-brand-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-800">
            Demo portafolio · Sin cuenta
          </p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.35rem] lg:leading-tight">
            Ve el inventario funcionando, no solo en un README
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
            Recorre catálogo, ubicaciones y movimientos con datos vivos en PostgreSQL.
            Pensado para quien revisa stack, modelo de datos o claridad de interfaz.
          </p>
          <ul
            className="mt-5 grid gap-2 text-sm text-slate-700 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2"
            aria-label="Lo que incluye esta demo"
          >
            <BenefitRow text="Saldos por ubicación y trazabilidad de movimientos" />
            <BenefitRow text="Alertas cuando el total cae bajo el mínimo configurado" />
            <BenefitRow text="Despliegue habitual con Railway y Next.js 15 (App Router)" />
            <BenefitRow text="Sin autenticación: alcance transparente en modo demo" />
          </ul>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/items" className="ui-btn-primary justify-center sm:justify-start">
              Explorar catálogo
            </Link>
            <Link
              href="/items/new"
              className="ui-btn-secondary justify-center sm:justify-start"
            >
              Nuevo artículo
            </Link>
            <Link
              href="/movements/new"
              className="ui-btn-secondary justify-center sm:justify-start"
            >
              Registrar movimiento
            </Link>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Si el sitio es público, cualquier visitante puede llamar a la API: úsalo como
            muestra o restringe el acceso en tu hosting (por ejemplo Railway).
          </p>
        </div>
      </section>

      {/* Consideración: mapa del producto con enlaces claros (reduce fricción de navegación) */}
      <section aria-labelledby="home-map-heading">
        <h2 id="home-map-heading" className="sr-only">
          Accesos rápidos al sistema
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickTile
            href="/items"
            title="Artículos"
            description="SKU, categoría y stock por ubicación"
          />
          <QuickTile
            href="/locations"
            title="Ubicaciones"
            description="Almacenes o puntos donde hay saldo"
          />
          <QuickTile
            href="/movements"
            title="Movimientos"
            description="Historial de entradas, salidas y ajustes"
          />
          <QuickTile
            href="/categories"
            title="Categorías"
            description="Maestro para organizar el catálogo"
          />
        </div>
      </section>

      <section aria-labelledby="home-stats-heading">
        <h2 id="home-stats-heading" className="sr-only">
          Resumen numérico
        </h2>
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
      </section>

      <section className="ui-card p-5 sm:p-7" aria-labelledby="home-alerts-heading">
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
              <h2
                id="home-alerts-heading"
                className="text-lg font-bold text-slate-900"
              >
                Atención: stock bajo el mínimo
              </h2>
              <p className="text-sm text-slate-500">
                Listado en vivo de artículos cuyo total global no alcanza el mínimo
                definido
              </p>
            </div>
          </div>
          <Link href="/items" className="ui-link text-sm">
            Ir al catálogo <span aria-hidden>→</span>
          </Link>
        </div>
        {alerts.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-slate-600">
            No hay alertas ahora mismo: ningún artículo activo está por debajo de su mínimo.
          </p>
        ) : (
          <ul
            className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50"
            aria-label="Artículos con stock por debajo del mínimo"
          >
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

/**
 * Mosaico de entrada al producto: título + una línea de beneficio (marketing + UX de descubrimiento).
 */
function QuickTile({ href, title, description }) {
  return (
    <Link
      href={href}
      className="ui-card group flex flex-col p-4 transition hover:border-brand-200/90 hover:shadow-md sm:p-5"
    >
      <span className="text-sm font-bold text-slate-900 group-hover:text-brand-700">
        {title}
      </span>
      <span className="mt-1 text-xs leading-snug text-slate-500 sm:text-sm">
        {description}
      </span>
      <span className="mt-3 text-xs font-semibold text-brand-600 group-hover:underline">
        Abrir <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

/** Viñeta del hero: icono decorativo (SVG) + texto; evita depender del glifo “✓”. */
function BenefitRow({ text }) {
  return (
    <li className="flex gap-2">
      <span className="mt-0.5 shrink-0 text-brand-600" aria-hidden>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </span>
      <span>{text}</span>
    </li>
  );
}
