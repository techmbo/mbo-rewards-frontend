import { useMemo, useState } from "react";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Input, Select } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { KpiGrid, KpiStat } from "../../components/ui/KpiStat";
import { Button } from "../../components/ui/Button";
import { displayDate, displayMoney, displayNumber, displayText } from "../../utils/display";
import { usePagedQuery } from "../../hooks/usePagedQuery";

const NETWORKS = [
  { value: "OPTIMISE", label: "Optimise" },
  { value: "IMPACT", label: "Impact" },
  { value: "PARTNERIZE", label: "Partnerize" },
  { value: "TRACKIER", label: "Trackier" },
  { value: "vCommission", label: "vCommission" },
  { value: "BOOSTINY", label: "Boostiny" },
];

const RECON_STATUSES = [
  { value: "", label: "All statuses" },
  { value: "FULLY_MATCHED", label: "FULLY_MATCHED" },
  { value: "PARTIALLY_MATCHED", label: "PARTIALLY_MATCHED" },
  { value: "AGGREGATE_SETTLEMENT", label: "AGGREGATE_SETTLEMENT" },
];

/** v13 Network Payments — network-side payment lifecycle (MBO receipt remains separate). */
export function AdminNetworkPaymentsReceivedPage() {
  const [filters, setFilters] = useState({
    network: "",
    reconciliation_status: "",
    billing_month: "",
    billing_year: "",
    q: "",
  });

  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v != null)),
    [filters],
  );

  const { rows, loading, error, reload, refresh, page, setPage, pagination, extras } = usePagedQuery(
    "/ops/admin/network-payments-received",
    queryFilters,
    { pageSize: 25 },
  );

  const kpis = extras?.kpis || {};

  const columns = useMemo(
    () => [
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
        render: (r) => displayText(r.networkPaymentReference || r.paymentReference || r.paymentId),
      },
      {
        key: "networkPaymentStatus",
        label: "Network Payment Status",
        minWidth: 160,
        render: (r) => <StatusPill status={r.networkPaymentStatus || r.paymentStatus} />,
      },
      {
        key: "networkPaymentDate",
        label: "Network Payment Date",
        minWidth: 140,
        render: (r) => displayDate(r.networkPaymentDate),
      },
      {
        key: "paymentAmount",
        label: "Payment Amount",
        minWidth: 130,
        className: "tabular-nums",
        render: (r) => displayMoney(r.paymentAmount, r.currency || r.paymentCurrency),
      },
      {
        key: "currency",
        label: "Currency",
        minWidth: 90,
        render: (r) => displayText(r.currency || r.paymentCurrency),
      },
      {
        key: "invoiceCycleReference",
        label: "Invoice / Cycle Reference",
        minWidth: 160,
        render: (r) => displayText(r.invoiceCycleReference || r.settlementCycle),
      },
      {
        key: "mboReceiptStatus",
        label: "MBO Receipt Status",
        minWidth: 150,
        render: (r) => <StatusPill status={r.mboReceiptStatus} />,
      },
      {
        key: "sourceReference",
        label: "Source Reference",
        minWidth: 200,
        render: (r) => displayText(r.sourceReference),
      },
    ],
    [],
  );

  return (
    <PageLayout
      eyebrow="Finance"
      title="Network Payments"
      subtitle="Network-side payment lifecycle. “Payment Sent” or network “Paid” does not automatically create an MBO receipt."
      actions={
        <Button variant="secondary" disabled>
          Export Current View
        </Button>
      }
    >
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-950">
        <strong>Finance control:</strong> MBO Received Date / Time can only come from MBO receipt / reconciliation
        evidence.
      </div>

      <div className="mb-4 mt-4 flex flex-wrap items-end gap-3">
        <Select
          value={filters.network}
          onChange={(e) => setFilters((p) => ({ ...p, network: e.target.value }))}
          label="Network Source"
          options={[{ value: "", label: "All Networks" }, ...NETWORKS]}
        />
        <Select
          value={filters.reconciliation_status}
          onChange={(e) => setFilters((p) => ({ ...p, reconciliation_status: e.target.value }))}
          label="Reconciliation Status"
          options={RECON_STATUSES}
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
          placeholder="Payment ref, invoice, source"
        />
      </div>

      <KpiGrid>
        <KpiStat label="Payment records" value={displayNumber(kpis.paymentRecords)} loading={loading} />
        <KpiStat
          label="Network amount paid"
          value={displayMoney(kpis.networkAmountPaid, kpis.currency)}
          loading={loading}
          tone="info"
        />
        <KpiStat
          label="MBO amount received"
          value={displayMoney(kpis.mboAmountReceived, kpis.currency)}
          loading={loading}
          tone="info"
        />
        <KpiStat label="Fully matched" value={displayNumber(kpis.fullyMatched)} loading={loading} tone="success" />
        <KpiStat label="Unapplied" value={displayNumber(kpis.unapplied)} loading={loading} tone="warning" />
        <KpiStat label="Exceptions" value={displayNumber(kpis.exceptions)} loading={loading} tone="muted" />
      </KpiGrid>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={refresh}
          emptyTitle="No network payments"
          emptyDescription="Rows appear from synced orders with payment lifecycle status."
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
