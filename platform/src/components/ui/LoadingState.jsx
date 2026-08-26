import { Skeleton, TableSkeleton } from "./Skeleton";

export function LoadingState({ label = "Loading...", table = false, rows = 5, cols = 4 }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="text-sm text-slate-600">{label}</p>
      </div>
      {table ? <TableSkeleton rows={rows} cols={cols} /> : <Skeleton className="h-24" />}
    </div>
  );
}
