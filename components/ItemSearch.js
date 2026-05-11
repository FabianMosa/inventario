"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BarcodeScanner } from "./BarcodeScanner";

/**
 * Buscador de artículos por texto o código de barras.
 * Incluye escáner integrado que lleva directo al detalle si encuentra el ítem.
 */
export function ItemSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleSearch = useCallback(
    (e) => {
      e?.preventDefault();
      if (!query.trim()) return;
      router.push(`/items?q=${encodeURIComponent(query.trim())}`);
    },
    [query, router]
  );

  const handleBarcodeDetected = useCallback(
    async (code) => {
      setShowScanner(false);
      setScanning(true);
      try {
        const res = await fetch(`/api/items?q=${encodeURIComponent(code)}`);
        const items = await res.json();
        if (Array.isArray(items) && items.length === 1) {
          // Coincidencia exacta → vamos al detalle
          router.push(`/items/${items[0].id}`);
          router.refresh();
        } else {
          // Múltiples o ningún resultado → buscamos
          setQuery(code);
          router.push(`/items?q=${encodeURIComponent(code)}`);
        }
      } catch {
        setQuery(code);
        router.push(`/items?q=${encodeURIComponent(code)}`);
      } finally {
        setScanning(false);
      }
    },
    [router]
  );

  return (
    <>
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, SKU o código de barras…"
            className="ui-input pl-9 pr-4"
          />
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
        </div>
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          disabled={scanning}
          className="ui-btn-secondary shrink-0 px-3 text-sm"
          title="Escanear código de barras"
        >
          {scanning ? "Escaneando…" : "📷 Escanear"}
        </button>
      </form>

      {showScanner ? (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      ) : null}
    </>
  );
}
