/** Lightweight skeleton shown inside the shell while a lazy route chunk loads. */
export function PageContentFallback() {
  return (
    <div className="animate-pulse space-y-5" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-slate-100" />
        <div className="h-8 w-56 max-w-full rounded bg-slate-100" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="h-48 rounded-xl bg-slate-100" />
    </div>
  );
}
