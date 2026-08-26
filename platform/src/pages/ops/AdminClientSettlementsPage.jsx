import { useMemo, useState } from "react";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { KpiGrid, KpiStat } from "../../components/ui/KpiStat";
import { Button } from "../../components/ui/Button";
import { displayDate, displayMoney, displayNumber, displayText } from "../../utils/display";
import { usePagedQuery } from "../../hooks/usePagedQuery";

const TABS = [
  { value: "payable-orders", label: "Payable Orders" },
  { value: "withdrawal-invoice-requests", label: "Withdrawal / Invoice Requests" },
  { value: "payouts", label: "Payouts" },
];

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
        active ? "border-sky-300 bg-sky-50 text-sky-900" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export function AdminClientSettlementsPage() {
  const [tab, setTab] = useState("payable-orders");

  const [payableFilters, setPayableFilters] = useState({
    clientId: "",
    settlementPeriod: "",
    q: "",
  });

  const [withdrawalFilters, setWithdrawalFilters] = useState({
    requestStatus: "",
    clientId: "",
    q: "",
  });

  const [payoutFilters, setPayoutFilters] = useState({
    payoutStatus: "",
    clientId: "",
  });

  const payableQuery = useMemo(
    () => Object.fromEntries(Object.entries(payableFilters).filter(([, v]) => v !== "" && v != null)),
    [payableFilters],
  );
  const withdrawalQuery = useMemo(
    () => Object.fromEntries(Object.entries(withdrawalFilters).filter(([, v]) => v !== "" && v != null)),
    [withdrawalFilters],
  );
  const payoutQuery = useMemo(
    () => Object.fromEntries(Object.entries(payoutFilters).filter(([, v]) => v !== "" && v != null)),
    [payoutFilters],
  );

  const payable = usePagedQuery("/ops/admin/client-settlements/payable-orders", payableQuery, {
    pageSize: 25,
    enabled: tab === "payable-orders",
  });
  const withdrawal = usePagedQuery("/ops/admin/client-settlements/withdrawal-invoice-requests", withdrawalQuery, {
    pageSize: 25,
    enabled: tab === "withdrawal-invoice-requests",
  });
  const payouts = usePagedQuery("/ops/admin/client-settlements/payouts", payoutQuery, {
    pageSize: 25,
    enabled: tab === "payouts",
  });

  const kpis = (payable.extras?.kpis || withdrawal.extras?.kpis || payouts.extras?.kpis) ?? {};

  return (
    <PageLayout
      eyebrow="Payment & Finance"
      title="Client Settlements"
      actions={
        <Button variant="secondary" disabled>
          Export Current View
        </Button>
      }
    >
      <KpiGrid>
        <KpiStat label="Total payable" value={kpis.totalPayable ?? null} loading={payable.loading || withdrawal.loading || payouts.loading} />
        <KpiStat label="Eligible by threshold" value={kpis.eligibleByThreshold ?? null} loading={payable.loading || withdrawal.loading || payouts.loading} />
        <KpiStat label="Available for withdrawal" value={kpis.availableForWithdrawal ?? null} loading={payable.loading || withdrawal.loading || payouts.loading} />
        <KpiStat label="Requests under review" value={kpis.requestsUnderReview ?? null} loading={payable.loading || withdrawal.loading || payouts.loading} />
        <KpiStat label="Payout processing" value={kpis.payoutProcessing ?? null} loading={payable.loading || withdrawal.loading || payouts.loading} />
        <KpiStat label="Paid" value={kpis.paid ?? null} loading={payable.loading || withdrawal.loading || payouts.loading} />
      </KpiGrid>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {TABS.map((t) => (
            <TabButton key={t.value} active={tab === t.value} onClick={() => setTab(t.value)}>
              {t.label}
            </TabButton>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {tab === "payable-orders" ? (
          <PayableOrdersTable
            {...payable}
            filters={payableFilters}
            setFilters={setPayableFilters}
          />
        ) : null}
        {tab === "withdrawal-invoice-requests" ? (
          <WithdrawalRequestsTable
            {...withdrawal}
            filters={withdrawalFilters}
            setFilters={setWithdrawalFilters}
          />
        ) : null}
        {tab === "payouts" ? <PayoutsTable {...payouts} filters={payoutFilters} setFilters={setPayoutFilters} /> : null}
      </div>
    </PageLayout>
  );
}

function PayableOrdersTable({ rows, loading, error, reload, page, setPage, pagination, filters, setFilters }) {
  const columns = useMemo(
    () => [
      { key: "receivedDate", label: "Received Date", minWidth: 120, render: (r) => displayDate(r.receivedDate) },
      {
        key: "confirmedNetworkCommissionAmount",
        label: "Confirmed Network Commission Amount",
        minWidth: 240,
        className: "tabular-nums",
        render: (r) => displayMoney(r.confirmedNetworkCommissionAmount, r.currency),
      },
      { key: "splitType", label: "Split Type", minWidth: 120, render: (r) => displayText(r.splitType) },
      {
        key: "clientSplitRate",
        label: "Client Split Rate",
        minWidth: 140,
        className: "tabular-nums",
        render: (r) => displayNumber(r.clientSplitRate),
      },
      {
        key: "mboSplitRate",
        label: "MBO Split Rate",
        minWidth: 120,
        className: "tabular-nums",
        render: (r) => displayNumber(r.mboSplitRate),
      },
      {
        key: "clientCommissionAmount",
        label: "Client Commission Amount",
        minWidth: 220,
        className: "tabular-nums",
        render: (r) => displayMoney(r.clientCommissionAmount, r.currency),
      },
      {
        key: "mboCommissionAmount",
        label: "MBO Commission Amount",
        minWidth: 200,
        className: "tabular-nums",
        render: (r) => displayMoney(r.mboCommissionAmount, r.currency),
      },
      { key: "currency", label: "Currency", minWidth: 90, render: (r) => displayText(r.currency) },
      {
        key: "payableStatus",
        label: "Payable Status",
        minWidth: 150,
        render: (r) => <StatusPill status={r.payableStatus} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          label="Client"
          value={filters.clientId}
          onChange={(e) => setFilters((p) => ({ ...p, clientId: e.target.value }))}
          placeholder="e.g. ICICI Bank / client id"
        />
        <Input
          label="Settlement period"
          value={filters.settlementPeriod}
          onChange={(e) => setFilters((p) => ({ ...p, settlementPeriod: e.target.value }))}
          placeholder="e.g. Aug 2026"
        />
        <Input
          label="Search"
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
          placeholder="Order ID, brand, campaign"
        />
      </div>

      <div className="flex items-center justify-end">
        <Button variant="secondary" size="sm" disabled>
          Make Available for Withdrawal
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="Select a client to load payable orders"
        emptyDescription=""
        page={page}
        onPageChange={setPage}
        totalPages={pagination?.totalPages}
        total={pagination?.total}
        onRefresh={reload}
        searchable={false}
      />
    </div>
  );
}

function WithdrawalRequestsTable({ rows, loading, error, reload, page, setPage, pagination, filters, setFilters }) {
  const columns = useMemo(
    () => [
      { key: "requestId", label: "Request ID", minWidth: 140, render: (r) => displayText(r.requestId) },
      { key: "client", label: "Client", minWidth: 150, render: (r) => displayText(r.client) },
      { key: "requestDate", label: "Request Date", minWidth: 140, render: (r) => displayDate(r.requestDate) },
      { key: "requestTime", label: "Request Time", minWidth: 130, render: (r) => displayText(r.requestTime) },
      { key: "settlementPeriod", label: "Settlement Period", minWidth: 150, render: (r) => displayText(r.settlementPeriod) },
      { key: "payableRecordCount", label: "Payable Record Count", minWidth: 190, render: (r) => displayNumber(r.payableRecordCount) },
      { key: "availableAmount", label: "Available Amount", minWidth: 160, className: "tabular-nums", render: (r) => displayMoney(r.availableAmount, r.currency) },
      { key: "requestedAmount", label: "Requested Amount", minWidth: 160, className: "tabular-nums", render: (r) => displayMoney(r.requestedAmount, r.currency) },
      { key: "currency", label: "Currency", minWidth: 110, render: (r) => displayText(r.currency) },
      { key: "billingMethod", label: "Billing Method", minWidth: 200, render: (r) => displayText(r.billingMethod) },
      { key: "invoiceNumber", label: "Invoice Number", minWidth: 170, render: (r) => displayText(r.invoiceNumber) },
      { key: "invoiceDocument", label: "Invoice Document", minWidth: 200, render: (r) => displayText(r.invoiceDocument) },
      { key: "requestStatus", label: "Request Status", minWidth: 170, render: (r) => <StatusPill status={r.requestStatus} /> },
      {
        key: "action",
        label: "Action",
        minWidth: 140,
        render: () => <span className="text-slate-400">—</span>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          label="Request Status"
          value={filters.requestStatus}
          onChange={(e) => setFilters((p) => ({ ...p, requestStatus: e.target.value }))}
          placeholder="e.g. UNDER_REVIEW / APPROVED / REJECTED"
        />
        <Input
          label="Client"
          value={filters.clientId}
          onChange={(e) => setFilters((p) => ({ ...p, clientId: e.target.value }))}
          placeholder="e.g. ICICI Bank / client id"
        />
        <Input
          label="Search"
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
          placeholder="Request ID, client, invoice number"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No withdrawal/invoice requests"
        emptyDescription=""
        page={page}
        onPageChange={setPage}
        totalPages={pagination?.totalPages}
        total={pagination?.total}
        onRefresh={reload}
        searchable={false}
      />
    </div>
  );
}

function PayoutsTable({ rows, loading, error, reload, page, setPage, pagination, filters, setFilters }) {
  const columns = useMemo(
    () => [
      { key: "clientPayoutId", label: "Client Payout ID", minWidth: 180, render: (r) => displayText(r.clientPayoutId) },
      { key: "client", label: "Client", minWidth: 160, render: (r) => displayText(r.client) },
      { key: "settlementPeriod", label: "Settlement Period", minWidth: 160, render: (r) => displayText(r.settlementPeriod) },
      { key: "requestId", label: "Request ID", minWidth: 140, render: (r) => displayText(r.requestId) },
      { key: "payableRecordCount", label: "Payable Record Count", minWidth: 200, render: (r) => displayNumber(r.payableRecordCount) },
      { key: "grossPayableAmount", label: "Gross Payable Amount", minWidth: 190, className: "tabular-nums", render: (r) => displayMoney(r.grossPayableAmount, r.currency) },
      { key: "adjustmentAmount", label: "Adjustment Amount", minWidth: 170, className: "tabular-nums", render: (r) => displayMoney(r.adjustmentAmount, r.currency) },
      { key: "finalPayoutAmount", label: "Final Payout Amount", minWidth: 190, className: "tabular-nums", render: (r) => displayMoney(r.finalPayoutAmount, r.currency) },
      { key: "currency", label: "Currency", minWidth: 110, render: (r) => displayText(r.currency) },
      { key: "payoutStatus", label: "Payout Status", minWidth: 140, render: (r) => <StatusPill status={r.payoutStatus} /> },
      { key: "paymentDate", label: "Payment Date", minWidth: 150, render: (r) => displayDate(r.paymentDate) },
      { key: "paymentTime", label: "Payment Time", minWidth: 140, render: (r) => displayText(r.paymentTime) },
      { key: "paymentReference", label: "Payment Reference", minWidth: 190, render: (r) => displayText(r.paymentReference) },
      {
        key: "action",
        label: "Action",
        minWidth: 160,
        render: (r) =>
          r.payoutStatus === "PROCESSING" ? (
            <Button size="sm" disabled variant="secondary">
              Manage Payout
            </Button>
          ) : (
            <Button size="sm" disabled variant="secondary">
              View Details
            </Button>
          ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          label="Payout Status"
          value={filters.payoutStatus}
          onChange={(e) => setFilters((p) => ({ ...p, payoutStatus: e.target.value }))}
          placeholder="e.g. PROCESSING / PAID"
        />
        <Input
          label="Client"
          value={filters.clientId}
          onChange={(e) => setFilters((p) => ({ ...p, clientId: e.target.value }))}
          placeholder="e.g. ICICI Bank / client id"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No payouts"
        emptyDescription=""
        page={page}
        onPageChange={setPage}
        totalPages={pagination?.totalPages}
        total={pagination?.total}
        onRefresh={reload}
        searchable={false}
      />
    </div>
  );
}

