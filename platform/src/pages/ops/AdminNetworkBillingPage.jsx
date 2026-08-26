import { useMemo, useState } from "react";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Input, Select } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { KpiGrid, KpiStat } from "../../components/ui/KpiStat";
import { Button } from "../../components/ui/Button";
import { displayDate, displayMoney, displayNumber, displayText, na } from "../../utils/display";
import { usePagedQuery } from "../../hooks/usePagedQuery";

const NETWORKS = [
  { value: "OPTIMISE", label: "Optimise" },
  { value: "IMPACT", label: "Impact" },
  { value: "PARTNERIZE", label: "Partnerize" },
  { value: "TRACKIER", label: "Trackier" },
  { value: "vCommission", label: "vCommission" },
  { value: "BOOSTINY", label: "Boostiny" },
];

const PAYMENT_STATUSES = [
  { value: "", label: "All statuses" },
  { value: "PAID", label: "PAID" },
  { value: "PAYMENT_PENDING", label: "PAYMENT_PENDING" },
  { value: "INVOICED", label: "INVOICED" },
  { value: "CONFIRMED_SETTLEMENT", label: "CONFIRMED_SETTLEMENT" },
];

/** v13 Network Invoices — network-side invoice evidence (not MBO client invoice / bank receipt). */
export function AdminNetworkBillingPage() {
  const [filters, setFilters] = useState({
    network: "",
    payment_status: "",
    billing_month: "",
    billing_year: "",
    q: "",
  });

  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v != null)),
    [filters],
  );

  const { rows, loading, error, reload, refresh, page, setPage, pagination, extras } = usePagedQuery(
    "/ops/admin/network-billing",
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
        key: "brandName",
        label: "Brand Name",
        minWidth: 140,
        render: (r) => displayText(r.brandName),
      },
      {
        key: "networkInvoiceId",
        label: "Network Invoice ID",
        minWidth: 140,
        render: (r) => displayText(r.networkInvoiceId || r.invoiceId),
      },
      {
        key: "billingMonth",
        label: "Billing Month",
        minWidth: 100,
        render: (r) => na(r.billingMonth),
      },
      {
        key: "billingYear",
        label: "Billing Year",
        minWidth: 90,
        render: (r) => na(r.billingYear),
      },
      {
        key: "invoiceDate",
        label: "Invoice Date",
        minWidth: 120,
        render: (r) => displayDate(r.invoiceDate),
      },
      {
        key: "dueDate",
        label: "Due Date",
        minWidth: 120,
        render: (r) => displayDate(r.dueDate),
      },
      {
        key: "invoiceAmount",
        label: "Invoice Amount",
        minWidth: 130,
        className: "tabular-nums",
        render: (r) => displayMoney(r.invoiceAmount, r.currency || r.invoiceCurrency),
      },
      {
        key: "currency",
        label: "Currency",
        minWidth: 90,
        render: (r) => displayText(r.currency || r.invoiceCurrency),
      },
      {
        key: "networkInvoiceStatus",
        label: "Network Invoice Status",
        minWidth: 160,
        render: (r) => <StatusPill status={r.networkInvoiceStatus || r.paymentStatus} />,
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
      title="Network Invoices"
      subtitle="Network-side invoice evidence. This is not the MBO client invoice or MBO bank receipt."
      actions={
        <Button variant="secondary" disabled>
          Export Current View
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Select
          value={filters.network}
          onChange={(e) => setFilters((p) => ({ ...p, network: e.target.value }))}
          label="Network Source"
          options={[{ value: "", label: "All Networks" }, ...NETWORKS.map((n) => ({ value: n.value, label: n.label }))]}
        />
        <Select
          value={filters.payment_status}
          onChange={(e) => setFilters((p) => ({ ...p, payment_status: e.target.value }))}
          label="Invoice Status"
          options={PAYMENT_STATUSES}
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
          placeholder="Invoice ID, source"
        />
      </div>

      <KpiGrid>
        <KpiStat label="Confirmed commission" value={displayMoney(kpis.confirmedCommission, kpis.currency)} loading={loading} tone="info" />
        <KpiStat label="Invoiced" value={displayMoney(kpis.invoiced, kpis.currency)} loading={loading} tone="info" />
        <KpiStat label="Payment pending" value={displayMoney(kpis.paymentPending, kpis.currency)} loading={loading} tone="warning" />
        <KpiStat label="Paid / settled" value={displayMoney(kpis.paidSettled, kpis.currency)} loading={loading} tone="success" />
        <KpiStat label="Outstanding" value={displayMoney(kpis.outstanding, kpis.currency)} loading={loading} tone="muted" />
        <KpiStat label="Networks" value={displayNumber(kpis.networks)} loading={loading} tone="default" />
      </KpiGrid>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={refresh}
          emptyTitle="No network invoices"
          emptyDescription="Rows appear from synced orders (same source as Payment Status)."
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
