import { useMemo, useState } from "react";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Input, Select } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { KpiGrid, KpiStat } from "../../components/ui/KpiStat";
import { displayMoney, displayNumber, displayText } from "../../utils/display";
import { usePagedQuery } from "../../hooks/usePagedQuery";

const NETWORKS = [
  { value: "OPTIMISE", label: "Optimise" },
  { value: "IMPACT", label: "Impact" },
  { value: "PARTNERIZE", label: "Partnerize" },
  { value: "TRACKIER", label: "Trackier" },
  { value: "vCommission", label: "vCommission" },
  { value: "BOOSTINY", label: "Boostiny" },
];

/**
 * v13 MBO Receipts — internal evidence of funds received by MBO.
 * Built only from PAID network payment rows (never invents bank deposits).
 */
export function AdminMboReceiptsPage() {
  const [filters, setFilters] = useState({
    network: "",
    billing_month: "",
    billing_year: "",
    q: "",
  });

  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v != null)),
    [filters],
  );

  const { rows, loading, error, reload, refresh, page, setPage, pagination, extras } = usePagedQuery(
    "/ops/admin/mbo-receipts",
    queryFilters,
    { pageSize: 25 },
  );

  const kpis = extras?.kpis || {};

  const columns = useMemo(
    () => [
      {
        key: "mboReceiptId",
        label: "MBO Receipt ID",
        minWidth: 120,
        render: (r) => displayText(r.mboReceiptId),
      },
      {
        key: "networkSource",
        label: "Network Source",
        minWidth: 110,
        render: (r) => displayText(r.networkSource || r.network),
      },
      {
        key: "networkPaymentReference",
        label: "Network Payment Reference",
        minWidth: 170,
        render: (r) => displayText(r.networkPaymentReference),
      },
      {
        key: "mboReceivedDateTime",
        label: "MBO Received Date / Time",
        minWidth: 170,
        render: (r) => displayText(r.mboReceivedDateTime),
      },
      {
        key: "amountReceived",
        label: "Amount Received",
        minWidth: 130,
        className: "tabular-nums",
        render: (r) => displayMoney(r.amountReceived, r.currency),
      },
      {
        key: "currency",
        label: "Currency",
        minWidth: 90,
        render: (r) => displayText(r.currency),
      },
      {
        key: "evidenceSource",
        label: "Evidence Source",
        minWidth: 200,
        render: (r) => displayText(r.evidenceSource),
      },
      {
        key: "reconciliationStatus",
        label: "Reconciliation Status",
        minWidth: 150,
        render: (r) => <StatusPill status={r.reconciliationStatus} />,
      },
      {
        key: "recordedBy",
        label: "Recorded By",
        minWidth: 110,
        render: (r) => displayText(r.recordedBy),
      },
    ],
    [],
  );

  return (
    <PageLayout
      eyebrow="Finance"
      title="MBO Receipts"
      subtitle="Internal evidence of actual funds received by MBO from bank/reconciliation facts only."
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Select
          value={filters.network}
          onChange={(e) => setFilters((p) => ({ ...p, network: e.target.value }))}
          label="Network Source"
          options={[{ value: "", label: "All Networks" }, ...NETWORKS]}
        />
        <Select
          value={filters.billing_month}
          onChange={(e) => setFilters((p) => ({ ...p, billing_month: e.target.value }))}
          label="Billing Month"
          options={[
            { value: "", label: "All" },
            ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
          ]}
        />
        <Input
          value={filters.billing_year}
          onChange={(e) => setFilters((p) => ({ ...p, billing_year: e.target.value }))}
          label="Billing Year"
          placeholder="e.g. 2026"
        />
        <Input
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
          label="Search"
          placeholder="Receipt, payment ref"
        />
      </div>

      <KpiGrid>
        <KpiStat label="Receipts" value={displayNumber(kpis.receiptCount)} loading={loading} />
        <KpiStat
          label="Amount received"
          value={displayMoney(kpis.amountReceived, kpis.currency)}
          loading={loading}
          tone="success"
        />
        <KpiStat label="Matched" value={displayNumber(kpis.matched)} loading={loading} tone="info" />
      </KpiGrid>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={refresh}
          emptyTitle="No MBO receipts"
          emptyDescription="Receipts appear only when a bank/reconciliation fact records MBO actual receipt."
          page={page}
          onPageChange={setPage}
          totalPages={pagination?.totalPages}
          total={pagination?.total}
          onRefresh={refresh}
          searchable={false}
        />
      </div>
    </PageLayout>
  );
}
