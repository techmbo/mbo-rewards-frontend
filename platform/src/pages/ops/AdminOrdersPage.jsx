import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { invalidateApiCache } from "../../api";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Select } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { Badge } from "../../components/ui/Badge";
import {
  NetworkCampaignFilterBar,
  NETWORK_CAMPAIGN_EMPTY_FILTERS,
  updateNetworkCampaignFilter,
} from "../../components/ops/NetworkCampaignFilterBar";
import { buildSharedNetworkQuery } from "./networkCampaignFilters";
import { formatDate } from "../helpers";
import { displayMoney, displayText } from "../../utils/display";

/**
 * Staff Orders / Conversions — aligned to v13 07E_Orders_Split field set.
 * Network tracking links are never invented (— when absent).
 */
export function AdminOrdersPage() {
  const { user } = useAuth();
  const showFinance =
    hasPermission(user, PERMISSIONS.FINANCE_OPS_READ) || hasPermission(user, PERMISSIONS.COMMISSION_READ);

  const [filters, setFilters] = useState({
    ...NETWORK_CAMPAIGN_EMPTY_FILTERS,
    confirmed: "",
    paid: "",
  });
  const queryFilters = useMemo(() => {
    const { confirmed, paid, ...campaignFilters } = filters;
    return {
      ...buildSharedNetworkQuery(campaignFilters),
      ...(confirmed ? { confirmed } : {}),
      ...(paid ? { paid } : {}),
    };
  }, [filters]);

  const { rows, loading, error, refresh, page, setPage, pagination } = usePagedQuery(
    "/ops/admin/orders",
    queryFilters,
    { pageSize: 25 },
  );

  // Always re-fetch once on mount so new DTO fields (couponType, campaignType) are not stuck behind session cache.
  useEffect(() => {
    invalidateApiCache("/ops/admin/orders");
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only bust
  }, []);

  const columns = useMemo(() => {
    /** v13 default: Network Source, Order ID, Client Name, Brand Name, Campaign Type,
     * Coupon Code / Link, Order Value, Order Status, Supplier Actual Commission,
     * Client Commission, MBO Commission / Margin, Commission Currency, Payment Status, Order Date
     */
    const cols = [
      {
        key: "network",
        label: "Network Source",
        minWidth: 100,
        render: (r) => (
          <div>
            <div className="font-semibold text-slate-900">{displayText(r.network)}</div>
            <div className="text-[11px] text-slate-500">{displayText(r.networkAccount)}</div>
          </div>
        ),
      },
      {
        key: "orderId",
        label: "Order ID",
        minWidth: 120,
        render: (r) => (
          <div className="font-mono text-xs">
            <div title={r.supplierOrderId || ""}>{displayText(r.supplierOrderId)}</div>
            {r.networkConversionId ? (
              <div className="text-slate-500" title={r.networkConversionId}>
                conv: {displayText(r.networkConversionId)}
              </div>
            ) : null}
            <div className="text-slate-400" title={r.orderId || ""}>
              {r.orderId ? `${String(r.orderId).slice(0, 8)}…` : "—"}
            </div>
          </div>
        ),
      },
      {
        key: "clientName",
        label: "Client Name",
        minWidth: 120,
        render: (r) => displayText(r.clientName),
      },
      {
        key: "attributionStatus",
        label: "Attribution",
        minWidth: 140,
        title: "Conversion attribution status and evidence (Pointer 15)",
        render: (r) => (
          <div>
            <StatusPill status={r.attributionStatus || "UNKNOWN"} />
            {r.attributionEvidenceLabel ? (
              <div className="mt-0.5 text-[11px] text-slate-500">{r.attributionEvidenceLabel}</div>
            ) : null}
            {r.attributionReviewReasonLabel ? (
              <div className="text-[10px] text-amber-700">{r.attributionReviewReasonLabel}</div>
            ) : null}
          </div>
        ),
      },
      {
        key: "merchantName",
        label: "Brand Name",
        minWidth: 120,
        render: (r) => displayText(r.merchantName || r.brandName),
      },
      {
        key: "campaignType",
        label: "Campaign Type",
        minWidth: 130,
        title: "Coupon / Link / Coupon + Link (channel used on this order)",
        render: (r) =>
          r.campaignType ? (
            <Badge variant="info" className="bg-indigo-50 text-indigo-800">
              {r.campaignType}
            </Badge>
          ) : (
            "—"
          ),
      },
      {
        key: "couponCodeOrLink",
        label: "Coupon Code / Link",
        minWidth: 180,
        render: (r) => {
          const code = r.couponCode;
          const link = r.couponLink || r.mboTrackingLink || r.networkTrackingLink;
          if (!code && !link) return "—";
          return (
            <div className="max-w-[240px]">
              {code ? <div className="font-mono text-xs font-semibold text-slate-900">{code}</div> : null}
              {link ? (
                <div className="truncate font-mono text-[10px] text-slate-500" title={link}>
                  {link}
                </div>
              ) : null}
            </div>
          );
        },
      },
      {
        key: "orderValue",
        label: "Order Value",
        minWidth: 110,
        className: "tabular-nums",
        render: (r) => displayMoney(r.orderValue, r.currency),
      },
      {
        key: "orderStatus",
        label: "Order Status",
        minWidth: 110,
        render: (r) => (
          <div>
            <StatusPill status={r.mboOrderStatus || r.orderStatus || r.mboStatus} />
            {r.networkRawStatus && r.networkRawStatus !== r.mboOrderStatus ? (
              <div className="mt-0.5 font-mono text-[10px] text-slate-500" title="Network raw status">
                raw: {displayText(r.networkRawStatus)}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        key: "validationStatus",
        label: "Validation",
        minWidth: 120,
        defaultHidden: true,
        render: (r) => <StatusPill status={r.validationStatus} />,
      },
    ];

    if (showFinance) {
      cols.push(
        {
          key: "supplierActualCommission",
          label: "Supplier Actual Commission",
          minWidth: 140,
          className: "tabular-nums",
          title: "Network/supplier commission (ledger FT or conversion fallback)",
          render: (r) =>
            displayMoney(
              r.supplierActualCommission ?? r.financial?.supplierReceivable,
              r.commissionCurrency || r.currency,
            ),
        },
        {
          key: "clientCommission",
          label: "Client Commission",
          minWidth: 120,
          className: "tabular-nums",
          render: (r) =>
            displayMoney(r.clientCommission ?? r.financial?.clientPayable, r.commissionCurrency || r.currency),
        },
        {
          key: "mboCommissionMargin",
          label: "MBO Commission / Margin",
          minWidth: 140,
          className: "tabular-nums",
          render: (r) =>
            displayMoney(r.mboCommissionMargin ?? r.financial?.mboMargin, r.commissionCurrency || r.currency),
        },
        {
          key: "clientSharePercent",
          label: "Client Share %",
          minWidth: 110,
          className: "tabular-nums",
          title: "client_share_percentage — from commission rule or client default",
          render: (r) =>
            r.clientSharePercent != null && Number.isFinite(Number(r.clientSharePercent))
              ? `${Number(r.clientSharePercent)}%`
              : "—",
        },
        {
          key: "mboSharePercent",
          label: "MBO Share %",
          minWidth: 110,
          className: "tabular-nums",
          title: "mbo_share_percentage — complement of client share when known",
          render: (r) =>
            r.mboSharePercent != null && Number.isFinite(Number(r.mboSharePercent))
              ? `${Number(r.mboSharePercent)}%`
              : "—",
        },
        {
          key: "commissionCurrency",
          label: "Commission Currency",
          minWidth: 100,
          render: (r) => displayText(r.commissionCurrency || r.currency),
        },
      );
    }

    cols.push(
      {
        key: "paymentStatus",
        label: "Payment Status",
        minWidth: 120,
        render: (r) => <StatusPill status={r.paymentStatus || r.supplierPaymentStatus} />,
      },
      {
        key: "orderDate",
        label: "Order Date",
        minWidth: 120,
        render: (r) => formatDate(r.orderDate),
      },
      {
        key: "confirmedDate",
        label: "Order Confirmed Date",
        minWidth: 130,
        render: (r) => formatDate(r.confirmedDate),
      },
      {
        key: "paymentConfirmedDate",
        label: "Order Payment Confirmed Date",
        minWidth: 150,
        defaultHidden: true,
        render: (r) => formatDate(r.paymentConfirmedDate || r.bankReceivedAt),
      },
      {
        key: "rawStatus",
        label: "Raw status",
        minWidth: 90,
        defaultHidden: true,
        render: (r) => displayText(r.rawStatus),
      },
    );

    return cols;
  }, [showFinance]);

  return (
    <PageLayout
      eyebrow="Network Operations"
      title="Orders / Conversions"
      subtitle="Order-level commission split follows 07E_Orders_Split: Supplier Actual Commission → Client Commission → MBO Commission / Margin."
    >
      <div className="mb-4 space-y-3">
        <NetworkCampaignFilterBar
          values={filters}
          onChange={(key, value) =>
            setFilters((prev) => updateNetworkCampaignFilter(prev, key, value))
          }
          onReset={() =>
            setFilters({
              ...NETWORK_CAMPAIGN_EMPTY_FILTERS,
              confirmed: "",
              paid: "",
            })
          }
          excludeKeys={["recordType", "sourceStatus", "issue", "preset"]}
        />
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3">
          <Select
            value={filters.confirmed}
            onChange={(e) => setFilters((f) => ({ ...f, confirmed: e.target.value }))}
            options={[
              { value: "", label: "All validation" },
              { value: "true", label: "Confirmed only" },
            ]}
          />
          <Select
            value={filters.paid}
            onChange={(e) => setFilters((f) => ({ ...f, paid: e.target.value }))}
            options={[
              { value: "", label: "All payment states" },
              { value: "true", label: "Payable / paid / invoiced" },
            ]}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={refresh}
        onRefresh={refresh}
        emptyTitle="No orders"
        page={page}
        onPageChange={setPage}
        totalPages={pagination?.totalPages}
        total={pagination?.total}
      />
    </PageLayout>
  );
}
