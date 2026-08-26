export function BarChart({ data = [], labelKey = "label", valueKey = "value", height = 160 }) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div className="flex h-full items-end gap-2" style={{ minHeight: height }}>
      {data.map((item) => {
        const value = Number(item[valueKey]) || 0;
        const pct = (value / max) * 100;
        return (
          <div key={item[labelKey]} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-end justify-center" style={{ height }}>
              <div
                className="w-full max-w-[48px] rounded-t-md bg-indigo-500"
                style={{ height: `${pct}%`, minHeight: value ? 4 : 0 }}
                title={`${item[labelKey]}: ${value}`}
              />
            </div>
            <span className="max-w-full truncate text-center text-[10px] text-slate-500">{item[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

export function LineChart({ data = [], labelKey = "label", valueKey = "value", height = 120 }) {
  if (!data.length) return null;
  const values = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height }} preserveAspectRatio="none">
      <polyline fill="none" stroke="#4f46e5" strokeWidth="2" points={points} />
    </svg>
  );
}
