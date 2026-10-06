"use client";

import React from "react";
import Link from "next/link";

/**
 * Floating Quick Action Dock component for rapid inventory operations.
 * @param {Object} props Component props.
 * @param {Function} [props.onOpenCommandPalette] Callback to open search palette.
 * @param {Function} [props.onOpenScanner] Callback to open barcode scanner.
 * @returns {JSX.Element} Rendered QuickActionDock component.
 */
export function QuickActionDock({ onOpenCommandPalette, onOpenScanner }) {
  return (
    <aside
      aria-label="Acciones rápidas"
      className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 transform px-4"
    >
      <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-dock backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-900/90">
        {onOpenCommandPalette ? (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title="Buscar o presionar Ctrl+K"
          >
            <svg
              className="h-4 w-4 text-slate-500 transition-transform group-hover:scale-110 dark:text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">Buscar</span>
            <kbd className="hidden rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 md:inline-block dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
              ⌘K
            </kbd>
          </button>
        ) : null}

        <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800" aria-hidden />

        {onOpenScanner ? (
          <button
            type="button"
            onClick={onOpenScanner}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition hover:from-emerald-500 hover:to-teal-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Escanear</span>
          </button>
        ) : null}

        <Link
          href="/movements/new"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition hover:from-brand-500 hover:to-indigo-500"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span className="hidden sm:inline">Movimiento</span>
        </Link>

        <Link
          href="/items/new"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750"
        >
          <svg className="h-4 w-4 text-slate-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nuevo Ítem</span>
        </Link>
      </div>
    </aside>
  );
}
