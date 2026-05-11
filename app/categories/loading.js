/**
 * Skeleton loading para la página de categorías.
 */
export default function CategoriesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-1 h-4 w-56 animate-pulse rounded bg-slate-100" />

      {/* Form skeleton */}
      <div className="h-24 w-full animate-pulse rounded-xl bg-slate-100" />

      {/* Table skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="space-y-0 divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4">
              <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
              <div className="ml-auto h-4 w-16 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
