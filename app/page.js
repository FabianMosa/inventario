import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isDemoReadonly } from "@/lib/demo";
import { CategoryInsumos } from "@/components/CategoryInsumos";
import { StatCard } from "@/components/ui/StatCard";
import { StockBadge } from "@/components/ui/StockBadge";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { InventoryCharts } from "@/components/ui/InventoryCharts";
import { DashboardInteractiveWrapper } from "@/components/DashboardInteractiveWrapper";

export const dynamic = "force-dynamic";

/**
 * Main SaaS Dashboard Page.
 * Renders inventory KPIs, activity timeline, category explorer and low stock alerts.
 */
export default async function HomePage() {
  const readonly = isDemoReadonly();

  // Fetch active items with categories and location balances
  const items = await prisma.item.findMany({
    where: { active: true },
    include: { category: true, balances: true },
    orderBy: { name: "asc" },
  });

  // Calculate total quantity per item
  const with_totals = items.map((i) => ({
    ...i,
    total: i.balances.reduce((sum, b) => sum + b.quantity, 0),
  }));

  // Filter low stock and out of stock items
  const alerts = with_totals.filter((i) => i.total < i.minStock);
  const out_of_stock = with_totals.filter((i) => i.total === 0);
  const total_units = with_totals.reduce((sum, i) => sum + i.total, 0);

  // Fetch recent movements for ActivityFeed
  let recent_movements = [];
  try {
    recent_movements = await prisma.movement.findMany({
      take: 6,
      include: {
        lines: {
          include: { item: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    recent_movements = [];
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-saas backdrop-blur-sm sm:p-8 dark:border-zinc-800/80 dark:bg-zinc-900/90">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-brand-500/20 to-cyan-400/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              Panel
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-zinc-100">
              Control de Inventario y Stock
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400 max-w-xl">
              Catálogo de artículos, control de existencias por ubicación y trazabilidad de movimientos en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/items" className="ui-btn-primary text-xs">
              Ver Catálogo
            </Link>
            {!readonly ? (
              <Link href="/movements/new" className="ui-btn-secondary text-xs">
                + Movimiento
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
                Demo solo lectura
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Top 4 KPI Stat Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Artículos"
          value={items.length}
          change={`${items.length} SKUs`}
          changeType="neutral"
          subtitle="Catálogo activo registrado"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          accentColor="from-brand-500/20 to-indigo-500/10 text-brand-600 dark:text-brand-400"
        />

        <StatCard
          title="Unidades en Stock"
          value={total_units.toLocaleString()}
          change="Saldos acumulados"
          changeType="up"
          subtitle="Total global entre ubicaciones"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          accentColor="from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Stock en Alerta"
          value={alerts.length}
          change={alerts.length > 0 ? `${alerts.length} con reorden` : "0 bajo mínimo"}
          changeType={alerts.length > 0 ? "warning" : "up"}
          subtitle="Bajo el mínimo configurado"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          accentColor="from-amber-500/20 to-yellow-500/10 text-amber-600 dark:text-amber-400"
        />

        <StatCard
          title="Artículos Agotados"
          value={out_of_stock.length}
          change={out_of_stock.length > 0 ? "Sin existencias" : "Sin agotados"}
          changeType={out_of_stock.length > 0 ? "down" : "up"}
          subtitle="Unidades actuales = 0"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
          accentColor="from-rose-500/20 to-red-500/10 text-rose-600 dark:text-rose-400"
        />
      </section>

      {/* Dynamic Inventory Charts & Distribution */}
      <InventoryCharts
        inStockCount={items.length - alerts.length}
        lowStockCount={alerts.length - out_of_stock.length}
        outOfStockCount={out_of_stock.length}
      />

      {/* Categories & Main Grid */}
      <section className="ui-card p-5 sm:p-6">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-zinc-100">
          Explorar por Categoría
        </h2>
        <CategoryInsumos />
      </section>

      {/* Split Grid: Stock Alerts Table & Activity Feed */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Low Stock Alerts */}
        <div className="lg:col-span-7 ui-card p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  Alertas de Stock Bajo
                </h2>
              </div>
            </div>
            <Link href="/items" className="ui-link text-xs">
              Ver todo →
            </Link>
          </div>

          {alerts.length === 0 ? (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4 text-xs text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-400">
              <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Todos los artículos cuentan con stock por encima del mínimo requerido.</span>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-zinc-800/60">
              {alerts.map((item) => (
                <li key={item.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between px-2 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 rounded-lg transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/items/${item.id}`} className="font-semibold text-sm text-slate-900 hover:text-brand-600 dark:text-zinc-100 dark:hover:text-brand-400 truncate">
                        {item.name}
                      </Link>
                      <StockBadge
                        status={item.total === 0 ? "out_of_stock" : "low_stock"}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      <span className="font-mono text-[11px]">{item.sku}</span>
                      {item.category ? (
                        <>
                          <span>•</span>
                          <span>{item.category.name}</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-medium">
                    <div className="text-right">
                      <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Stock Actual: </span>
                      <span className="tabular-nums font-bold text-amber-700 dark:text-amber-400">{item.total}</span>
                      <span className="text-slate-400 dark:text-zinc-500 text-[11px]"> / Mín: {item.minStock}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: Live Activity Feed */}
        <div className="lg:col-span-5">
          <ActivityFeed movements={recent_movements} />
        </div>
      </section>

      {/* Floating Action Dock & Command Palette Client Wrapper */}
      <DashboardInteractiveWrapper />
    </div>
  );
}
