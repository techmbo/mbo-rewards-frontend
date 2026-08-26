import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { Input } from "../../components/ui/FormControls";
import { KpiGrid, KpiStat } from "../../components/ui/KpiStat";
import { StatusPill } from "../../components/ui/StatusPill";
import { displayDate, displayMoney, displayNumber, displayText, na } from "../../utils/display";

/**
 * Staff payment status — /ops/admin/payment-status.
 * v13 05A_Payment_Status_Tab fields. Network payment status ≠ MBO bank receipt.
 */
export function AdminPaymentStatusPage() {
  const [filters, setFilters] = useState({ billing_year: "", billing_month: "" });
  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    [filters],
  );
  const { rows, loading, error, reload, refresh, page, setPage, pagination } = usePagedQuery(
    "/ops/admin/payment-status",
    queryFilters,
    { pageSize: 25 },
  );

  const statusCounts = useMemo(() => {
    const counts = { PAYABLE: 0, PENDING: 0, PAID: 0, NOT_PAYABLE: 0, OTHER: 0 };
    for (const r of rows) {
      const s = String(r.paymentStatus || "").toUpperCase();
      if (s in counts) counts[s] += 1;
      else counts.OTHER += 1;
    }
    return counts;
  }, [rows]);

  return (
    <PageLayout
      eyebrow="Finance"
      title="Payment Status"
      subtitle="Exact MBO admin fields from 05A Payment Status. Network payment status must remain separate from actual MBO bank receipt."
      actions={
        <Link
          to="/ops/finance"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Open Finance
        </Link>
      }
    >
      <KpiGrid>
        <KpiStat label="Payable rows" value={displayNumber(statusCounts.PAYABLE)} loading={loading} tone="info" hint="Current page" />
        <KpiStat label="Pending rows" value={displayNumber(statusCounts.PENDING)} loading={loading} tone="warning" hint="Current page" />
        <KpiStat label="Paid rows" value={displayNumber(statusCounts.PAID)} loading={loading} tone="success" hint="Current page" />
        <KpiStat
          label="On hold / not payable"
          value={displayNumber(statusCounts.NOT_PAYABLE)}
          loading={loading}
          tone="muted"
          hint="Current page"
        />
      </KpiGrid>

      <div className="flex flex-wrap items-end gap-3">
        <FilterBar
          filters={[
            {
              key: "billing_month",
              label: "Billing month",
              options: Array.from({ length: 12 }, (_, i) => ({
                value: String(i + 1),
                label: String(i + 1),
              })),
            },
          ]}
          values={filters}
          onChange={(key, value) => setFilters((p) => ({ ...p, [key]: value }))}
          onReset={() => setFilters({ billing_year: "", billing_month: "" })}
        />
        <Input
          label="Billing year"
          value={filters.billing_year}
          onChange={(e) => setFilters((p) => ({ ...p, billing_year: e.target.value }))}
          placeholder="e.g. 2026"
        />
      </div>

      <DataTable
        dense
        columns={[
          {
            key: "networkSource",
            label: "Network Source",
            minWidth: 110,
            render: (r) => displayText(r.networkSource || r.network),
          },
          { key: "billingMonth", label: "Billing Month", minWidth: 100, render: (r) => na(r.billingMonth) },
          { key: "billingYear", label: "Billing Year", minWidth: 90, render: (r) => na(r.billingYear) },
          { key: "brandName", label: "Brand Name", minWidth: 140, render: (r) => displayText(r.brandName) },
          {
            key: "campaignType",
            label: "Campaign Type (Coupon or Link)",
            minWidth: 160,
            render: (r) => displayText(r.campaignType),
          },
          {
            key: "linkClicks",
            label: "Link Clicks",
            minWidth: 90,
            className: "tabular-nums",
            render: (r) => (r.linkClicks != null ? displayNumber(r.linkClicks) : "—"),
            title: "Unavailable on payment grain (avoids click fan-out)",
          },
          {
            key: "payableOrders",
            label: "Payable Orders",
            minWidth: 110,
            className: "tabular-nums",
            render: (r) => displayNumber(r.payableOrders),
          },
          {
            key: "payableCommission",
            label: "Payable Commission",
            minWidth: 140,
            className: "tabular-nums",
            title: "NETWORK PAYABLE — supplier receivable; not client payable",
            render: (r) => displayMoney(r.networkPayable ?? r.payableCommission, r.currency),
          },
          {
            key: "paymentStatus",
            label: "Payment Status",
            minWidth: 130,
            render: (r) => <StatusPill status={r.paymentStatus} />,
          },
          { key: "date", label: "Date", minWidth: 110, render: (r) => displayDate(r.date), defaultHidden: true },
          { key: "month", label: "Month", minWidth: 70, render: (r) => na(r.month), defaultHidden: true },
          { key: "year", label: "Year", minWidth: 70, render: (r) => na(r.year), defaultHidden: true },
          { key: "orderDate", label: "Order Date", minWidth: 110, render: (r) => displayDate(r.orderDate) },
          {
            key: "orderConfirmDate",
            label: "Order Confirmed Date",
            minWidth: 140,
            render: (r) => displayDate(r.orderConfirmDate),
          },
          {
            key: "orderPaymentConfirmDate",
            label: "Order Payment Confirmed Date",
            minWidth: 180,
            render: (r) => displayDate(r.orderPaymentConfirmDate),
          },
          { key: "currency", label: "Currency", minWidth: 80, render: (r) => displayText(r.currency), defaultHidden: true },
        ]}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={refresh}
        onRefresh={refresh}
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={setPage}
        emptyTitle="No payment status rows"
        emptyDescription="Rows appear after orders enter the payment lifecycle."
      />
    </PageLayout>
  );
}
