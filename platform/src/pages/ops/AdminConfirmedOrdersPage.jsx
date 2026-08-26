import { useMemo, useState } from "react";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Input, Select } from "../../components/ui/FormControls";
import { Button } from "../../components/ui/Button";
import { KpiGrid, KpiStat } from "../../components/ui/KpiStat";
import {
  displayDate,
  displayDateTime,
  displayMoney,
  displayNumber,
  displayText,
} from "../../utils/display";
import {
  CONFIRMED_ORDERS_FIELDS,
  REPORTING_NETWORKS,
  exportRowsCsv,
} from "./reportingV20Fields";
import { ReportViewBuilder, useSavedReportViews } from "./ReportViewBuilder";
import { todayIso, yearStartIso } from "./reportingDateDefaults";

const CONFIRMED_NETWORKS = REPORTING_NETWORKS.filter((n) => n.value !== "BOOSTINY");

const MONEY_KEYS = new Set([
  "orderValue",
  "confirmedNetworkCommission",
  "clientCommissionAmount",
  "mboCommissionAmount",
]);
const DATE_KEYS = new Set(["orderConfirmedDate", "orderDate"]);
const DATETIME_KEYS = new Set(["lastUpdatedAt"]);

function mapConfirmedOrder(r) {
  return {
    orderConfirmedDate: r.orderConfirmedDate ?? r.confirmedDate ?? null,
    orderDate: r.orderDate ?? null,
    network: r.network ?? null,
    brandName: r.brandName || r.merchantName || null,
    campaignName: r.campaignName ?? null,
    campaignType: r.campaignType ?? null,
    country: r.country ?? null,
    customerType: r.customerType ?? null,
    currency: r.currency ?? r.commissionCurrency ?? null,
    couponCode: r.couponCode ?? null,
    mboTrackingLink: r.mboTrackingLink ?? null,
    networkOrderId: r.networkOrderId ?? r.supplierOrderId ?? null,
    networkConversionId: r.networkConversionId ?? null,
    networkClickId: r.networkClickId ?? null,
    mboClickId: r.mboClickId ?? null,
    clientName: r.clientName ?? null,
    clientCampaignAssignmentId: r.clientCampaignAssignmentId ?? null,
    orderValue: r.orderValue ?? null,
    confirmedNetworkCommission:
      r.confirmedNetworkCommission ??
      r.supplierActualCommission ??
      r.commission ??
      null,
    clientCommissionRate: r.clientCommissionRate ?? r.clientSharePercent ?? null,
    clientCommissionAmount: r.clientCommissionAmount ?? r.clientCommission ?? null,
    mboCommissionAmount: r.mboCommissionAmount ?? r.mboCommissionMargin ?? null,
    networkOrderStatusRaw: r.networkOrderStatusRaw ?? r.rawStatus ?? null,
    mboOrderStatus: r.mboOrderStatus ?? r.mboStatus ?? r.orderStatus ?? null,
    lastUpdatedAt: r.lastUpdatedAt ?? r.lastSyncedAt ?? null,
    _currency: r.currency ?? r.commissionCurrency ?? null,
  };
}

function sumField(rows, key) {
  let total = 0;
  let any = false;
  for (const r of rows) {
    const n = Number(r[key]);
    if (Number.isFinite(n)) {
      total += n;
      any = true;
    }
  }
  return any ? total : null;
}

/**
 * Confirmed Orders — order-level confirmed/approved (Boostiny excluded from individual table).
 */
export function AdminConfirmedOrdersPage() {
  const [filters, setFilters] = useState(() => ({
    network: "",
    campaignType: "",
    from: yearStartIso(),
    to: todayIso(),
    q: "",
  }));
  const [applied, setApplied] = useState(filters);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [draftKeys, setDraftKeys] = useState([]);
  const [draftName, setDraftName] = useState("");

  const views = useSavedReportViews("mboConfirmedOrdersViews", CONFIRMED_ORDERS_FIELDS, {
    full: {
      name: "Confirmed Orders - Full",
      keys: CONFIRMED_ORDERS_FIELDS.map((f) => f.key),
      filters: {},
    },
  });

  const queryFilters = useMemo(() => {
    const next = { confirmed: "true" };
    if (applied.from) next.from = applied.from;
    if (applied.to) next.to = applied.to;
    if (applied.network) next.network = applied.network;
    if (applied.q?.trim()) next.q = applied.q.trim();
    return next;
  }, [applied]);

  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/ops/admin/orders",
    queryFilters,
    { pageSize: 50 },
  );

  const mappedRows = useMemo(() => {
    const list = (rows || [])
      .filter((r) => String(r.network || "").toUpperCase() !== "BOOSTINY")
      .map(mapConfirmedOrder);
    const type = applied.campaignType;
    const needle = (applied.q || "").trim().toLowerCase();
    return list.filter((r) => {
      if (type === "Coupon" && r.campaignType !== "Coupon") return false;
      if (type === "Affiliate Link" && r.campaignType !== "Affiliate Link") return false;
      if (!needle) return true;
      return [
        r.clientName,
        r.brandName,
        r.campaignName,
        r.couponCode,
        r.networkOrderId,
        r.networkConversionId,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [rows, applied.campaignType, applied.q]);

  const rowKpis = useMemo(() => {
    const currency = mappedRows.find((r) => r.currency)?.currency || null;
    return {
      confirmedOrders: mappedRows.length || null,
      confirmedOrderValue: sumField(mappedRows, "orderValue"),
      confirmedNetworkCommission: sumField(mappedRows, "confirmedNetworkCommission"),
      clientCommission: sumField(mappedRows, "clientCommissionAmount"),
      mboCommission: sumField(mappedRows, "mboCommissionAmount"),
      networks: new Set(mappedRows.map((r) => r.network).filter(Boolean)).size || null,
      currency,
    };
  }, [mappedRows]);

  const columns = useMemo(() => {
    const byKey = Object.fromEntries(CONFIRMED_ORDERS_FIELDS.map((f) => [f.key, f]));
    return views.activeKeys
      .filter((k) => byKey[k])
      .map((key) => {
        const field = byKey[key];
        const col = { key, label: field.label, minWidth: 110 };
        if (MONEY_KEYS.has(key)) {
          col.className = "tabular-nums text-right";
          col.render = (r) => displayMoney(r[key], r._currency || r.currency);
        } else if (DATE_KEYS.has(key)) {
          col.render = (r) => displayDate(r[key]);
        } else if (DATETIME_KEYS.has(key)) {
          col.render = (r) => displayDateTime(r[key]);
        } else if (
          key.includes("Id") ||
          key === "couponCode" ||
          key === "mboTrackingLink" ||
          key === "clientCampaignAssignmentId"
        ) {
          col.render = (r) => (
            <span className="block max-w-[180px] truncate font-mono text-[11px]" title={r[key] || ""}>
              {r[key] || "—"}
            </span>
          );
        } else {
          col.render = (r) => displayText(r[key]);
        }
        return col;
      });
  }, [views.activeKeys]);

  function openBuilder() {
    setDraftKeys([...views.activeKeys]);
    setDraftName(views.activeName);
    setBuilderOpen(true);
  }

  function applyBuilder(save) {
    if (!draftKeys.length) return;
    views.setActiveKeys([...draftKeys]);
    views.setActiveName(draftName.trim() || "Custom View");
    if (save) {
      views.saveAsNew(draftName.trim() || "Custom View", draftKeys, { ...applied });
    }
    setBuilderOpen(false);
  }

  function exportCurrent() {
    exportRowsCsv(
      views.activeName || "confirmed_orders",
      CONFIRMED_ORDERS_FIELDS,
      views.activeKeys,
      mappedRows,
    );
  }

  return (
    <PageLayout
      title="Confirmed Orders"
      subtitle="Individual orders confirmed or approved by networks that provide order-level confirmation."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openBuilder}>
            Custom Report View
          </Button>
          <Button variant="secondary" onClick={exportCurrent} disabled={!mappedRows.length}>
            Export Current View
          </Button>
        </div>
      }
    >
      <KpiGrid className="mb-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" columns={6}>
        <KpiStat
          label="Confirmed Orders"
          value={displayNumber(rowKpis.confirmedOrders)}
          hint="Order-level networks only (loaded page)"
          loading={loading}
        />
        <KpiStat
          label="Confirmed Order Value"
          value={displayMoney(rowKpis.confirmedOrderValue, rowKpis.currency)}
          hint="Validated orders"
          loading={loading}
        />
        <KpiStat
          label="Confirmed Network Commission"
          value={displayMoney(rowKpis.confirmedNetworkCommission, rowKpis.currency)}
          hint="Final network commission"
          loading={loading}
        />
        <KpiStat
          label="Client Commission"
          value={displayMoney(rowKpis.clientCommission, rowKpis.currency)}
          hint="Calculated from client commercials"
          loading={loading}
        />
        <KpiStat
          label="MBO Commission"
          value={displayMoney(rowKpis.mboCommission, rowKpis.currency)}
          hint="Confirmed network − client commission"
          loading={loading}
        />
        <KpiStat
          label="Networks"
          value={displayNumber(rowKpis.networks)}
          hint="Boostiny excluded from individual table"
          loading={loading}
        />
      </KpiGrid>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <Select
          label="Saved Report View"
          value={views.activeId}
          onChange={(e) => views.loadView(e.target.value)}
          options={views.viewOptions}
        />
        <Select
          label="Network"
          value={filters.network}
          onChange={(e) => setFilters((p) => ({ ...p, network: e.target.value }))}
          options={CONFIRMED_NETWORKS}
        />
        <Select
          label="Campaign Type"
          value={filters.campaignType}
          onChange={(e) => setFilters((p) => ({ ...p, campaignType: e.target.value }))}
          options={[
            { value: "", label: "All Types" },
            { value: "Coupon", label: "Coupon" },
            { value: "Affiliate Link", label: "Affiliate Link" },
          ]}
        />
        <Input
          label="From"
          type="date"
          value={filters.from}
          onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
        />
        <Input
          label="To"
          type="date"
          value={filters.to}
          onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
        />
        <Input
          label="Search"
          placeholder="Client, brand, campaign, order ID, coupon"
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
        />
        <Button
          onClick={() => {
            setApplied({ ...filters });
            setPage(1);
          }}
        >
          Apply
        </Button>
        <Button variant="secondary" onClick={openBuilder}>
          Edit View
        </Button>
        <Button variant="secondary" onClick={() => views.saveCurrent({ ...applied })}>
          Save Changes
        </Button>
        <Button variant="secondary" onClick={() => reload()}>
          Refresh
        </Button>
      </div>

      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{views.activeName}</h2>
          <p className="text-xs text-slate-500">
            Saved views control columns and filters. Export follows the active saved view and
            current results.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
          {views.activeKeys.length} columns
        </span>
      </div>

      <DataTable
        columns={columns}
        rows={mappedRows}
        loading={loading}
        error={error}
        onRetry={reload}
        page={page}
        onPageChange={setPage}
        pagination={pagination}
        emptyMessage="No confirmed orders for this period."
      />

      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
        <b>Boostiny rule:</b> Partner Payment provides aggregate confirmation by payment source/cycle.
        Those totals can feed summaries and client settlement, but no individual Boostiny order is
        inserted into this table unless Boostiny itself supplies individual confirmation data.
      </div>

      <ReportViewBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        catalogFields={CONFIRMED_ORDERS_FIELDS}
        viewName={draftName}
        onViewNameChange={setDraftName}
        selectedKeys={draftKeys}
        onSelectedKeysChange={setDraftKeys}
        onApply={applyBuilder}
        title="Confirmed Orders Custom Report View"
        subtitle="Choose which Confirmed Orders fields appear and export."
      />
    </PageLayout>
  );
}
