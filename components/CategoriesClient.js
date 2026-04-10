"use client";

import { useEffect, useState } from "react";

/** CRUD ligero de categorías vía API (demo sin login). */
export function CategoriesClient() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const r = await fetch("/api/categories");
    setRows(await r.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
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
      await load();
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("¿Eliminar categoría?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "No se pudo eliminar");
      return;
    }
    await load();
  }

  return (
    <div className="space-y-6">
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
          />
        </label>
        <button
          type="submit"
          disabled={loading}
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
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
