"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * Modal de cámara: captura una foto y devuelve la imagen como data URL.
 * @param {{ onCapture: (dataUrl: string) => void; onClose: () => void }} props
 */
export function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        // Permiso denegado o sin cámara
        onClose();
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onClose]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onCapture(dataUrl);
  }, [onCapture]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-black shadow-2xl">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full aspect-[4/3] object-cover bg-slate-900"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="flex items-center justify-center gap-4 p-4">
          <button
            type="button"
            onClick={capture}
            className="ui-btn-primary px-8"
          >
            Tomar foto
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ui-btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
