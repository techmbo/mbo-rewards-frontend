import { na } from "../../utils/display";

/**
 * KPI tile — displays API values only. Pass null for unavailable metrics.
 */
export function KpiStat({
  label,
  value,
  hint,
  tone = "default",
  loading = false,
}) {
  const tones = {
    default: "border-slate-200 bg-white",
    success: "border-emerald-200/80 bg-emerald-50/40",
    warning: "border-amber-200/80 bg-amber-50/40",
    info: "border-sky-200/80 bg-sky-50/40",
    muted: "border-slate-200 bg-slate-50/80",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 shadow-sm ${tones[tone] || tones.default}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-2 h-7 w-20 animate-pulse rounded bg-slate-200/80" />
      ) : (
        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {na(value)}
        </p>
      )}
      {hint ? <p className="mt-1 text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function KpiGrid({ children, className = "", columns = 4 }) {
  const colClass =
    columns === 5 ? "lg:grid-cols-5 xl:grid-cols-5" : "lg:grid-cols-4 xl:grid-cols-4";
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${colClass} ${className}`}>
      {children}
    </div>
  );
}
