"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

/**
 * Contexto global de notificaciones toast.
 * Reemplaza alert() nativos con notificaciones accesibles y auto-dismiss.
 *
 * Uso:
 * ```js
 * const { showToast } = useToast();
 * showToast("Artículo creado", "success");
 * showToast("Error al guardar", "error");
 * ```
 */

const ToastContext = createContext(null);

let toast_id = 0;

export function ToastProvider({ children }) {
  const [toasts, set_toasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    set_toasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++toast_id;
      set_toasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => remove(id), duration);
      return id;
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ showToast, remove }}>
      {children}
      {/* Toast container — fixed bottom-right, z-50 */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm transition-all duration-300 ${
              t.type === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
                : t.type === "error"
                  ? "border-red-200 bg-red-50/95 text-red-900"
                  : "border-slate-200 bg-white/95 text-slate-900"
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {t.type === "success" ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : t.type === "error" ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook para acceder a showToast desde cualquier Client Component.
 * Tipos: "success" | "error" | "info"
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
