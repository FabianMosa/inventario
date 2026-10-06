import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { isDemoReadonly } from "@/lib/demo";

const MOVEMENT_BADGES = {
  IN: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20",
  OUT: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-500/20",
  TRANSFER: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400 border border-sky-500/20",
  ADJUST: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/20",
};

/** Movements history page with styled movement type badges and item lines (SSR). */
export default async function MovementsPage() {
  const readonly = isDemoReadonly();
  const movements = await prisma.movement.findMany({
    take: 40,
    orderBy: { createdAt: "desc" },
    include: {
      lines: {
        include: {
          item: true,
          fromLocation: true,
          toLocation: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Historial de Movimientos"
        description="Trazabilidad completa de entradas, salidas, transferencias y ajustes de stock"
        actions={
          readonly ? (
            <span className="rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
              Solo lectura
            </span>
          ) : (
            <Link href="/movements/new" className="ui-btn-primary">
              + Registrar movimiento
            </Link>
          )
        }
      />

      <div className="space-y-5">
        {movements.length === 0 ? (
          <div className="ui-card px-6 py-14 text-center text-slate-600 dark:text-zinc-400">
            No se han registrado movimientos de stock.
            {readonly ? (
              <span className="mt-2 block text-xs text-slate-500 dark:text-zinc-500">
                Ejecutá <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">npm run db:seed</code> para
                cargar datos de demostración.
              </span>
            ) : (
              <div className="mt-3">
                <Link href="/movements/new" className="ui-link text-sm">
                  Registrar el primero →
                </Link>
              </div>
            )}
          </div>
        ) : (
          movements.map((m) => {
            const badge_style = MOVEMENT_BADGES[m.type] || MOVEMENT_BADGES.IN;

            return (
              <article key={m.id} className="ui-card overflow-hidden">
                <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${badge_style}`}>
                      {m.type}
                    </span>
                    <time className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                      {new Date(m.createdAt).toLocaleString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  {m.reference ? (
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      Ref: <span className="font-mono font-medium text-slate-700 dark:text-zinc-200">{m.reference}</span>
                    </span>
                  ) : null}
                </div>

                {m.notes ? (
                  <p className="border-b border-slate-100 px-5 py-2.5 text-xs text-slate-600 dark:border-zinc-800 dark:text-zinc-300 bg-white/50 dark:bg-zinc-900/30">
                    {m.notes}
                  </p>
                ) : null}

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="ui-table-head text-xs">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Artículo</th>
                        <th className="px-5 py-3 font-semibold">SKU</th>
                        <th className="px-5 py-3 font-semibold">Cantidad</th>
                        <th className="hidden px-5 py-3 font-semibold sm:table-cell">Origen</th>
                        <th className="hidden px-5 py-3 font-semibold sm:table-cell">Destino</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {m.lines.map((line) => (
                        <tr key={line.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                          <td className="px-5 py-3 font-medium text-slate-900 dark:text-zinc-100">
                            <Link href={`/items/${line.item.id}`} className="hover:text-brand-600 dark:hover:text-brand-400">
                              {line.item.name}
                            </Link>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-zinc-400">
                            {line.item.sku}
                          </td>
                          <td className="px-5 py-3 font-bold tabular-nums text-slate-900 dark:text-zinc-100">
                            {line.quantity > 0 && m.type === "IN" ? `+${line.quantity}` : line.quantity}
                          </td>
                          <td className="hidden px-5 py-3 text-xs text-slate-500 sm:table-cell dark:text-zinc-400">
                            {line.fromLocation?.name ? (
                              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                                📍 {line.fromLocation.name}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="hidden px-5 py-3 text-xs text-slate-500 sm:table-cell dark:text-zinc-400">
                            {line.toLocation?.name ? (
                              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                                📍 {line.toLocation.name}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
