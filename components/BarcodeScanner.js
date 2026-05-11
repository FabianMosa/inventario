"use client";

import { useEffect, useRef } from "react";

/**
 * Modal de escaneo de código de barras usando html5-qrcode.
 * Soporta EAN, UPC, Code128, Code39, etc.
 * @param {{ onDetected: (barcode: string) => void; onClose: () => void }} props
 */
export function BarcodeScanner({ onDetected, onClose }) {
  const containerRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (cancelled || !containerRef.current) return;

      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 280, height: 120 },
            formatsToSupport: [
              // Formatos de código de barras más comunes
              Html5Qrcode.getSupportedFormats().EAN_13,
              Html5Qrcode.getSupportedFormats().EAN_8,
              Html5Qrcode.getSupportedFormats().UPC_A,
              Html5Qrcode.getSupportedFormats().UPC_E,
              Html5Qrcode.getSupportedFormats().CODE_128,
              Html5Qrcode.getSupportedFormats().CODE_39,
              Html5Qrcode.getSupportedFormats().CODE_93,
              Html5Qrcode.getSupportedFormats().ITF,
              Html5Qrcode.getSupportedFormats().CODABAR,
              Html5Qrcode.getSupportedFormats().QR_CODE,
            ],
          },
          (decodedText) => {
            // Detectado → notificamos y paramos
            scanner.stop().catch(() => {});
            if (!cancelled) onDetected(decodedText);
          },
          () => {
            // frame processed (no-op)
          }
        );
      } catch {
        // Sin permisos o error de cámara
        if (!cancelled) onClose();
      }
    }

    start();

    return () => {
      cancelled = true;
      scannerRef.current?.stop().catch(() => {});
    };
  }, [onDetected, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
        <div className="p-4 text-center text-sm text-slate-400">
          Apuntá al código de barras del producto
        </div>
        <div id="barcode-reader" ref={containerRef} className="w-full aspect-[4/3]" />
        <div className="flex justify-center p-4">
          <button type="button" onClick={onClose} className="ui-btn-secondary text-white border-slate-600 hover:bg-slate-800">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
