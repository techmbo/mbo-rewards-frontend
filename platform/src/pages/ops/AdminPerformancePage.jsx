import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { fetchApi } from "../../api";
import { invalidateApiCache } from "../../api";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { KpiGrid, KpiStat } from "../../components/ui/KpiStat";
import {
  displayCompactMoney,
  displayDate,
  displayDateTime,
  displayMoney,
  displayNumber,
  displayPercent,
  displayText,
} from "../../utils/display";
import {
  campaignTypeLabel,
  customerTypeLabel,
  exportPerformanceCsv,
  networkDisplayName,
  resolveCancelOrders,
  resolveLinkClicks,
  resolveNetCommission,
  resolveNetOrderValue,
  resolveNetOrders,
} from "./adminPerformanceHelpers.js";
import { NETWORK_CAMPAIGN_FILTER_DEFINITIONS } from "./networkCampaignFilters";

const PERFORMANCE_EMPTY_FILTERS = {
  search: "",
  network: "",
  country: "",
  campaignStatus: "",
  relationshipStatus: "",
  isAssignable: "",
  campaignType: "",
  category: "",
  currency: "",
  brand: "",
  status: "",
  date: "",
  from: "",
  to: "",
};

const PERFORMANCE_FILTER_DEFINITIONS = [
  ...NETWORK_CAMPAIGN_FILTER_DEFINITIONS.filter(
    (f) => !["recordType", "sourceStatus", "issue"].includes(f.key),
  ).map((f) => {
    if (f.key === "search") {
      return {
        ...f,
        placeholder: "Brand, campaign, coupon, order, click ID",
      };
    }
    if (f.key === "campaignType") {
      return {
        key: "campaignType",
        label: "Campaign Type",
        options: [
          { value: "COUPON_AND_LINK", label: "Link + Coupon" },
          { value: "COUPON_CODE_ONLY", label: "Coupon" },
          { value: "AFFILIATE_LINK_ONLY", label: "Link" },
          { value: "DEEPLINK", label: "Deeplink" },
          { value: "CPS", label: "CPS" },
          { value: "CPA", label: "CPA" },
          { value: "CPL", label: "CPL" },
        ],
      };
    }
    return f;
  }),
  {
    key: "brand",
    label: "Brand",
    type: "text",
    placeholder: "All brands",
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "MATCHED", label: "Matched" },
      { value: "COUPON_CLICK", label: "Coupon + Click" },
      { value: "PENDING", label: "Pending" },
      { value: "PARTIAL", label: "Partial" },
    ],
  },
  {
    key: "date",
    label: "Date",
    type: "date",
  },
  {
    key: "from",
    label: "From",
    type: "date",
  },
  {
    key: "to",
    label: "To",
    type: "date",
  },
];

function DetailCell({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-2.5 py-2">
      <span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400">{label}</span>
      <b className="mt-0.5 block break-all text-xs font-semibold text-slate-900">{value ?? "—"}</b>
    </div>
  );
}

function ViewEverything({ row, canFinance }) {
  const money = (value) => displayMoney(value, row.currency);
  const campaignType = row.campaignType || campaignTypeLabel(row.campaignChannelType);
  return (
    <details className="min-w-[16rem] rounded-lg border border-slate-200 bg-slate-50/80">
      <summary className="cursor-pointer whitespace-nowrap px-2.5 py-1.5 text-xs font-semibold text-slate-700">
        View Everything
      </summary>
      <div className="grid min-w-[44rem] grid-cols-3 gap-2 p-2.5 pt-0">
        <DetailCell label="Report ID" value={displayText(row.reportId)} />
        <DetailCell label="Campaign Name" value={displayText(row.campaignName)} />
        <DetailCell label="Network Campaign ID" value={displayText(row.supplierCampaignId)} />
        <DetailCell label="Campaign Type" value={displayText(campaignType)} />
        <DetailCell label="Cancel Orders" value={displayNumber(resolveCancelOrders(row))} />
        <DetailCell label="Country" value={displayText(row.country)} />
        <DetailCell label="Customer Type" value={displayText(customerTypeLabel(row.customerType))} />
        <DetailCell label="Month" value={displayNumber(row.month)} />
        <DetailCell label="Year" value={displayNumber(row.year)} />
        <DetailCell label="Order Date" value={displayDate(row.orderDate)} />
        <DetailCell label="Order Confirmed Date" value={displayDate(row.orderConfirmDate)} />
        <DetailCell
          label="Order Payment Confirmed Date"
          value={displayDate(row.orderPaymentConfirmDate)}
        />
        <DetailCell
          label="Discount %"
          value={
            row.discountPercent != null && Number.isFinite(Number(row.discountPercent))
              ? `${Number(row.discountPercent)}%`
              : null
          }
        />
        <DetailCell label="Coupon ID" value={displayText(row.couponId)} />
        <DetailCell label="Coupon Source / Scope" value={displayText(row.couponSourceScope)} />
        <DetailCell label="Network Tracking Link" value={displayText(row.networkTrackingLink)} />
        <DetailCell label="MBO Tracking Link" value={displayText(row.mboTrackingLink)} />
        <DetailCell label="Tracking Link ID" value={displayText(row.trackingLinkId)} />
        <DetailCell label="Network Click ID" value={displayText(row.networkClickId)} />
        <DetailCell label="MBO Click ID" value={displayText(row.mboClickId)} />
        <DetailCell label="Sub IDs" value={displayText(row.subIds)} />
        <DetailCell label="Impressions" value={displayNumber(row.impressions)} />
        <DetailCell label="MBO Link Clicks" value={displayNumber(row.mboLinkClicks)} />
        <DetailCell label="Unique Clicks" value={displayNumber(row.uniqueClicks)} />
        <DetailCell label="Conversion Rate" value={displayPercent(row.conversionRate)} />
        <DetailCell label="Pending Orders" value={displayNumber(row.pendingOrders)} />
        <DetailCell label="Paid Orders" value={displayNumber(row.paidOrders)} />
        <DetailCell label="Pending Order Value" value={money(row.pendingOrderValue)} />
        <DetailCell label="Confirmed Order Value" value={money(row.confirmedOrderValue)} />
        <DetailCell label="Cancelled Order Value" value={money(row.cancelledOrderValue)} />
        {canFinance ? (
          <>
            <DetailCell label="Pending Commission" value={money(row.pendingCommission)} />
            <DetailCell label="Rejected Commission" value={money(row.rejectedCommission)} />
            <DetailCell label="Payable Commission" value={money(row.payableCommission)} />
            <DetailCell label="Paid Commission" value={money(row.paidCommission)} />
            <DetailCell label="MBO Receivable" value={money(row.mboReceivable)} />
            <DetailCell label="MBO Received" value={money(row.mboActuallyReceived)} />
          </>
        ) : null}
        <DetailCell label="Device / Platform" value={displayText(row.devicePlatform)} />
        <DetailCell label="AOV" value={money(row.aov)} />
        <DetailCell label="EPC" value={money(row.epc)} />
        <DetailCell label="Attribution" value={displayText(row.attribution || row.attributionStatus)} />
        <DetailCell label="Raw Status" value={displayText(row.rawStatus)} />
        <DetailCell label="MBO Standard Status" value={displayText(row.mboStandardStatus)} />
        <DetailCell label="Raw Payload ID" value={displayText(row.rawPayloadId)} />
        <DetailCell label="Source Endpoint" value={displayText(row.sourceEndpoint)} />
        <DetailCell label="Report Granularity" value={displayText(row.reportGranularity)} />
        <DetailCell label="Last Synced" value={displayDateTime(row.lastSyncedAt)} />
        <DetailCell label="Last Updated" value={displayDateTime(row.lastUpdatedAt)} />
        <DetailCell label="Reconciliation" value={displayText(row.reconciliation || row.reconciliationStatus)} />
      </div>
    </details>
  );
}

/**
 * Staff Raw Network Performance — /ops/admin/performance.
 * Always NetworkPerformanceFact (14E). Client DailyReport lives under Reporting → Raw Performance.
 */
export function AdminPerformancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canFinance =
    hasPermission(user, PERMISSIONS.FINANCE_OPS_READ) || hasPermission(user, PERMISSIONS.COMMISSION_READ);

  const [filters, setFilters] = useState(PERFORMANCE_EMPTY_FILTERS);
  const queryFilters = useMemo(() => {
    const next = {};
    if (filters.search?.trim()) next.q = filters.search.trim();
    if (filters.network) next.network = filters.network;
    if (filters.brand?.trim()) next.brand = filters.brand.trim();
    if (filters.campaignType) next.campaignType = filters.campaignType;
    if (filters.status) next.status = filters.status;
    if (filters.country?.trim()) next.country = filters.country.trim();
    if (filters.currency?.trim()) next.currency = filters.currency.trim();
    if (filters.category?.trim() && !next.brand) next.brand = filters.category.trim();
    if (filters.date) {
      next.date = filters.date;
    } else {
      if (filters.from) next.from = filters.from;
      if (filters.to) next.to = filters.to;
    }
    next.grain = "network";
    return next;
  }, [filters]);

  const { rows, loading, error, reload, refresh, page, setPage, pagination, extras } = usePagedQuery(
    "/ops/admin/performance",
    queryFilters,
    { pageSize: 25 },
  );

  // Bust session cache once on mount so enriched couponCode (e.g. Optimise mp393) is not stuck.
  useEffect(() => {
    invalidateApiCache("/ops/admin/performance");
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only bust
  }, []);

  const unavailable = extras?.unavailableFields || [];
  const kpis = extras?.kpis || {};

  async function exportFullData() {
    try {
      const response = await fetchApi("/ops/admin/performance", {
        ...queryFilters,
        page: 1,
        pageSize: 100,
      });
      const items = response?.data ?? response?.rows ?? rows;
      exportPerformanceCsv("04A_performance_report.csv", items);
    } catch {
      exportPerformanceCsv("04A_performance_report.csv", rows);
    }
  }

  const columns = useMemo(() => {
    // v13 04A_Performance_Report_Tab default columns (+ Network Source retained as source context).
    const cols = [
      {
        key: "networkSource",
        label: "Network Source",
        minWidth: 120,
        title: "supplier — retained as internal source context",
        render: (r) => (
          <div>
            <div className="font-semibold text-slate-900">
              {networkDisplayName(r.networkSource || r.network) || "—"}
            </div>
            <div className="text-[11px] text-slate-500">{displayText(r.networkAccount)}</div>
          </div>
        ),
      },
      {
        key: "brandName",
        label: "Brand Name",
        minWidth: 140,
        title: "merchantName",
        render: (r) => (
          <div>
            <div className="font-semibold text-slate-900">{displayText(r.brandName)}</div>
            {r.campaignName ? (
              <div className="text-[12px] text-slate-600">{displayText(r.campaignName)}</div>
            ) : null}
          </div>
        ),
      },
      {
        key: "campaignType",
        label: "Campaign Type (Coupon Or Link)",
        minWidth: 160,
        title: "channelType",
        render: (r) =>
          displayText(r.campaignType || campaignTypeLabel(r.campaignChannelType)),
      },
      {
        key: "couponCode",
        label: "Coupon Code",
        minWidth: 100,
        title: "couponCode",
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
        key: "linkClicks",
        label: "Link Clicks",
        minWidth: 100,
        className: "tabular-nums",
        title: "linkClicks — network-reported clicks (never MBO clicks)",
        render: (r) => displayNumber(resolveLinkClicks(r)),
      },
      {
        key: "grossOrders",
        label: "Gross Orders",
        minWidth: 100,
        className: "tabular-nums",
        title: "grossOrders — do not subtract cancelled here",
        render: (r) => displayNumber(r.grossOrders),
      },
      {
        key: "grossOrderValue",
        label: "Gross Order Value",
        minWidth: 120,
        className: "tabular-nums",
        title: "grossOrderValue",
        render: (r) => displayMoney(r.grossOrderValue, r.currency),
      },
    ];
    if (canFinance) {
      cols.push({
        key: "grossCommission",
        label: "Gross Commission",
        minWidth: 120,
        className: "tabular-nums",
        title: "grossCommission — supplier gross before MBO/client split",
        render: (r) => displayMoney(r.grossCommission, r.currency),
      });
    }
    cols.push(
      {
        key: "netOrders",
        label: "Net Orders",
        minWidth: 90,
        className: "tabular-nums",
        title: "netOrders — often equals confirmed orders",
        render: (r) => displayNumber(resolveNetOrders(r)),
      },
      {
        key: "netOrderValue",
        label: "Net Order Value",
        minWidth: 120,
        className: "tabular-nums",
        title: "netOrderValue",
        render: (r) => displayMoney(resolveNetOrderValue(r), r.currency),
      },
    );
    if (canFinance) {
      cols.push({
        key: "netCommission",
        label: "Net Commission",
        minWidth: 120,
        className: "tabular-nums",
        title: "netCommission — confirmed/approved supplier commission",
        render: (r) => (
          <span className="font-semibold">{displayMoney(resolveNetCommission(r), r.currency)}</span>
        ),
      });
    }
    cols.push(
      {
        key: "confirmedOrders",
        label: "Confirmed Orders",
        minWidth: 110,
        className: "tabular-nums",
        title: "confirmedOrders",
        render: (r) => displayNumber(r.confirmedOrders),
      },
      {
        key: "currency",
        label: "Currency",
        minWidth: 80,
        title: "currency",
        render: (r) => displayText(r.currency),
      },
      {
        key: "date",
        label: "Date",
        minWidth: 110,
        title: "reportDate",
        render: (r) => displayDate(r.date || r.reportDate),
      },
      {
        key: "everything",
        label: "Everything",
        minWidth: 160,
        render: (r) => <ViewEverything row={r} canFinance={canFinance} />,
      },
    );
    return cols;
  }, [canFinance]);

  return (
    <PageLayout
      eyebrow="Network Operations"
      title="Raw Network Performance"
      subtitle="Exact top-level fields from 04A_Performance_Report_Tab. Network Source is retained as internal source context."
      actions={
        <>
          <Button variant="secondary" onClick={exportFullData}>
            Export Full Data
          </Button>
          <Button
            className="border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => navigate("/ops/reconciliation")}
          >
            Reconciliation
          </Button>
        </>
      }
    >
      {!canFinance ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Commission columns are hidden — finance permission required.
        </p>
      ) : null}

      <KpiGrid columns={5}>
        <KpiStat
          label="Link Clicks"
          value={displayNumber(kpis.linkClicks ?? kpis.networkClicks)}
          hint="Network-reported"
          loading={loading}
        />
        <KpiStat
          label="Gross Orders"
          value={displayNumber(kpis.grossOrders)}
          hint="All statuses"
          loading={loading}
        />
        <KpiStat
          label="Net Orders"
          value={displayNumber(kpis.netOrders ?? kpis.confirmedOrders)}
          hint="Confirmed / net"
          loading={loading}
          tone="success"
        />
        {canFinance ? (
          <>
            <KpiStat
              label="Gross Commission"
              value={displayCompactMoney(kpis.grossCommission)}
              hint="Supplier gross"
              loading={loading}
            />
            <KpiStat
              label="Net Commission"
              value={displayCompactMoney(kpis.netCommission ?? kpis.mboReceivable ?? kpis.confirmedCommission)}
              hint="Confirmed / net"
              loading={loading}
            />
          </>
        ) : (
          <>
            <KpiStat label="Gross Commission" value="—" hint="Finance permission required" loading={loading} />
            <KpiStat label="Net Commission" value="—" hint="Finance permission required" loading={loading} />
          </>
        )}
      </KpiGrid>

      {unavailable.length ? (
        <p className="text-[11px] text-slate-500">
          Intentionally unavailable when empty: {unavailable.slice(0, 8).join(", ")}
        </p>
      ) : null}

      <div className="mb-4">
        <FilterBar
          values={filters}
          onChange={(key, value) => {
            setFilters((prev) => {
              const next = { ...prev, [key]: value };
              if (key === "date" && value) {
                next.from = "";
                next.to = "";
              }
              if ((key === "from" || key === "to") && value) {
                next.date = "";
              }
              return next;
            });
          }}
          onReset={() => setFilters(PERFORMANCE_EMPTY_FILTERS)}
          filters={PERFORMANCE_FILTER_DEFINITIONS}
        />
        <div className="mt-3">
          <Button onClick={() => reload()}>Apply</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">Performance Reports</h2>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-500">
            04A_Performance_Report_Tab
          </span>
        </div>

        <div className="p-4">
          <DataTable
            columns={columns}
            rows={rows}
            loading={loading}
            error={error}
            onRetry={reload}
            emptyTitle="No network performance facts"
            page={page}
            onPageChange={setPage}
            totalPages={pagination?.totalPages}
            total={pagination?.total}
            dense
          />
        </div>
      </div>
    </PageLayout>
  );
}
