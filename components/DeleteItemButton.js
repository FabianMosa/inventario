"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Elimina artículo solo si no tiene movimientos (API devuelve 409 si aplica). */
export function DeleteItemButton({ itemId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onDelete() {
    if (!confirm("¿Eliminar este artículo y sus saldos?")) return;
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setMsg(d.error || "No se pudo eliminar");
        return;
      }
      router.push("/items");
      router.refresh();
    } catch {
      setMsg("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-red-200/90 bg-gradient-to-br from-red-50 to-white p-5 shadow-soft">
      <p className="text-sm font-bold text-red-900">Zona peligrosa</p>
      {msg ? (
        <p className="mt-2 text-sm font-medium text-red-800" role="status">
          {msg}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onDelete}
        disabled={loading}
        className="mt-4 rounded-xl border-2 border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:opacity-50"
      >
        {loading ? "Eliminando…" : "Eliminar artículo"}
      </button>
    </div>
  );
}
