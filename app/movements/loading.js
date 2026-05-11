/**
 * Skeleton loading para el historial de movimientos.
 */
export default function MovementsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-1 h-4 w-56 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="ml-auto h-4 w-24 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="mt-4 space-y-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex gap-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
