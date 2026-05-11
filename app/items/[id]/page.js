import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ItemForm } from "@/components/ItemForm";
import { DeleteItemButton } from "@/components/DeleteItemButton";
import { PageHeader } from "@/components/PageHeader";
import { SafeImage } from "@/components/SafeImage";

/** Detalle de artículo: saldos, historial reciente y edición */
export default async function ItemDetailPage({ params }) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      category: true,
      balances: { include: { location: true } },
      _count: { select: { lines: true } },
    },
  });

  if (!item) notFound();

  const history = await prisma.movementLine.findMany({
    where: { itemId: id },
    orderBy: { movement: { createdAt: "desc" } },
    take: 25,
    include: {
      movement: true,
      fromLocation: true,
      toLocation: true,
    },
  });

  const total = item.balances.reduce((s, b) => s + b.quantity, 0);
  const low = total < item.minStock;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link href="/items" className="ui-link text-sm">
            ← Volver a artículos
          </Link>
          <PageHeader
            title={item.name}
            description={
              item.category
                ? `${item.category.name} · ${item.sku}`
                : `SKU ${item.sku}`
            }
          />
        </div>
        <div className="ui-card shrink-0 px-5 py-4 lg:min-w-[200px]">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Stock total
          </p>
          <p
            className={`mt-1 text-3xl font-extrabold tabular-nums ${low ? "text-amber-800" : "text-slate-900"}`}
          >
            {total}{" "}
            <span className="text-lg font-semibold text-slate-500">
              {item.unit}
            </span>
          </p>
          {low ? (
            <p className="mt-2 text-xs font-medium text-amber-800">
              Por debajo del mínimo ({item.minStock})
            </p>
          ) : null}
        </div>
      </div>

      {item.description ? (
        <p className="max-w-3xl text-slate-700 leading-relaxed">{item.description}</p>
      ) : null}

      {/* Foto, código de barras y QR */}
      <div className="flex flex-wrap gap-6">
        {item.imageUrl ? (
          <div className="ui-card overflow-hidden p-2">
            <SafeImage
              src={item.imageUrl}
              alt={item.name}
              className="max-h-64 w-full max-w-sm rounded-xl object-contain"
            />
          </div>
        ) : null}
        {item.barcode ? (
          <div className="ui-card flex flex-col items-center gap-2 px-6 py-5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Código de barras
            </span>
            <span className="font-mono text-2xl font-bold tracking-wider text-slate-900">
              {item.barcode}
            </span>
          </div>
        ) : null}
        {/* QR del artículo */}
        <div className="ui-card flex flex-col items-center gap-2 px-5 py-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            QR
          </span>
          <SafeImage
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`/items/${item.id}`)}`}
            alt="QR del artículo"
            width={120}
            height={120}
            className="rounded-lg"
          />
          <Link
            href={`/items/${item.id}/label`}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            🏷️ Etiqueta imprimible
          </Link>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Por ubicación</h2>
        <div className="ui-table-shell">
          <table className="min-w-full text-left text-sm">
            <thead className="ui-table-head">
              <tr>
                <th className="px-4 py-3 font-semibold">Ubicación</th>
                <th className="px-4 py-3 font-semibold">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {item.balances.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                    Sin saldo registrado. Usa un movimiento de entrada.
                  </td>
                </tr>
              ) : (
                item.balances.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {b.location.name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {b.quantity} {item.unit}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          Historial de movimientos (reciente)
        </h2>
        <div className="ui-table-shell">
          <table className="min-w-full text-left text-sm">
            <thead className="ui-table-head">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Cant.</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">
                  Origen
                </th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">
                  Destino
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Aún no hay movimientos para este artículo.
                  </td>
                </tr>
              ) : (
                history.map((line) => (
                  <tr key={line.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {new Date(line.movement.createdAt).toLocaleString("es")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                        {line.movement.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {line.quantity}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {line.fromLocation?.name ?? "—"}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {line.toLocation?.name ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Editar artículo</h2>
        <ItemForm
          mode="edit"
          itemId={item.id}
          initial={{
            sku: item.sku,
            name: item.name,
            description: item.description ?? "",
            unit: item.unit,
            minStock: item.minStock,
            maxStock: item.maxStock ?? "",
            categoryId: item.categoryId ?? "",
            active: item.active,
          }}
        />
      </section>

      {item._count.lines === 0 ? (
        <DeleteItemButton itemId={item.id} />
      ) : null}
    </div>
  );
}
