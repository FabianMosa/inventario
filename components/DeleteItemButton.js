"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isDemoReadonly } from "@/lib/demo";
import { useToast } from "@/components/ToastProvider";

/** Elimina artículo solo si no tiene movimientos (API devuelve 409 si aplica). */
export function DeleteItemButton({ itemId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const readonly = isDemoReadonly();
  const { showToast } = useToast();

  if (readonly) return null;

  async function onDelete() {
    if (!confirm("¿Eliminar este artículo y sus saldos?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || "No se pudo eliminar", "error");
        return;
      }
      showToast("Artículo eliminado", "success");
      router.push("/items");
      router.refresh();
    } catch {
      showToast("Error de red", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-red-200/90 bg-gradient-to-br from-red-50 to-white p-5 shadow-soft">
      <p className="text-sm font-bold text-red-900">Zona peligrosa</p>
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
