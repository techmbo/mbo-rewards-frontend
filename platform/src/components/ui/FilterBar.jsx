import { SearchInput, Select, Input } from "./FormControls";

export function FilterBar({ filters = [], values = {}, onChange, onReset, compact = false }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${
        compact ? "" : "items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      }`}
    >
      {filters.map((filter) => {
        if (filter.type === "search") {
          return (
            <SearchInput
              key={filter.key}
              className={compact ? "min-w-[180px] max-w-xs" : "min-w-[200px]"}
              value={values[filter.key] || ""}
              onChange={(v) => onChange(filter.key, v)}
              placeholder={filter.placeholder || `Search ${filter.label}`}
            />
          );
        }
        if (filter.type === "text" || filter.type === "date") {
          return (
            <Input
              key={filter.key}
              label={compact ? undefined : filter.label}
              type={filter.type === "date" ? "date" : "text"}
              className={compact ? "min-w-[120px]" : "min-w-[140px]"}
              value={values[filter.key] || ""}
              onChange={(e) => onChange(filter.key, e.target.value)}
              placeholder={filter.placeholder || filter.label}
            />
          );
        }
        return (
          <Select
            key={filter.key}
            label={compact ? undefined : filter.label}
            className={compact ? "min-w-[140px]" : "min-w-[160px]"}
            value={values[filter.key] || ""}
            onChange={(e) => onChange(filter.key, e.target.value)}
            options={[
              { value: "", label: filter.allLabel || (compact ? filter.label || "All" : "All") },
              ...(filter.options || []),
            ]}
          />
        );
      })}
      {onReset && (
        <button
          type="button"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          onClick={onReset}
        >
          Reset
        </button>
      )}
    </div>
  );
}
