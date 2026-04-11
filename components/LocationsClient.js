"use client";

import { useEffect, useState } from "react";
import { isDemoReadonly } from "@/lib/demo";

/** Listado y alta de ubicaciones / almacenes */
export function LocationsClient() {
  const readonly = isDemoReadonly();
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const r = await fetch("/api/locations");
    setRows(await r.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    if (readonly) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code: code || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Error");
        return;
      }
      setName("");
      setCode("");
      await load();
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    if (readonly) return;
    if (!confirm("¿Eliminar ubicación?")) return;
    const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "No se pudo eliminar");
      return;
    }
    await load();
  }

  return (
    <div className="space-y-6">
      {readonly ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          Demo en <strong>solo lectura</strong>: no se pueden crear ni eliminar
          ubicaciones.
        </p>
      ) : null}
      <form
        onSubmit={onCreate}
        className="ui-card grid gap-4 p-5 sm:grid-cols-3"
      >
        <label className="block sm:col-span-1">
          <span className="ui-label">Nombre *</span>
          <input
            required
            className="ui-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={readonly}
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="ui-label">Código</span>
          <input
            className="ui-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Opcional"
            disabled={readonly}
          />
        </label>
        <div className="flex items-end sm:col-span-1">
          <button
            type="submit"
            disabled={readonly || loading}
            className="ui-btn-primary w-full disabled:opacity-50"
          >
            Añadir ubicación
          </button>
        </div>
      </form>
      {error ? (
        <p className="text-sm font-medium text-red-700">{error}</p>
      ) : null}

      <div className="ui-table-shell">
        <table className="min-w-full text-left text-sm">
          <thead className="ui-table-head">
            <tr>
              <th className="px-4 py-3.5 font-semibold">Nombre</th>
              <th className="px-4 py-3.5 font-semibold">Código</th>
              <th className="px-4 py-3.5 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3.5 font-medium text-slate-900">
                  {l.name}
                </td>
                <td className="px-4 py-3.5 font-mono text-slate-600">
                  {l.code ?? "—"}
                </td>
                <td className="px-4 py-3.5 text-right">
                  {readonly ? (
                    <span className="text-xs text-slate-400">—</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onDelete(l.id)}
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
