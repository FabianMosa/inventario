import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";

/** Historial de movimientos con líneas expandidas */
export default async function MovementsPage() {
  const movements = await prisma.movement.findMany({
    take: 40,
    orderBy: { createdAt: "desc" },
    include: {
      lines: {
        include: {
          item: true,
          fromLocation: true,
          toLocation: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Movimientos"
        description="Últimos registros del inventario"
        actions={
          <Link href="/movements/new" className="ui-btn-primary">
            Nuevo movimiento
          </Link>
        }
      />

      <div className="space-y-5">
        {movements.length === 0 ? (
          <div className="ui-card px-6 py-14 text-center text-slate-600">
            No hay movimientos.{" "}
            <Link href="/movements/new" className="ui-link">
              Registrar el primero
            </Link>
          </div>
        ) : (
          movements.map((m) => (
            <article key={m.id} className="ui-card overflow-hidden">
              <div className="flex flex-col gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-brand-50/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                    {m.type}
                  </span>
                  <time className="text-sm font-medium text-slate-600">
                    {new Date(m.createdAt).toLocaleString("es")}
                  </time>
                </div>
                {m.reference ? (
                  <span className="text-sm text-slate-500">
                    Ref:{" "}
                    <span className="font-mono text-slate-700">{m.reference}</span>
                  </span>
                ) : null}
              </div>
              {m.notes ? (
                <p className="border-b border-slate-100 px-5 py-3 text-sm text-slate-600">
                  {m.notes}
                </p>
              ) : null}
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-slate-600">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Artículo</th>
                      <th className="px-5 py-3 font-semibold">Cant.</th>
                      <th className="hidden px-5 py-3 font-semibold sm:table-cell">
                        Origen
                      </th>
                      <th className="hidden px-5 py-3 font-semibold sm:table-cell">
                        Destino
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {m.lines.map((line) => (
                      <tr key={line.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-3">
                          <span className="font-semibold text-slate-900">
                            {line.item.name}
                          </span>
                          <span className="ml-2 font-mono text-xs text-slate-500">
                            {line.item.sku}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-medium">{line.quantity}</td>
                        <td className="hidden px-5 py-3 sm:table-cell">
                          {line.fromLocation?.name ?? "—"}
                        </td>
                        <td className="hidden px-5 py-3 sm:table-cell">
                          {line.toLocation?.name ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
