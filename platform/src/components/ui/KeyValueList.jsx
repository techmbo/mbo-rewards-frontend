/**
 * Two-column key/value rows for Open drawers.
 * Label column wraps; value column is isolated so long URLs cannot overlap labels.
 */
export function KeyValueRow({ label, children }) {
  return (
    <div className="grid grid-cols-1 items-start gap-1 px-3 py-2.5 sm:grid-cols-[minmax(0,11.5rem)_minmax(0,1fr)] sm:gap-x-4">
      <dt className="min-w-0 max-w-full break-words text-[11px] font-semibold leading-snug text-slate-500">
        {label}
      </dt>
      <dd className="min-w-0 max-w-full overflow-hidden break-words text-sm leading-relaxed text-slate-800 [overflow-wrap:anywhere]">
        {children ?? "—"}
      </dd>
    </div>
  );
}

export function KeyValueList({ children, empty = "No fields." }) {
  if (!children || (Array.isArray(children) && children.length === 0)) {
    return <p className="text-sm text-slate-500">{empty}</p>;
  }
  return (
    <dl className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
      {children}
    </dl>
  );
}
