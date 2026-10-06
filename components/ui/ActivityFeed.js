import React from "react";
import Link from "next/link";

/**
 * Maps movement type to visual styles and icons.
 */
const MOVEMENT_CONFIG = {
  IN: {
    label: "Entrada",
    badge: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    sign: "+",
    svg: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
  },
  OUT: {
    label: "Salida",
    badge: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
    sign: "-",
    svg: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
  },
  TRANSFER: {
    label: "Transferencia",
    badge: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400 border-sky-500/20",
    iconColor: "text-sky-600 dark:text-sky-400",
    sign: "⇄",
    svg: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  ADJUST: {
    label: "Ajuste",
    badge: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    sign: "±",
    svg: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
};

/**
 * Formats date object to relative string or localized short date.
 * @param {Date | string} date_input Input date.
 * @returns {string} Formatted time label.
 */
function format_relative_time(date_input) {
  if (!date_input) return "";
  const date_obj = new Date(date_input);
  if (isNaN(date_obj.getTime())) return "";

  const diff_seconds = Math.floor((new Date() - date_obj) / 1000);
  if (diff_seconds < 60) return "Hace un momento";
  if (diff_seconds < 3600) return `Hace ${Math.floor(diff_seconds / 60)} min`;
  if (diff_seconds < 86400) return `Hace ${Math.floor(diff_seconds / 3600)} h`;

  return date_obj.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Component for displaying recent movement activity feed.
 * @param {Object} props Component props.
 * @param {Array<Object>} [props.movements] List of recent movements from backend.
 * @returns {JSX.Element} Rendered ActivityFeed component.
 */
export function ActivityFeed({ movements = [] }) {
  const has_movements = Array.isArray(movements) && movements.length > 0;

  return (
    <div className="ui-card p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            Actividad Reciente
          </h2>
        </div>
        <Link href="/movements" className="ui-link text-xs">
          Ver historial →
        </Link>
      </div>

      {!has_movements ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center dark:border-zinc-800">
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            No se han registrado movimientos aún.
          </p>
          <Link href="/movements/new" className="mt-3 ui-btn-secondary text-xs">
            Registrar primer movimiento
          </Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 dark:divide-zinc-800/60">
          {movements.map((mov) => {
            const config = MOVEMENT_CONFIG[mov.type] || MOVEMENT_CONFIG.IN;
            const time_str = format_relative_time(mov.createdAt || mov.date);
            const line_count = mov.lines?.length || 0;
            const main_item_name = mov.lines?.[0]?.item?.name || mov.item_name || "Artículo de inventario";
            const first_line_qty = mov.lines?.[0]?.quantity || mov.quantity || 0;

            return (
              <li key={mov.id} className="flex items-start justify-between py-3.5 gap-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 rounded-lg px-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm ${config.badge}`}>
                    {config.svg}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate dark:text-zinc-100">
                      {main_item_name}
                      {line_count > 1 ? (
                        <span className="ml-1 text-xs font-normal text-slate-500 dark:text-zinc-400">
                          (+{line_count - 1} más)
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-medium text-slate-700 dark:text-zinc-300">
                        {config.label}
                      </span>
                      {mov.reference ? (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[140px] font-mono text-[11px]">
                            {mov.reference}
                          </span>
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-sm font-bold tabular-nums ${config.iconColor}`}>
                    {config.sign}{first_line_qty}
                  </span>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    {time_str}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
