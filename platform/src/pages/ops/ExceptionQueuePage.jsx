import { useEffect, useMemo, useState } from "react";
import { fetchApi, postApi } from "../../api";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { LoadingState } from "../../components/ui/LoadingState";
import { formatDate } from "../helpers";

const SEVERITY_STYLES = {
  CRITICAL: "bg-red-100 text-red-800 border-red-300",
  HIGH: "bg-orange-100 text-orange-800 border-orange-300",
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-300",
  LOW: "bg-slate-100 text-slate-700 border-slate-300",
};

function SeverityPill({ severity }) {
  const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.MEDIUM;
  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${style}`}>
      {severity || "—"}
    </span>
  );
}

const COLUMNS = [
  {
    key: "severity",
    label: "Severity",
    render: (r) => <SeverityPill severity={r.severity} />,
  },
  { key: "type", label: "Type" },
  {
    key: "requiredAction",
    label: "Required action",
    render: (r) => r.requiredAction || r.metadata?.requiredAction || "—",
  },
  { key: "supplier", label: "Supplier", render: (r) => r.supplier || "—" },
  { key: "client", label: "Client", render: (r) => r.client?.name || "—" },
  { key: "status", label: "Status" },
  { key: "detectedAt", label: "Created", render: (r) => formatDate(r.detectedAt) },
  {
    key: "age",
    label: "Age",
    render: (r) => {
      const ms = Date.now() - new Date(r.detectedAt).getTime();
      const hours = Math.max(0, Math.floor(ms / 3600000));
      return `${hours}h`;
    },
  },
];

export function ExceptionQueuePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ status: "OPEN", severity: "", type: "", supplier: "" });

  const filterParams = useMemo(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    return params;
  }, [filters]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const json = await fetchApi("/ops/exceptions", filterParams);
      setRows(json.data?.rows || []);
    } catch (err) {
      setError(err.message || "Failed to load exceptions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [JSON.stringify(filterParams)]);

  async function act(path, body) {
    await postApi(path, body || {});
    await load();
    if (selected) {
      const detail = await fetchApi(`/ops/exceptions/${selected.id}`);
      setSelected(detail.data?.record || null);
    }
  }

  return (
    <PageLayout
      eyebrow="Data Integrity"
      title="Exceptions"
      subtitle="Operational alerts with severity, required action, and contract-driven routing — auth pause, rate-limit throttle, mapping quarantine, finance blocks."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {["status", "severity", "type", "supplier"].map((key) => (
          <input
            key={key}
            className="rounded border px-2 py-1 text-sm"
            placeholder={key}
            value={filters[key]}
            onChange={(e) => setFilters((p) => ({ ...p, [key]: e.target.value }))}
          />
        ))}
        <button
          type="button"
          className={`rounded border px-3 py-1 text-sm ${filters.severity === "CRITICAL" ? "bg-red-700 text-white" : "bg-white"}`}
          onClick={() => setFilters((p) => ({ ...p, severity: p.severity === "CRITICAL" ? "" : "CRITICAL" }))}
        >
          CRITICAL
        </button>
        <button
          type="button"
          className={`rounded border px-3 py-1 text-sm ${filters.severity === "HIGH" ? "bg-orange-600 text-white" : "bg-white"}`}
          onClick={() => setFilters((p) => ({ ...p, severity: p.severity === "HIGH" ? "" : "HIGH" }))}
        >
          HIGH
        </button>
        <button type="button" className="rounded bg-slate-800 px-3 py-1 text-sm text-white" onClick={load}>
          Refresh
        </button>
      </div>
      {loading ? <LoadingState label="Loading exceptions..." /> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <DataTable
        columns={COLUMNS}
        rows={rows}
        emptyTitle="No exceptions"
        emptyDescription="Open exceptions will appear here."
        onRowClick={(row) => setSelected(row)}
      />
      {selected ? (
        <div className="mt-4 rounded border bg-white p-4 text-sm">
          <h3 className="mb-2 font-semibold">Exception detail</h3>
          <div className="mb-2 flex flex-wrap gap-2">
            <SeverityPill severity={selected.severity} />
            {selected.requiredAction || selected.metadata?.requiredAction ? (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                Action: {selected.requiredAction || selected.metadata?.requiredAction}
              </span>
            ) : null}
          </div>
          <pre className="max-h-64 overflow-auto rounded bg-slate-50 p-2 text-xs">
            {JSON.stringify(selected, null, 2)}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="rounded border px-3 py-1" onClick={() => act(`/ops/exceptions/${selected.id}/acknowledge`)}>
              Acknowledge
            </button>
            <button type="button" className="rounded border px-3 py-1" onClick={() => act(`/ops/exceptions/${selected.id}/resolve`, { reason: "Resolved in ops UI" })}>
              Resolve
            </button>
            <button type="button" className="rounded border px-3 py-1" onClick={() => act(`/ops/exceptions/${selected.id}/reopen`, { reason: "Reopened in ops UI" })}>
              Reopen
            </button>
            <button type="button" className="rounded border px-3 py-1" onClick={() => act(`/ops/exceptions/${selected.id}/retry`)}>
              Retry (if allowed)
            </button>
          </div>
        </div>
      ) : null}
    </PageLayout>
  );
}
