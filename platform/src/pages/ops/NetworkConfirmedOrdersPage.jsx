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

function TrackingDetail({ row }) {
  return (
    <details className="min-w-[14rem] rounded-lg border border-slate-200 bg-slate-50/80">
      <summary className="cursor-pointer whitespace-nowrap px-2.5 py-1.5 text-xs font-semibold text-slate-700">
        ▶ Tracking
      </summary>
      <div className="space-y-1.5 p-2.5 pt-0 text-[11px]">
        <div>
          <span className="font-semibold uppercase text-slate-400">Tracking link ID</span>
          <p className="break-all font-mono">{displayText(row.trackingLinkId)}</p>
        </div>
        <div>
          <span className="font-semibold uppercase text-slate-400">Network click ID</span>
          <p className="break-all font-mono">{displayText(row.networkClickId)}</p>
        </div>
        <div>
          <span className="font-semibold uppercase text-slate-400">MBO click ID</span>
          <p className="break-all font-mono">{displayText(row.mboClickId)}</p>
        </div>
        <div>
          <span className="font-semibold uppercase text-slate-400">Sub IDs</span>
          <p className="break-all font-mono">
            {[row.subId1, row.subId2, row.subId3].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
      </div>
    </details>
  );
}

/**
 * Network Operation Portal — Confirmed Orders (14F).
 * Network-confirmed orders with full attribution context. Network → MBO only.
 */
export function NetworkConfirmedOrdersPage() {
  const { user } = useAuth();
  const showFinance =
    hasPermission(user, PERMISSIONS.FINANCE_OPS_READ) || hasPermission(user, PERMISSIONS.COMMISSION_READ);

  const [filters, setFilters] = useState({
    network: "",
    brand: "",
    q: "",
    confirmed: "true",
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
        render: (r) => (
          <div>
            <div className="font-semibold text-slate-900">{displayText(r.network)}</div>
            <div className="text-[11px] text-slate-500">{displayText(r.networkAccount)}</div>
          </div>
        ),
      },
      {
        key: "orderTxn",
        label: "Order / Transaction",
        minWidth: 140,
        render: (r) => (
          <div className="font-mono text-xs">
            <div title={r.supplierOrderId || ""}>{displayText(r.supplierOrderId)}</div>
            <div className="text-slate-500" title={r.orderId || ""}>
              {r.orderId ? `${String(r.orderId).slice(0, 8)}…` : "—"}
            </div>
          </div>
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
        key: "couponCode",
        label: "Coupon Code",
        minWidth: 100,
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
        minWidth: 160,
        title: "Never invented — — when network does not provide",
        render: (r) => <MonoLink value={r.networkTrackingLink} />,
      },
      {
        key: "mboTrackingLink",
        label: "MBO Tracking Link",
        minWidth: 160,
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
        key: "orderValue",
        label: "Order Value",
        minWidth: 110,
        className: "tabular-nums",
        render: (r) => displayMoney(r.orderValue, r.currency),
      },
    ];
    if (showFinance) {
      cols.push({
        key: "commission",
        label: "Commission",
        minWidth: 110,
        className: "tabular-nums",
        render: (r) => displayMoney(r.financial?.supplierReceivable, r.currency),
      });
    }
    cols.push(
      {
        key: "rawStatus",
        label: "Raw Status",
        minWidth: 100,
        render: (r) => displayText(r.rawStatus),
      },
      {
        key: "mboStatus",
        label: "MBO Status",
        minWidth: 110,
        render: (r) => <StatusPill status={r.mboStatus || "CONFIRMED"} />,
      },
      {
        key: "validation",
        label: "Validation",
        minWidth: 110,
        render: (r) => <StatusPill status={r.validationStatus} />,
      },
      {
        key: "tracking",
        label: "Tracking Detail",
        minWidth: 140,
        render: (r) => <TrackingDetail row={r} />,
      },
    );
    return cols;
  }, [showFinance]);

  return (
    <PageLayout
      eyebrow="Network Operation Portal"
      title="Network Confirmed Orders"
      subtitle="Network-confirmed orders with complete brand, campaign and attribution context."
      actions={
        <>
          <Button variant="secondary" onClick={() => reload()}>
            Export
          </Button>
          <Link
            to="/ops/exceptions"
            className="inline-flex items-center justify-center rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Exceptions
          </Link>
        </>
      }
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">Confirmed / Approved Orders</h2>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          14F_Network_Confirmed_Orders
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
          placeholder="Brand…"
          value={filters.brand}
          onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value, q: e.target.value || f.q }))}
        />
        <Select
          value={filters.confirmed}
          onChange={(e) => setFilters((f) => ({ ...f, confirmed: e.target.value }))}
          options={[
            { value: "true", label: "Confirmed" },
            { value: "", label: "All statuses" },
          ]}
        />
        <Input
          placeholder="Order ID, brand, coupon, click ID"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No confirmed orders"
        emptyDescription="No network-confirmed orders match these filters."
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
