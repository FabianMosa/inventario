"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Modal de escaneo de código de barras usando `html5-qrcode`.
 * Soporta EAN, UPC, Code128, Code39, ITF, Codabar y QR.
 *
 * Se carga la librería de forma dinámica para no incluirla en el bundle inicial
 * (solo se descarga si el usuario abre el escáner).
 *
 * @param {{ onDetected: (barcode: string) => void; onClose: () => void }} props
 */
export function BarcodeScanner({ onDetected, onClose }) {
  const container_ref = useRef(null);
  const scanner_ref = useRef(null);
  const [error, set_error] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        // `Html5QrcodeSupportedFormats` es un enum exportado por la librería.
        // Antes el código intentaba `Html5Qrcode.getSupportedFormats().EAN_13`,
        // método que no existe en esta versión, y la página crasheaba con
        // "Cannot read properties of undefined (reading 'EAN_13')".
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
          "html5-qrcode"
        );

        if (cancelled || !container_ref.current) return;

        const scanner = new Html5Qrcode("barcode-reader");
        scanner_ref.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 280, height: 120 },
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.CODE_93,
              Html5QrcodeSupportedFormats.ITF,
              Html5QrcodeSupportedFormats.CODABAR,
              Html5QrcodeSupportedFormats.QR_CODE,
            ],
          },
          (decoded_text) => {
            scanner.stop().catch(() => {});
            if (!cancelled) onDetected(decoded_text);
          },
          () => {}
        );
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof Error ? e.message : "No se pudo iniciar la cámara";
        console.error("BarcodeScanner error:", e);
        set_error(
          /permission|denied|notallowed/i.test(msg)
            ? "Permiso de cámara denegado. Habilítalo en el navegador para escanear."
            : `No se pudo iniciar la cámara: ${msg}`
        );
      }
    }

    start();

    return () => {
      cancelled = true;
      scanner_ref.current?.stop().catch(() => {});
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
        <div className="p-4 text-center text-sm text-slate-400">
          {error ? (
            <span className="text-red-300">{error}</span>
          ) : (
            "Apuntá al código de barras del producto"
          )}
        </div>
        <div
          id="barcode-reader"
          ref={container_ref}
          className="w-full aspect-[4/3]"
        />
        <div className="flex justify-center p-4">
          <button
            type="button"
            onClick={onClose}
            className="ui-btn-secondary border-slate-600 text-white hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
