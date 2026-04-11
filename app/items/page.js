import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { isDemoReadonly } from "@/lib/demo";

/** Listado de artículos con stock total y enlaces a detalle (SSR). */
export default async function ItemsPage() {
  const readonly = isDemoReadonly();
  const items = await prisma.item.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      category: true,
      balances: { include: { location: true } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Artículos"
        description="Catálogo y saldos por ubicación"
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

      <div className="ui-table-shell">
        <table className="min-w-full text-left text-sm">
          <thead className="ui-table-head">
            <tr>
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
                  colSpan={6}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  No hay artículos. Crea uno o ejecuta{" "}
                  <code className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                    npm run db:seed
                  </code>
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
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-700">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="hidden px-4 py-3.5 text-slate-600 sm:table-cell">
                      {item.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={
                          low
                            ? "font-bold text-amber-800"
                            : "font-semibold text-slate-800"
                        }
                      >
                        {total}
                      </span>{" "}
                      <span className="text-slate-500">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {item.minStock}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/items/${item.id}`} className="ui-link text-sm">
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
