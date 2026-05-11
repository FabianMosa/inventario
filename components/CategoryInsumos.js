"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Panel de categorías en el dashboard.
 * Muestra una grilla de tarjetas que linkean a /items?categoryId=<id>
 * para ver los insumos de esa categoría.
 */
export function CategoryInsumos() {
  const [categories, set_categories] = useState([]);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar categorías");
        return r.json();
      })
      .then(set_categories)
      .catch((e) => set_error(e.message))
      .finally(() => set_loading(false));
  }, []);

  return (
    <div>
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
              aria-hidden
            />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      ) : categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
          No hay categorías creadas todavía.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/items?categoryId=${encodeURIComponent(cat.id)}`}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-brand-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-600"
            >
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {cat.name}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {cat._count?.items ?? 0}{" "}
                {cat._count?.items === 1 ? "insumo" : "insumos"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
