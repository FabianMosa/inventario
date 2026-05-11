"use client";

/**
 * Botón que dispara `window.print()` del navegador.
 *
 * Es un Client Component aislado porque `onClick` no se puede pasar como prop
 * desde un Server Component (regla de React Server Components en Next.js App
 * Router). Se usa en `app/items/[id]/label/page.js`, que sigue siendo SSR para
 * que el QR y los datos del artículo se rendericen en servidor.
 *
 * @param {{
 *   label?: string,
 *   className?: string,
 * }} props
 */
export function PrintButton({ label = "Imprimir", className }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      {label}
    </button>
  );
}
