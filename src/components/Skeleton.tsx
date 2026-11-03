/** Khung xương hiển thị trong loading.tsx (Suspense boundary của route). */
export function ListSkeleton({ rows = 5, label = "Đang tải…" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">{label}</span>
      <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="card flex items-center justify-between p-4">
            <div className="w-2/3 space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-48 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
