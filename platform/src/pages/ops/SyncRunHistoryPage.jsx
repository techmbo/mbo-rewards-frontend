import { useMemo, useState } from "react";
import { fetchApi } from "../../api";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Input, Select } from "../../components/ui/FormControls";
import { displayText } from "../../utils/display";
import { formatDate } from "../helpers";

function StatusPill({ status }) {
  const key = String(status || "").toUpperCase();
  const tone =
    key === "SUCCESS" || key === "SUCCEEDED"
      ? "bg-emerald-100 text-emerald-800"
      : key === "PARTIAL"
        ? "bg-amber-100 text-amber-800"
        : key === "RUNNING" || key === "STARTED"
          ? "bg-blue-100 text-blue-800"
          : key === "FAILED"
            ? "bg-red-100 text-red-800"
            : "bg-slate-100 text-slate-700";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${tone}`}>{displayText(status)}</span>;
}

export function SyncRunHistoryPage() {
  const [filters, setFilters] = useState({ network: "", status: "", jobType: "" });
  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v != null)),
    [filters],
  );
  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/ops/sync-runs",
    queryFilters,
    { pageSize: 25 },
  );
  const [detail, setDetail] = useState(null);

  async function inspect(id) {
    const json = await fetchApi(`/ops/sync-runs/${id}`);
    setDetail(json.data);
  }

  const columns = useMemo(
    () => [
      { key: "network", label: "Network", render: (r) => displayText(r.network) },
      { key: "jobType", label: "Job type", render: (r) => displayText(r.jobType) },
      { key: "sourceObject", label: "Source object", render: (r) => displayText(r.sourceObject) },
      {
        key: "endpoint",
        label: "Endpoint / report",
        render: (r) => displayText(r.sourceEndpointOrReport || r.endpoint),
      },
      { key: "status", label: "Status", render: (r) => <StatusPill status={r.status} /> },
      {
        key: "fetched",
        label: "Fetched",
        className: "tabular-nums",
        render: (r) => r.recordsFetched ?? "—",
      },
      {
        key: "created",
        label: "Created",
        className: "tabular-nums",
        render: (r) => r.recordsCreated ?? "—",
      },
      {
        key: "updated",
        label: "Updated",
        className: "tabular-nums",
        render: (r) => r.recordsUpdated ?? "—",
      },
      {
        key: "unchanged",
        label: "Unchanged",
        className: "tabular-nums",
        render: (r) => r.recordsUnchanged ?? "—",
      },
      {
        key: "quarantined",
        label: "Quarantined",
        className: "tabular-nums",
        render: (r) => r.recordsQuarantined ?? "—",
      },
      {
        key: "startedAt",
        label: "Started",
        render: (r) => formatDate(r.startedAt),
      },
      {
        key: "actions",
        label: "",
        render: (r) => (
          <button type="button" className="text-blue-700 underline" onClick={() => inspect(r.syncRunId)}>
            Detail
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <PageLayout
      title="Sync Run History"
      subtitle="Every ingestion run — checkpoints, counters, retries, and rate-limit telemetry."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Network"
          value={filters.network}
          onChange={(e) => setFilters((f) => ({ ...f, network: e.target.value }))}
        />
        <Select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          options={[
            { value: "", label: "All statuses" },
            { value: "RUNNING", label: "Running" },
            { value: "SUCCESS", label: "Success" },
            { value: "PARTIAL", label: "Partial" },
            { value: "FAILED", label: "Failed" },
            { value: "CANCELLED", label: "Cancelled" },
          ]}
        />
        <Select
          value={filters.jobType}
          onChange={(e) => setFilters((f) => ({ ...f, jobType: e.target.value }))}
          options={[
            { value: "", label: "All job types" },
            { value: "CAMPAIGNS", label: "Campaigns" },
            { value: "CONVERSIONS", label: "Conversions" },
            { value: "REPORTING", label: "Reporting" },
            { value: "REPROCESS", label: "Reprocess" },
            { value: "BACKFILL", label: "Backfill" },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No sync runs"
        emptyDescription="Runs appear after automated or manual ingestion."
        page={page}
        onPageChange={setPage}
        totalPages={pagination?.totalPages}
        total={pagination?.total}
        onRefresh={reload}
      />

      {detail ? (
        <div className="mt-4 rounded border bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Run detail</h3>
          <pre className="max-h-96 overflow-auto text-xs">{JSON.stringify(detail, null, 2)}</pre>
        </div>
      ) : null}
    </PageLayout>
  );
}
