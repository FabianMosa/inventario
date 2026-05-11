"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BarcodeScanner } from "./BarcodeScanner";

/**
 * Botón flotante "Escanear" que abre la cámara desde cualquier página.
 * Al detectar un código busca el artículo y navega directo al detalle.
 */
export function FloatingScanner() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleDetected = useCallback(
    async (code) => {
      setOpen(false);
      setScanning(true);
      try {
        const res = await fetch(`/api/items?q=${encodeURIComponent(code)}`);
        const items = await res.json();
        if (Array.isArray(items) && items.length === 1) {
          router.push(`/items/${items[0].id}`);
          router.refresh();
        } else {
          router.push(`/items?q=${encodeURIComponent(code)}`);
        }
      } catch {
        router.push(`/items?q=${encodeURIComponent(code)}`);
      } finally {
        setScanning(false);
      }
    },
    [router]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={scanning}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-500 text-xl text-white shadow-xl shadow-brand-600/40 transition hover:scale-110 hover:shadow-glow active:scale-95 disabled:opacity-60"
        title="Escanear código de barras"
      >
        {scanning ? "…" : "📷"}
      </button>

      {open ? (
        <BarcodeScanner
          onDetected={handleDetected}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
