"use client";

import { useState, useCallback } from "react";

/**
 * Botón que descarga el listado actual de artículos como CSV.
 * Hace un fetch a GET /api/items y convierte el JSON a CSV descargable.
 */
export function ExportCsvButton() {
  const [loading, set_loading] = useState(false);

  const handle_export = useCallback(async () => {
    set_loading(true);
    try {
      const res = await fetch("/api/items");
      if (!res.ok) throw new Error("Error al obtener datos");
      const items = await res.json();

      // Encabezados del CSV
      const headers = ["SKU", "Nombre", "Categoría", "Unidad", "Stock total", "Stock mínimo", "Código barras"];

      // Filas
      const rows = items.map((item) => [
        item.sku,
        `"${(item.name || "").replace(/"/g, '""')}"`,
        `"${(item.category?.name || "").replace(/"/g, '""')}"`,
        item.unit || "u",
        item.totalQuantity ?? 0,
        item.minStock ?? 0,
        item.barcode || "",
      ]);

      const bom = "\uFEFF";
      const csv = bom + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventario_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silencioso — el usuario ve que no pasó nada
    } finally {
      set_loading(false);
    }
  }, []);

  return (
    <button
      type="button"
      onClick={handle_export}
      disabled={loading}
      className="ui-btn-secondary gap-2 text-sm"
    >
      {loading ? (
        <span>Generando…</span>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar CSV
        </>
      )}
    </button>
  );
}
