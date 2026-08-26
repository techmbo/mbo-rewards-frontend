import { useCallback, useEffect, useState } from "react";

export const CLIENT_NETWORK_OPTIONS = [
  { value: "OPTIMISE", label: "Optimise" },
  { value: "TRACKIER", label: "Trackier" },
  { value: "BOOSTINY", label: "Boostiny" },
  { value: "PARTNERIZE", label: "Partnerize" },
  { value: "IMPACT", label: "Impact" },
  { value: "AWIN", label: "Awin" },
];

/** FilterBar / shared def — label + "All networks" empty option. */
export const NETWORK_FILTER_DEF = {
  key: "network",
  label: "Network",
  allLabel: "All networks",
  options: CLIENT_NETWORK_OPTIONS,
};

const STORAGE_KEY = "mbo.clientOps.network";

export function readStoredClientNetwork() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function writeStoredClientNetwork(value) {
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, value);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Persist Network across Client Operations pages. */
export function useClientOpsNetworkFilter(initial = undefined) {
  const [network, setNetworkState] = useState(() =>
    initial !== undefined ? initial : readStoredClientNetwork(),
  );

  useEffect(() => {
    if (initial !== undefined) setNetworkState(initial);
  }, [initial]);

  const setNetwork = useCallback((value) => {
    const next = value == null ? "" : String(value);
    setNetworkState(next);
    writeStoredClientNetwork(next);
  }, []);

  return [network, setNetwork];
}

/**
 * Client Ops Network filter — matches Master Catalog style:
 * label "Network", default "All networks".
 */
export function NetworkFilter({
  value = "",
  onChange,
  className = "",
  selectClassName = "",
  id = "client-ops-network-filter",
}) {
  return (
    <label className={`block min-w-[160px] ${className}`.trim()} htmlFor={id}>
      <span className="mb-1 block text-sm font-medium text-slate-700">Network</span>
      <select
        id={id}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${selectClassName}`.trim()}
      >
        <option value="">All networks</option>
        {CLIENT_NETWORK_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
