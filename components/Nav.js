"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { isDemoReadonly } from "@/lib/demo";

const allLinks = [
  { href: "/", label: "Inicio" },
  { href: "/items", label: "Artículos" },
  { href: "/movements", label: "Movimientos" },
  { href: "/movements/new", label: "Nuevo movimiento" },
  { href: "/categories", label: "Categorías" },
  { href: "/locations", label: "Ubicaciones" },
];

/** En solo lectura se oculta el atajo a alta de movimiento (la ruta redirige igual). */
function getNavLinks() {
  if (isDemoReadonly()) {
    return allLinks.filter((l) => l.href !== "/movements/new");
  }
  return allLinks;
}

/** Indica enlace activo: home exacto; si la ruta coincide exactamente con otro enlace del nav, prioriza el exacto. */
function isActive(pathname, href, all_link_hrefs) {
  if (href === "/") return pathname === "/";
  if (pathname === href) return true;
  if (all_link_hrefs && all_link_hrefs.includes(pathname)) return false;
  return pathname.startsWith(href + "/");
}

/** Barra de navegación con blur, sombra suave y pill del ítem actual (responsive). */
export function Nav() {
  const pathname = usePathname();
  const links = getNavLinks();
  const { resolvedTheme, setTheme } = useTheme();
  const all_link_hrefs = links.map((l) => l.href);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 shadow-soft backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 text-sm font-extrabold text-white shadow-md shadow-brand-600/30">
            Inv
          </span>
          <span className="bg-gradient-to-r from-slate-900 to-brand-700 bg-clip-text text-transparent transition group-hover:from-brand-700 group-hover:to-brand-600 dark:from-slate-100 dark:to-brand-400">
            Inventario
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={function () {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-brand-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-brand-400"
            aria-label="Cambiar tema"
          >
            <svg className="h-4 w-4 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg className="hidden h-4 w-4 dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.71-.71M6.35 6.35l-.71-.71M12 19a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
          </button>

          <nav className="-mx-1 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:pb-0 [&::-webkit-scrollbar]:hidden" aria-label="Principal">
            {links.map(function (link) {
              const active = isActive(pathname, link.href, all_link_hrefs);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "whitespace-nowrap rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25"
                      : "whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100/90 hover:text-brand-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-brand-400"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
