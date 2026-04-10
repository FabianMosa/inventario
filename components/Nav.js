"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/items", label: "Artículos" },
  { href: "/movements", label: "Movimientos" },
  { href: "/movements/new", label: "Nuevo movimiento" },
  { href: "/categories", label: "Categorías" },
  { href: "/locations", label: "Ubicaciones" },
];

/** Indica enlace activo: home exacto; resto coincide con ruta o subrutas */
function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

/** Barra de navegación con blur, sombra suave y pill del ítem actual (responsive). */
export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 shadow-soft backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 text-sm font-extrabold text-white shadow-md shadow-brand-600/30"
            aria-hidden
          >
            Inv
          </span>
          <span className="bg-gradient-to-r from-slate-900 to-brand-700 bg-clip-text text-transparent transition group-hover:from-brand-700 group-hover:to-brand-600">
            Inventario
          </span>
        </Link>
        <nav
          className="-mx-1 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:pb-0 [&::-webkit-scrollbar]:hidden"
          aria-label="Principal"
        >
          {links.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? "whitespace-nowrap rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25"
                    : "whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100/90 hover:text-brand-700"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
