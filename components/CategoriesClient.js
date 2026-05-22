"use client";

import { useState } from "react";
import { isDemoReadonly } from "@/lib/demo";
import { useToast } from "@/components/ToastProvider";

/** CRUD ligero de categorías vía API (demo sin login). */
export function CategoriesClient({ initial_rows = [] }) {
  const readonly = isDemoReadonly();
  const [rows, setRows] = useState(initial_rows);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  /** Refresca la tabla tras crear o eliminar categorías. */
  async function fetch_rows() {
    const r = await fetch("/api/categories");
    setRows(await r.json());
  }

  async function onCreate(e) {
    e.preventDefault();
    if (readonly) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Error");
        return;
      }
      setName("");
      showToast("Categoría creada", "success");
      await fetch_rows();
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    if (readonly) return;
    if (!confirm("¿Eliminar categoría?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      showToast(d.error || "No se pudo eliminar", "error");
      return;
    }
    showToast("Categoría eliminada", "success");
    await fetch_rows();
  }

  return (
    <div className="space-y-6">
      {readonly ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          Demo en <strong>solo lectura</strong>: no se pueden crear ni eliminar
          categorías.
        </p>
      ) : null}
      <form
        onSubmit={onCreate}
        className="ui-card flex flex-col gap-4 p-5 sm:flex-row sm:items-end"
      >
        <label className="block flex-1">
          <span className="ui-label">Nueva categoría</span>
          <input
            className="ui-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
            required
            disabled={readonly}
          />
        </label>
        <button
          type="submit"
          disabled={readonly || loading}
          className="ui-btn-primary shrink-0 px-6 disabled:opacity-50"
        >
          Añadir
        </button>
      </form>
      {error ? (
        <p className="text-sm font-medium text-red-700">{error}</p>
      ) : null}

      <div className="ui-table-shell">
        <table className="min-w-full text-left text-sm">
          <thead className="ui-table-head">
            <tr>
              <th className="px-4 py-3.5 font-semibold">Nombre</th>
              <th className="px-4 py-3.5 font-semibold">Artículos</th>
              <th className="px-4 py-3.5 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3.5 font-medium text-slate-900">
                  {c.name}
                </td>
                <td className="px-4 py-3.5 text-slate-600">
                  {c._count?.items ?? "—"}
                </td>
                <td className="px-4 py-3.5 text-right">
                  {readonly ? (
                    <span className="text-xs text-slate-400">—</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onDelete(c.id)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
