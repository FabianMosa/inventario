/**
 * Skeleton loading para el listado de artículos.
 * Mientras `ItemsPage` resuelve la query a Prisma, Next.js muestra este fallback
 * gracias al layout de Suspense automático del App Router.
 */
export default function ItemsLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-1 h-4 w-72 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200" />
      </div>

      {/* Search skeleton */}
      <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />

      {/* Table skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="space-y-0 divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
              <div className="hidden h-4 w-24 animate-pulse rounded bg-slate-200 sm:block" />
              <div className="ml-auto h-4 w-12 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
