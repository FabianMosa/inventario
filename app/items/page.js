import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { ItemSearch } from "@/components/ItemSearch";
import { FloatingScanner } from "@/components/FloatingScanner";
import { SafeImage } from "@/components/SafeImage";
import { isDemoReadonly } from "@/lib/demo";

/** Listado de artículos con buscador, stock total y enlaces a detalle (SSR). */
export default async function ItemsPage({ searchParams }) {
  const readonly = isDemoReadonly();
  const q = ((await searchParams)?.q ?? "").trim();

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
  };

  const items = await prisma.item.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      category: true,
      balances: { include: { location: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Artículos"
        description={
          q
            ? `Resultados para "${q}" (${items.length})`
            : "Catálogo y saldos por ubicación"
        }
        actions={
          readonly ? (
            <span className="rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 sm:text-sm">
              Solo lectura
            </span>
          ) : (
            <Link href="/items/new" className="ui-btn-primary">
              Nuevo artículo
            </Link>
          )
        }
      />

      <ItemSearch />

      <div className="ui-table-shell">
        <table className="min-w-full text-left text-sm">
          <thead className="ui-table-head">
            <tr>
              <th className="w-12 px-2 py-3.5 sm:px-4" />
              <th className="px-4 py-3.5 font-semibold">SKU</th>
              <th className="px-4 py-3.5 font-semibold">Nombre</th>
              <th className="hidden px-4 py-3.5 font-semibold sm:table-cell">
                Categoría
              </th>
              <th className="px-4 py-3.5 font-semibold">Total</th>
              <th className="px-4 py-3.5 font-semibold">Mín.</th>
              <th className="px-4 py-3.5 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  {q ? (
                    <>No se encontraron artículos para &ldquo;{q}&rdquo;</>
                  ) : (
                    <>
                      No hay artículos. Crea uno o ejecuta{" "}
                      <code className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                        npm run db:seed
                      </code>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const total = item.balances.reduce((s, b) => s + b.quantity, 0);
                const low = total < item.minStock;
                return (
                  <tr
                    key={item.id}
                    className="transition hover:bg-brand-50/40"
                  >
                    <td className="px-2 py-3.5 sm:px-4">
                      {item.imageUrl ? (
                        <SafeImage
                          src={item.imageUrl}
                          alt=""
                          className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                          fallback={
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                              —
                            </span>
                          }
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-700">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {item.barcode ? (
                          <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:inline">
                            {item.barcode}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3.5 text-slate-600 sm:table-cell">
                      {item.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums">
                      <span
                        className={
                          low
                            ? "font-bold text-amber-800"
                            : "font-semibold text-slate-800"
                        }
                      >
                        {total}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {item.minStock}
                    </td>
                    <td className="flex gap-2 px-4 py-3.5 text-right">
                      <Link href={`/items/${item.id}`} className="ui-link text-sm">
                        Ver detalle
                      </Link>
                      <Link
                        href={`/items/${item.id}/label`}
                        className="hidden text-sm text-slate-500 hover:text-slate-700 sm:inline"
                        title="Etiqueta para imprimir"
                      >
                        🏷️
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <FloatingScanner />
    </div>
  );
}
