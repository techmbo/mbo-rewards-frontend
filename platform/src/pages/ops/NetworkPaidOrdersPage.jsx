import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Input, Select } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { formatDate } from "../helpers";
import { displayMoney, displayText } from "../../utils/display";

function MonoLink({ value }) {
  if (!value) return <span className="text-slate-400">—</span>;
  return (
    <span className="block max-w-[200px] truncate font-mono text-[11px] text-slate-600" title={value}>
      {value}
    </span>
  );
}

function paymentLedgerStatus(row) {
  const p = String(row.supplierPaymentStatus || "").toUpperCase();
  if (p === "PAYMENT_RECEIVED") return "Paid";
  if (p === "PAYMENT_PAYABLE" || p === "PAYMENT_INVOICED") return "Payable";
  return row.supplierPaymentStatus || null;
}

function mboReceivedAmount(row) {
  const p = String(row.supplierPaymentStatus || "").toUpperCase();
  if (p === "PAYMENT_RECEIVED") return row.financial?.supplierReceivable ?? row.mboReceived;
  return row.mboReceived ?? 0;
}

function TrackingExpand({ row }) {
  return (
    <details className="min-w-[16rem] rounded-lg border border-slate-200 bg-slate-50/80">
      <summary className="cursor-pointer whitespace-nowrap px-2.5 py-1.5 text-xs font-semibold text-slate-700">
        ▶ Tracking Detail
      </summary>
      <div className="grid min-w-[28rem] grid-cols-2 gap-2 p-2.5 pt-0 text-[11px]">
        <div>
          <span className="font-semibold uppercase text-slate-400">Coupon ID</span>
          <p className="break-all font-mono">{displayText(row.couponCode ? `coupon_${row.couponCode}` : null)}</p>
        </div>
        <div>
          <span className="font-semibold uppercase text-slate-400">Tracking link ID</span>
          <p className="break-all font-mono">{displayText(row.trackingLinkId)}</p>
        </div>
        <div>
          <span className="font-semibold uppercase text-slate-400">MBO click ID</span>
          <p className="break-all font-mono">{displayText(row.mboClickId)}</p>
        </div>
        <div>
          <span className="font-semibold uppercase text-slate-400">Network click ID</span>
          <p className="break-all font-mono">{displayText(row.networkClickId)}</p>
        </div>
        <div>
          <span className="font-semibold uppercase text-slate-400">Payment reference</span>
          <p className="break-all font-mono">{displayText(row.paymentReference)}</p>
        </div>
        <div>
          <span className="font-semibold uppercase text-slate-400">Last synced</span>
          <p>{formatDate(row.lastSyncedAt || row.confirmedDate)}</p>
        </div>
      </div>
    </details>
  );
}

/**
 * Network Operation Portal — Paid Orders (14G).
 * Network payable vs MBO actually received remain separate. Network → MBO only.
 */
export function NetworkPaidOrdersPage() {
  const { user } = useAuth();
  const showFinance =
    hasPermission(user, PERMISSIONS.FINANCE_OPS_READ) || hasPermission(user, PERMISSIONS.COMMISSION_READ);

  const [filters, setFilters] = useState({
    network: "",
    q: "",
    paid: "true",
  });
  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v != null)),
    [filters],
  );

  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/ops/admin/orders",
    queryFilters,
    { pageSize: 25 },
  );

  const columns = useMemo(() => {
    const cols = [
      {
        key: "network",
        label: "Network",
        minWidth: 100,
        render: (r) => displayText(r.network),
      },
      {
        key: "paymentReport",
        label: "Payment Report",
        minWidth: 120,
        render: (r) => displayText(r.paymentReference || r.rawPayloadId),
      },
      {
        key: "orderId",
        label: "Order ID",
        minWidth: 120,
        render: (r) => (
          <span className="font-mono text-xs">{displayText(r.supplierOrderId || r.orderId)}</span>
        ),
      },
      {
        key: "brandCampaign",
        label: "Brand / Campaign",
        minWidth: 180,
        render: (r) => (
          <div>
            <div className="font-semibold text-slate-900">{displayText(r.merchantName)}</div>
            <div className="text-[12px] text-slate-600">{displayText(r.campaignName)}</div>
            <div className="font-mono text-[11px] text-slate-500">{displayText(r.campaignSourceId)}</div>
          </div>
        ),
      },
      {
        key: "coupon",
        label: "Coupon",
        minWidth: 90,
        render: (r) =>
          r.couponCode ? (
            <Badge variant="info" className="bg-blue-50 text-blue-700">
              {r.couponCode}
            </Badge>
          ) : (
            "—"
          ),
      },
      {
        key: "networkTrackingLink",
        label: "Network Tracking Link",
        minWidth: 150,
        title: "Never invented",
        render: (r) => <MonoLink value={r.networkTrackingLink} />,
      },
      {
        key: "mboTrackingLink",
        label: "MBO Tracking Link",
        minWidth: 150,
        render: (r) => <MonoLink value={r.mboTrackingLink} />,
      },
      {
        key: "orderDate",
        label: "Order Date",
        minWidth: 110,
        render: (r) => formatDate(r.orderDate),
      },
      {
        key: "confirmedDate",
        label: "Confirmed Date",
        minWidth: 120,
        render: (r) => formatDate(r.confirmedDate),
      },
      {
        key: "billingMonth",
        label: "Billing Month",
        minWidth: 110,
        render: (r) => {
          if (r.billingMonth && r.billingYear) return `${r.billingMonth}/${r.billingYear}`;
          if (!r.orderDate) return "—";
          const d = new Date(r.orderDate);
          if (Number.isNaN(d.getTime())) return "—";
          return `${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
        },
      },
    ];

    if (showFinance) {
      cols.push(
        {
          key: "payableCommission",
          label: "Payable Commission",
          minWidth: 130,
          className: "tabular-nums",
          render: (r) => displayMoney(r.financial?.supplierReceivable, r.currency),
        },
        {
          key: "mboReceived",
          label: "MBO Received",
          minWidth: 120,
          className: "tabular-nums",
          title: "Actual bank/settlement evidence — never copied from payable",
          render: (r) => displayMoney(mboReceivedAmount(r), r.currency),
        },
      );
    }

    cols.push(
      {
        key: "status",
        label: "Status",
        minWidth: 100,
        render: (r) => <StatusPill status={paymentLedgerStatus(r)} />,
      },
      {
        key: "bankReceived",
        label: "Bank Received",
        minWidth: 120,
        render: (r) =>
          String(r.supplierPaymentStatus || "").toUpperCase() === "PAYMENT_RECEIVED"
            ? formatDate(r.bankReceivedAt || r.confirmedDate)
            : "—",
      },
      {
        key: "reconciliation",
        label: "Reconciliation",
        minWidth: 120,
        render: (r) => {
          const p = String(r.supplierPaymentStatus || "").toUpperCase();
          const label =
            r.reconciliationStatus ||
            (p === "PAYMENT_RECEIVED" ? "Matched" : p ? "Pending" : null);
          return label ? <StatusPill status={label} /> : "—";
        },
      },
      {
        key: "tracking",
        label: "Tracking Detail",
        minWidth: 150,
        render: (r) => <TrackingExpand row={r} />,
      },
    );
    return cols;
  }, [showFinance]);

  return (
    <PageLayout
      eyebrow="Network Operation Portal"
      title="Network Paid Orders"
      subtitle="Paid/payable network orders with full campaign and attribution context."
      actions={
        <>
          <Button variant="secondary" onClick={() => reload()}>
            Export
          </Button>
          <Link
            to="/ops/reconciliation"
            className="inline-flex items-center justify-center rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Reconcile
          </Link>
        </>
      }
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">Network Payment Ledger</h2>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          14G_Network_Paid_Orders
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
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
        <Input
          placeholder="Order ID, brand, coupon…"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
      </div>

      {!showFinance ? (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Payable and MBO received amounts require finance permission.
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No paid / payable orders"
        emptyDescription="No network payment ledger rows match these filters."
        page={page}
        onPageChange={setPage}
        totalPages={pagination?.totalPages}
        total={pagination?.total}
        onRefresh={reload}
        dense
      />
    </PageLayout>
  );
}
