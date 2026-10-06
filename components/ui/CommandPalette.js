"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Command Palette modal for Ctrl+K search and quick navigation.
 * @param {Object} props Component props.
 * @param {boolean} props.isOpen Controlled visibility state.
 * @param {Function} props.onClose Callback to close the modal.
 * @returns {JSX.Element | null} Rendered CommandPalette component.
 */
export function CommandPalette({ isOpen, onClose }) {
  const [query_text, set_query_text] = useState("");
  const router = useRouter();

  useEffect(() => {
    /**
     * Handles Ctrl+K / Cmd+K global shortcut.
     * @param {KeyboardEvent} e Keyboard event.
     */
    const handle_key_down = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via custom event or external handler
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handle_key_down);
    return () => {
      window.removeEventListener("keydown", handle_key_down);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quick_actions = [
    { label: "Ver catálogo de artículos", href: "/items", icon: "📦" },
    { label: "Registrar movimiento de stock", href: "/movements/new", icon: "🔄" },
    { label: "Crear nuevo artículo", href: "/items/new", icon: "➕" },
    { label: "Gestionar categorías", href: "/categories", icon: "🏷️" },
    { label: "Gestionar ubicaciones", href: "/locations", icon: "📍" },
  ];

  const filtered_actions = quick_actions.filter((action) =>
    action.label.toLowerCase().includes(query_text.toLowerCase())
  );

  /**
   * Executes navigation and closes modal.
   * @param {string} target_href Destination path.
   */
  const handle_navigate = (target_href) => {
    onClose();
    router.push(target_href);
  };

  /**
   * Performs search query redirect.
   * @param {React.FormEvent} e Form event.
   */
  const handle_search_submit = (e) => {
    e.preventDefault();
    if (!query_text.trim()) return;
    onClose();
    router.push(`/items?q=${encodeURIComponent(query_text.trim())}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Paleta de comandos"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-slate-900/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handle_search_submit} className="relative flex items-center border-b border-slate-200 px-4 dark:border-zinc-800">
          <svg
            className="h-5 w-5 text-slate-400 shrink-0 dark:text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            autoFocus
            value={query_text}
            onChange={(e) => set_query_text(e.target.value)}
            placeholder="Buscar por artículo, SKU, categoría o comando..."
            className="w-full border-0 bg-transparent py-4 pl-3 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <kbd className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            ESC
          </kbd>
        </form>

        <div className="max-h-72 overflow-y-auto p-2">
          {filtered_actions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400">
              No se encontraron comandos para &quot;{query_text}&quot;. Presiona Enter para buscar en el catálogo.
            </div>
          ) : (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Navegación Rápida
              </p>
              {filtered_actions.map((act) => (
                <button
                  key={act.href}
                  type="button"
                  onClick={() => handle_navigate(act.href)}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800/80 transition-colors"
                >
                  <span className="text-base">{act.icon}</span>
                  <span className="font-medium flex-1">{act.label}</span>
                  <span className="text-xs text-slate-400 dark:text-zinc-500">Ir →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
