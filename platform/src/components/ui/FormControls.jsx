import { Icon } from "./Icon";

export function SearchInput({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon name="search" size={16} />
      </span>
    </div>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
      <input
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

export function Select({ label, options, error, className = "", children, ...props }) {
  const optionNodes =
    Array.isArray(options) && options.length > 0
      ? options.map((opt) => (
          <option key={String(opt.value ?? opt.label)} value={opt.value}>
            {opt.label}
          </option>
        ))
      : children;

  const wrapperClass = `block ${className}`.trim();

  if (label) {
    return (
      <label className={wrapperClass}>
        <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          {...props}
        >
          {optionNodes}
        </select>
        {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
      </label>
    );
  }

  return (
    <div className={wrapperClass}>
      <select
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        {...props}
      >
        {optionNodes}
      </select>
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </div>
  );
}
