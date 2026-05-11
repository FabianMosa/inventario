"use client";

import { useState } from "react";

/**
 * Imagen <img> tolerante a errores de carga.
 *
 * Es un Client Component porque usa `onError` para ocultar el elemento
 * cuando la URL falla (no se pueden pasar event handlers desde Server
 * Components en React Server Components / Next.js App Router).
 *
 * Acepta cualquier prop nativa de <img>; si la carga falla, no renderiza nada
 * (o el `fallback` recibido) en lugar de mostrar el icono de imagen rota.
 *
 * @param {{
 *   src: string,
 *   alt?: string,
 *   className?: string,
 *   width?: number | string,
 *   height?: number | string,
 *   fallback?: import("react").ReactNode,
 * } & import("react").ImgHTMLAttributes<HTMLImageElement>} props
 */
export function SafeImage({ src, alt = "", fallback = null, ...rest }) {
  const [failed, set_failed] = useState(false);

  if (!src || failed) return fallback;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => set_failed(true)}
      {...rest}
    />
  );
}
