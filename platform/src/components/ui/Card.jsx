import { Link } from "react-router-dom";

export function Card({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, trend, to, onClick }) {
  const inner = (
    <>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value ?? "—"}</p>
      {(hint || trend) && (
        <p
          className={`mt-1 text-xs ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-500"}`}
        >
          {hint}
        </p>
      )}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-sky-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        <div className="p-5">{inner}</div>
      </Link>
    );
  }

  return (
    <Card className={`!p-0 ${onClick ? "cursor-pointer transition hover:border-sky-200 hover:shadow-md" : ""}`}>
      <div className="p-5" role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} onClick={onClick}>
        {inner}
      </div>
    </Card>
  );
}
