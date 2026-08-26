import { useMemo, useState } from "react";
import { postApi } from "../../api";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { DataTable } from "../ui/DataTable";
import { Drawer } from "../ui/Drawer";
import { FilterBar } from "../ui/FilterBar";
import { KpiGrid, KpiStat } from "../ui/KpiStat";
import { StatusPill } from "../ui/StatusPill";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { displayDate, displayNumber, displayText } from "../../utils/display";
import { NETWORK_CAMPAIGN_FILTER_DEFINITIONS } from "../../pages/ops/networkCampaignFilters";

function formatEnumLabel(value) {
  if (value == null || value === "") return "—";
  return String(value)
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function DetailField({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 break-all text-sm text-slate-800">{children ?? "—"}</dd>
    </div>
  );
}

const COUPON_POOL_EMPTY_FILTERS = {
  search: "",
  network: "",
  country: "",
  campaignStatus: "",
  relationshipStatus: "",
  isAssignable: "",
  campaignType: "",
  category: "",
  currency: "",
  campaign: "",
  status: "",
  source: "",
  scope: "",
  newCodeAlert: "",
  validity: "",
};

const COUPON_POOL_FILTER_DEFINITIONS = [
  ...NETWORK_CAMPAIGN_FILTER_DEFINITIONS.filter(
    (f) => !["recordType", "sourceStatus", "issue"].includes(f.key),
  ).map((f) =>
    f.key === "search"
      ? { ...f, placeholder: "Code, brand, campaign, IDs, category, country…" }
      : f,
  ),
  {
    key: "campaign",
    label: "Campaign",
    type: "text",
    placeholder: "Campaign / brand…",
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "ACTIVE", label: "Active" },
      { value: "EXPIRED", label: "Expired" },
      { value: "DISABLED", label: "Disabled" },
      { value: "SCHEDULED", label: "Scheduled" },
      { value: "UNKNOWN", label: "Unknown" },
    ],
  },
  {
    key: "source",
    label: "Source",
    options: [
      { value: "NETWORK_API", label: "Network API" },
      { value: "MANUAL_EMAIL", label: "Manual Email" },
      { value: "MANUAL", label: "Manual" },
      { value: "EXCEL", label: "Excel" },
      { value: "ACCOUNT_MANAGER", label: "Account Manager" },
      { value: "BRAND", label: "Brand" },
      { value: "UNKNOWN", label: "Unknown" },
    ],
  },
  {
    key: "scope",
    label: "Scope",
    options: [
      { value: "SHARED_LIMITED", label: "Shared Limited" },
      { value: "UNIQUE_TO_CLIENT", label: "Unique to Client" },
      { value: "UNLIMITED", label: "Unlimited" },
      { value: "UNKNOWN", label: "Unknown" },
    ],
  },
  {
    key: "newCodeAlert",
    label: "Alert",
    options: [
      { value: "true", label: "New code alerts" },
      { value: "false", label: "No alert" },
    ],
  },
  {
    key: "validity",
    label: "Validity",
    options: [
      { value: "active", label: "Valid / active" },
      { value: "expired", label: "Expired" },
      { value: "disabled", label: "Disabled" },
    ],
  },
];

/**
 * CouponCodeMaster operational pool — lives on /admin/coupons (canonical).
 * assignedQuantity = MBO allocation usage, not network redemption.
 * Do not invent codes, totals, dates, or alerts.
 */
export function CouponPoolPanel() {
  const [filters, setFilters] = useState(COUPON_POOL_EMPTY_FILTERS);
  const [detail, setDetail] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);

  const queryFilters = useMemo(() => {
    const f = filters;
    const query = {};
    const qParts = [f.search?.trim()].filter(Boolean);
    if (qParts.length) query.q = qParts.join(" ");
    if (f.network) query.network = f.network;
    if (f.campaign?.trim()) query.campaign = f.campaign.trim();
    else if (f.category?.trim()) query.campaign = f.category.trim();
    if (f.status) query.status = f.status;
    if (f.source) query.source = f.source;
    if (f.scope) query.scope = f.scope;
    if (f.newCodeAlert) query.newCodeAlert = f.newCodeAlert;
    if (f.validity) query.validity = f.validity;
    return query;
  }, [filters]);

  const { rows, loading, error, reload, page, setPage, pageSize, pagination, extras } = usePagedQuery(
    "/admin/coupons/pool",
    queryFilters,
    { pageSize: 25 },
  );
  const kpis = extras?.kpis || {};

  async function reviewAlert(id) {
    setActionBusy(true);
    try {
      await postApi(`/admin/coupons/pool/${id}/review-alert`, {});
      await reload();
      setDetail((d) => (d?.id === id ? { ...d, newCodeAlert: false, alertReason: null } : d));
    } finally {
      setActionBusy(false);
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "network",
        label: "Network",
        minWidth: 100,
        render: (r) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{displayText(r.network)}</p>
            <p className="truncate text-xs text-slate-500">{displayText(r.networkAccount)}</p>
          </div>
        ),
      },
      {
        key: "campaignSource",
        label: "Campaign Source",
        minWidth: 120,
        render: (r) => (
          <span className="font-mono text-xs" title={r.campaignSourceId || ""}>
            {r.campaignSourceId
              ? `${String(r.campaignSourceId).slice(0, 10)}…`
              : "—"}
          </span>
        ),
      },
      {
        key: "brandCampaign",
        label: "Brand / Campaign",
        minWidth: 180,
        render: (r) => (
          <button
            type="button"
            className="min-w-0 text-left"
            onClick={() => setDetail(r)}
          >
            <p className="truncate font-medium text-slate-900">{displayText(r.brandName || r.brand)}</p>
            <p className="truncate text-sm text-brand-800 hover:underline">
              {displayText(r.campaignName || r.campaign)}
            </p>
          </button>
        ),
      },
      {
        key: "couponCode",
        label: "Coupon Code",
        minWidth: 110,
        render: (r) => {
          const code = r.couponCode && !/^https?:\/\//i.test(String(r.couponCode)) ? r.couponCode : null;
          if (code) {
            return (
              <Badge variant="info" className="bg-blue-50 font-mono text-xs text-blue-700">
                {code}
              </Badge>
            );
          }
          if (r.couponLink) {
            return (
              <span className="text-xs text-slate-500" title={r.couponLink}>
                Link only
              </span>
            );
          }
          return "—";
        },
      },
      {
        key: "couponType",
        label: "Coupon Type",
        minWidth: 100,
        render: (r) =>
          r.couponType ? (
            <Badge variant="default" className="bg-slate-100 font-mono text-xs text-slate-700">
              {String(r.couponType).toUpperCase()}
            </Badge>
          ) : (
            "—"
          ),
      },
      {
        key: "status",
        label: "Status",
        minWidth: 90,
        render: (r) => <StatusPill status={r.status} />,
      },
      {
        key: "source",
        label: "Source",
        minWidth: 100,
        render: (r) => formatEnumLabel(r.source),
      },
      {
        key: "scope",
        label: "Scope",
        minWidth: 110,
        render: (r) => formatEnumLabel(r.scope),
      },
      {
        key: "total",
        label: "Total",
        minWidth: 70,
        render: (r) => (
          <span className="tabular-nums">{displayNumber(r.totalQuantity)}</span>
        ),
      },
      {
        key: "assigned",
        label: "Assigned",
        minWidth: 80,
        render: (r) => (
          <span className="tabular-nums">{displayNumber(r.assignedQuantity)}</span>
        ),
      },
      {
        key: "remaining",
        label: "Remaining",
        minWidth: 90,
        render: (r) => (
          <span className="tabular-nums">{displayNumber(r.remainingQuantity)}</span>
        ),
      },
      {
        key: "status",
        label: "Status",
        minWidth: 90,
        render: (r) => (r.status != null ? <StatusPill status={r.status} /> : "—"),
      },
      {
        key: "validFrom",
        label: "Valid From",
        minWidth: 100,
        defaultHidden: true,
        render: (r) => displayDate(r.validFrom),
      },
      {
        key: "validUntil",
        label: "Valid Until",
        minWidth: 100,
        render: (r) => displayDate(r.validUntil),
      },
      {
        key: "newCodeAlert",
        label: "New Code Alert",
        minWidth: 110,
        render: (r) =>
          r.newCodeAlert ? <Badge variant="warning">New code</Badge> : "—",
      },
      {
        key: "detectedAt",
        label: "Detected",
        minWidth: 100,
        render: (r) => displayDate(r.detectedAt),
      },
      {
        key: "lastUpdatedAt",
        label: "Last Updated",
        minWidth: 110,
        defaultHidden: true,
        render: (r) => displayDate(r.lastUpdatedAt),
      },
      {
        key: "action",
        label: "Action",
        minWidth: 140,
        render: (r) => (
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="secondary" onClick={() => setDetail(r)}>
              View Usage
            </Button>
            {r.newCodeAlert ? (
              <Button
                size="sm"
                className="border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                disabled={actionBusy}
                onClick={() => reviewAlert(r.id)}
              >
                Review Alert
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reviewAlert uses reload
    [actionBusy],
  );

  return (
    <div className="space-y-4">
      <KpiGrid>
        <KpiStat
          label="Coupon Records"
          value={displayNumber(kpis.couponRecords)}
          hint="All active sources"
          loading={loading}
        />
        <KpiStat
          label="Available Quantity"
          value={kpis.knownInventoryRows > 0 ? displayNumber(kpis.availableQuantity) : null}
          hint={kpis.knownInventoryRows > 0 ? "Remaining" : "Not provided by network"}
          loading={loading}
        />
        <KpiStat
          label="New Code Alerts"
          value={displayNumber(kpis.newCodeAlerts)}
          hint="Review queue"
          loading={loading}
          tone="warning"
        />
        <KpiStat
          label="Shared Codes"
          value={displayNumber(kpis.sharedCodes)}
          hint="By scope"
          loading={loading}
        />
        <KpiStat
          label="Expired / Disabled"
          value={displayNumber(kpis.expiredDisabled)}
          hint="Not available"
          loading={loading}
        />
      </KpiGrid>

      <FilterBar
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onReset={() => setFilters(COUPON_POOL_EMPTY_FILTERS)}
        filters={COUPON_POOL_FILTER_DEFINITIONS}
      />

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No coupon pool records"
        emptyDescription="No CouponCodeMaster records match these filters. Impact promotions are not coupon codes."
        page={page}
        totalPages={pagination?.totalPages}
        total={pagination?.total}
        pageSize={pagination?.pageSize ?? pageSize}
        onPageChange={setPage}
        onRefresh={reload}
        dense
      />

      <Drawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.couponCode || "Coupon"}
      >
        {detail ? (
          <div className="space-y-6">
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Identity
              </h3>
              <dl className="grid grid-cols-2 gap-3">
                <DetailField label="Coupon code">{displayText(detail.couponCode)}</DetailField>
                <DetailField label="Coupon type">{displayText(detail.couponType)}</DetailField>
                <DetailField label="Network">{displayText(detail.network)}</DetailField>
                <DetailField label="Network account">{displayText(detail.networkAccount)}</DetailField>
                <DetailField label="Campaign source">{displayText(detail.campaignSourceId)}</DetailField>
                <DetailField label="Brand">{displayText(detail.brandName || detail.brand)}</DetailField>
                <DetailField label="Campaign">{displayText(detail.campaignName || detail.campaign)}</DetailField>
              </dl>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Inventory
              </h3>
              <dl className="grid grid-cols-2 gap-3">
                <DetailField label="Total">{displayNumber(detail.totalQuantity)}</DetailField>
                <DetailField label="Assigned">{displayNumber(detail.assignedQuantity)}</DetailField>
                <DetailField label="Remaining">{displayNumber(detail.remainingQuantity)}</DetailField>
                <DetailField label="Scope">{formatEnumLabel(detail.scope)}</DetailField>
              </dl>
              <p className="mt-2 text-xs text-slate-500">{detail.note}</p>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Validity
              </h3>
              <dl className="grid grid-cols-2 gap-3">
                <DetailField label="Valid from">{displayDate(detail.validFrom)}</DetailField>
                <DetailField label="Valid until">{displayDate(detail.validUntil)}</DetailField>
                <DetailField label="Status">
                  {detail.status != null ? <StatusPill status={detail.status} /> : "—"}
                </DetailField>
              </dl>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Source
              </h3>
              <dl className="grid grid-cols-2 gap-3">
                <DetailField label="Source">{formatEnumLabel(detail.source)}</DetailField>
                <DetailField label="Raw payload ID">{displayText(detail.rawPayloadId)}</DetailField>
                <DetailField label="Supplier coupon ID">
                  {displayText(detail.supplierCouponExtId || detail.supplierCouponId)}
                </DetailField>
                <DetailField label="Detected">{displayDate(detail.detectedAt)}</DetailField>
                <DetailField label="Last updated">{displayDate(detail.lastUpdatedAt)}</DetailField>
              </dl>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Alert
              </h3>
              <dl className="grid grid-cols-2 gap-3">
                <DetailField label="New code alert">
                  {detail.newCodeAlert ? "New code" : "—"}
                </DetailField>
                <DetailField label="Alert reason">
                  {detail.newCodeAlert ? displayText(detail.alertReason) : "—"}
                </DetailField>
                <DetailField label="Reviewed at">{displayDate(detail.alertReviewedAt)}</DetailField>
              </dl>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Usage
              </h3>
              <dl className="grid grid-cols-2 gap-3">
                <DetailField label="Assigned (MBO allocation)">
                  {displayNumber(detail.assignedQuantity)}
                </DetailField>
                <DetailField label="Remaining">{displayNumber(detail.remainingQuantity)}</DetailField>
              </dl>
            </section>

            <section className="flex flex-wrap gap-2">
              {detail.newCodeAlert ? (
                <Button size="sm" disabled={actionBusy} onClick={() => reviewAlert(detail.id)}>
                  Review Alert
                </Button>
              ) : null}
              <Button size="sm" variant="secondary" onClick={() => setDetail(null)}>
                Close
              </Button>
            </section>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
