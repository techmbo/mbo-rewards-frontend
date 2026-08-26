import { useMemo, useState } from "react";
import { fetchApi, postApi } from "../../api";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Input, Select } from "../../components/ui/FormControls";
import { displayMoney, displayText } from "../../utils/display";

/**
 * One reconciliation page, two modes:
 * A) FT identity drill-down (existing)
 * B) Network Reported → Confirmed → Paid (NetworkReconciliationRow)
 */
export function ReconciliationPage() {
  const [mode, setMode] = useState("network");

  return (
    <PageLayout
      title="Reconciliation"
      subtitle="Compare confirmed network commission, network payment evidence, actual MBO receipt and client payable eligibility."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <span className="font-medium text-slate-900">Confirmed Orders</span>
        <span className="text-slate-400">→</span>
        <span className="font-medium text-slate-900">Network Invoice</span>
        <span className="text-slate-400">→</span>
        <span className="font-medium text-slate-900">Network Payment</span>
        <span className="text-slate-400">→</span>
        <span className="font-medium text-slate-900">MBO Receipt</span>
        <span className="text-slate-400">→</span>
        <span className="font-medium text-slate-900">Client Payable</span>
      </div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-sm ${mode === "network" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white"}`}
          onClick={() => setMode("network")}
        >
          Network R / C / P
        </button>
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-sm ${mode === "ft" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white"}`}
          onClick={() => setMode("ft")}
        >
          FT identity
        </button>
      </div>
      {mode === "network" ? <NetworkReconPanel /> : <FtIdentityPanel />}
    </PageLayout>
  );
}

function NetworkReconPanel() {
  const [filters, setFilters] = useState({ billingMonth: "", billingYear: "", network: "" });
  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v != null)),
    [filters],
  );
  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/ops/finance/reconcile/network",
    queryFilters,
    { pageSize: 25 },
  );
  const [msg, setMsg] = useState("");
  const [rebuilding, setRebuilding] = useState(false);

  async function rebuild() {
    setMsg("");
    setRebuilding(true);
    try {
      await postApi("/ops/finance/reconcile/network/rebuild", {
        billingMonth: filters.billingMonth || undefined,
        billingYear: filters.billingYear || undefined,
      });
      setMsg("Rebuild complete");
      reload();
    } catch (err) {
      setMsg(err.message || "Rebuild failed");
    } finally {
      setRebuilding(false);
    }
  }

  const columns = useMemo(
    () => [
      { key: "network", label: "Network Source", render: (r) => displayText(r.network) },
      { key: "networkAccount", label: "Network Account", render: (r) => displayText(r.networkAccount) },
      {
        key: "period",
        label: "Billing Period",
        render: (r) => `${r.billingMonth ?? "—"} / ${r.billingYear ?? "—"}`,
      },
      { key: "brandName", label: "Brand Name", render: (r) => displayText(r.brandName) },
      { key: "campaignName", label: "Campaign Name", render: (r) => displayText(r.campaignName) },
      {
        key: "reported",
        label: "Network Reported",
        className: "tabular-nums",
        render: (r) => displayMoney(r.reported, r.currency),
      },
      {
        key: "confirmed",
        label: "Confirmed Commission",
        className: "tabular-nums",
        render: (r) => displayMoney(r.confirmed, r.currency),
      },
      {
        key: "paid",
        label: "Network Paid",
        className: "tabular-nums",
        render: (r) => displayMoney(r.paid, r.currency),
      },
      {
        key: "reportedVsConfirmed",
        label: "Reported − Confirmed",
        className: "tabular-nums",
        render: (r) => displayMoney(r.reportedVsConfirmed, r.currency),
      },
      {
        key: "confirmedVsPaid",
        label: "Confirmed − Paid",
        className: "tabular-nums",
        render: (r) => displayMoney(r.confirmedVsPaid, r.currency),
      },
      {
        key: "status",
        label: "Recon Status",
        render: (r) => displayText(r.status),
      },
    ],
    [],
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Network Reported → Confirmed → Paid. Rebuild uses the latest order month when billing filters are empty.
      </p>
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Billing month"
          value={filters.billingMonth}
          onChange={(e) => setFilters((f) => ({ ...f, billingMonth: e.target.value }))}
        />
        <Input
          placeholder="Billing year"
          value={filters.billingYear}
          onChange={(e) => setFilters((f) => ({ ...f, billingYear: e.target.value }))}
        />
        <Select
          value={filters.network}
          onChange={(e) => setFilters((f) => ({ ...f, network: e.target.value }))}
          options={[
            { value: "", label: "All networks" },
            { value: "OPTIMISE", label: "Optimise" },
            { value: "BOOSTINY", label: "Boostiny" },
            { value: "TRACKIER", label: "Trackier" },
            { value: "PARTNERIZE", label: "Partnerize" },
            { value: "IMPACT", label: "Impact" },
          ]}
        />
        <button
          type="button"
          className="rounded bg-slate-800 px-3 py-2 text-sm text-white disabled:opacity-60"
          onClick={rebuild}
          disabled={rebuilding}
        >
          {rebuilding ? "Rebuilding…" : "Rebuild"}
        </button>
      </div>
      {msg ? <p className="text-sm text-slate-600">{msg}</p> : null}
      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No network reconciliation rows"
        emptyDescription="Open this page again or click Rebuild — rows are built from orders and network performance for the billing period."
        page={page}
        onPageChange={setPage}
        totalPages={pagination?.totalPages}
        total={pagination?.total}
        onRefresh={reload}
      />
    </div>
  );
}

function FtIdentityPanel() {
  const [level, setLevel] = useState("client");
  const [id, setId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function run() {
    setError(null);
    setResult(null);
    try {
      let path = "";
      if (level === "transaction") path = `/ops/finance/reconcile/transaction/${id}`;
      else if (level === "conversion") path = `/ops/finance/reconcile/conversion/${id}`;
      else if (level === "client") path = `/ops/finance/reconcile/client/${id}`;
      else path = `/ops/finance/reconcile/supplier/${id}`;
      const json = await fetchApi(path);
      setResult(json.data);
    } catch (err) {
      setError(err.message || "Reconciliation failed");
    }
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-600">Drill-down financial transaction identity reconciliation.</p>
      <div className="mb-4 flex flex-wrap gap-2">
        <select className="rounded border px-2 py-1" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="transaction">Transaction</option>
          <option value="conversion">Conversion</option>
          <option value="client">Client</option>
          <option value="supplier">Supplier</option>
        </select>
        <input
          className="rounded border px-2 py-1"
          placeholder="ID / supplier key"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button type="button" className="rounded bg-slate-800 px-3 py-1 text-white" onClick={run}>
          Reconcile
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {result ? (
        <pre className="rounded border bg-white p-4 text-xs">{JSON.stringify(result, null, 2)}</pre>
      ) : null}
    </div>
  );
}
