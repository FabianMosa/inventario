import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { ItemSearch } from "@/components/ItemSearch";
import { FloatingScanner } from "@/components/FloatingScanner";
import { SafeImage } from "@/components/SafeImage";
import { StockBadge } from "@/components/ui/StockBadge";
import { isDemoReadonly } from "@/lib/demo";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { clean_string, parse_take, to_non_negative_int } from "@/lib/validation";

const PAGE_SIZE = 15;

/** Builds URL preserving existing search params. */
function pageUrl(base, params) {
  const url = new URL(base, "http://n");
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  return url.pathname + url.search;
}

/** Items list page with search, pagination, total stock and stock status badges (SSR). */
export default async function ItemsPage({ searchParams }) {
  const readonly = isDemoReadonly();
  const sp = await searchParams;
  const q = (sp?.q ?? "").trim();
  const category_id = clean_string(sp?.categoryId, 64, "categoryId");
  const skip = to_non_negative_int(sp?.skip, 0);
  const take = parse_take(sp?.take, { max: PAGE_SIZE, default_value: PAGE_SIZE });

  const where = {
    active: true,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { barcode: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category_id ? { categoryId: category_id } : {}),
  };

  const [items, total, selected_category] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take,
      include: {
        category: true,
        balances: { include: { location: true } },
      },
    }),
    prisma.item.count({ where }),
    category_id
      ? prisma.category.findUnique({ where: { id: category_id } })
      : Promise.resolve(null),
  ]);

  const desc_parts = [];
  if (q) desc_parts.push(`Resultados para "${q}"`);
  if (selected_category) desc_parts.push(`Categoría: ${selected_category.name}`);
  desc_parts.push(`${total} artículos`);
  const description = desc_parts.join(" · ");

  const page = Math.floor(skip / take) + 1;
  const total_pages = Math.ceil(total / take);
  const has_next = skip + take < total;
  const has_prev = skip > 0;

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title={selected_category ? selected_category.name : "Catálogo de Artículos"}
        description={description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ExportCsvButton />
            {readonly ? (
              <span className="rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                Solo lectura
              </span>
            ) : (
              <Link href="/items/new" className="ui-btn-primary">
                + Nuevo artículo
              </Link>
            )}
          </div>
        }
      />

      <ItemSearch />

      {selected_category ? (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {selected_category.name}
          </span>
          <Link href="/items" className="text-xs text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 underline-offset-2 hover:underline">
            Limpiar filtro
          </Link>
        </div>
      ) : null}

      <div className="ui-table-shell">
        <table className="min-w-full text-left text-sm">
          <thead className="ui-table-head">
            <tr>
              <th className="w-12 px-2 py-3.5 sm:px-4" />
              <th className="px-4 py-3.5 font-semibold">SKU</th>
              <th className="px-4 py-3.5 font-semibold">Nombre</th>
              <th className="hidden px-4 py-3.5 font-semibold sm:table-cell">Categoría</th>
              <th className="px-4 py-3.5 font-semibold">Estado</th>
              <th className="px-4 py-3.5 font-semibold">Stock</th>
              <th className="px-4 py-3.5 font-semibold">Mín.</th>
              <th className="px-4 py-3.5 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500 dark:text-zinc-400">
                  {q ? (
                    <>No se encontraron artículos para &ldquo;{q}&rdquo;</>
                  ) : selected_category ? (
                    <>No hay artículos en la categoría &ldquo;{selected_category.name}&rdquo;</>
                  ) : (
                    <>
                      No hay artículos creados. Registrá uno nuevo o ejecutá{" "}
                      <code className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                        npm run db:seed
                      </code>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const total_stock = item.balances.reduce((s, b) => s + b.quantity, 0);
                const status = total_stock === 0 ? "out_of_stock" : total_stock < item.minStock ? "low_stock" : "in_stock";

                return (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                    <td className="px-2 py-3.5 sm:px-4">
                      {item.imageUrl ? (
                        <SafeImage
                          src={item.imageUrl}
                          alt=""
                          className="h-10 w-10 rounded-lg border border-slate-200 object-cover dark:border-zinc-700"
                          fallback={
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 dark:bg-zinc-800">
                              —
                            </span>
                          }
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 dark:bg-zinc-800">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-700 dark:text-zinc-400">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-zinc-100">
                      <div className="flex items-center gap-2">
                        <Link href={`/items/${item.id}`} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                          {item.name}
                        </Link>
                        {item.barcode ? (
                          <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:inline dark:bg-zinc-800 dark:text-zinc-400">
                            {item.barcode}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3.5 text-slate-600 sm:table-cell dark:text-zinc-400">
                      {item.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StockBadge status={status} />
                    </td>
                    <td className="px-4 py-3.5 tabular-nums font-bold text-slate-900 dark:text-zinc-100">
                      {total_stock}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-slate-500 dark:text-zinc-400">
                      {item.minStock}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/items/${item.id}`} className="ui-link text-xs">
                          Detalle →
                        </Link>
                        <Link
                          href={`/items/${item.id}/label`}
                          className="hidden text-xs text-slate-400 hover:text-slate-600 sm:inline dark:text-zinc-500 dark:hover:text-zinc-300"
                          title="Imprimir etiqueta"
                        >
                          🏷️
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total_pages > 1 ? (
        <nav className="flex items-center justify-center gap-2" aria-label="Paginación">
          <Link
            href={pageUrl("/items", { q: q || null, categoryId: category_id || null, skip: has_prev ? String(skip - take) : null, take: String(take) })}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-medium transition ${
              has_prev ? "ui-btn-secondary" : "pointer-events-none opacity-40"
            }`}
            aria-disabled={!has_prev}
          >
            ←
          </Link>

          {Array.from({ length: total_pages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === total_pages || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => (
              <span key={p} className="contents">
                {idx > 0 && arr[idx - 1] !== p - 1 ? (
                  <span className="px-1 text-slate-400 dark:text-zinc-500">···</span>
                ) : null}
                {p === page ? (
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-xs font-bold text-white shadow-md">
                    {p}
                  </span>
                ) : (
                  <Link
                    href={pageUrl("/items", { q: q || null, categoryId: category_id || null, skip: String((p - 1) * take), take: String(take) })}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    {p}
                  </Link>
                )}
              </span>
            ))}

          <Link
            href={pageUrl("/items", { q: q || null, categoryId: category_id || null, skip: has_next ? String(skip + take) : null, take: String(take) })}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-medium transition ${
              has_next ? "ui-btn-secondary" : "pointer-events-none opacity-40"
            }`}
            aria-disabled={!has_next}
          >
            →
          </Link>
        </nav>
      ) : null}

      <FloatingScanner />
    </div>
  );
}
