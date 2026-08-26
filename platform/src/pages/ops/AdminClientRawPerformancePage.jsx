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
  RAW_PERFORMANCE_FIELDS,
  REPORTING_NETWORKS,
  exportRowsCsv,
} from "./reportingV20Fields";
import { ReportViewBuilder, useSavedReportViews } from "./ReportViewBuilder";
import { todayIso, yearStartIso } from "./reportingDateDefaults";

const GRANULARITY_OPTIONS = [
  { value: "", label: "All" },
  { value: "ORDER", label: "ORDER" },
  { value: "MIXED_AGGREGATE", label: "MIXED_AGGREGATE" },
];

const MONEY_KEYS = new Set([
  "grossOrderValue",
  "netOrderValue",
  "grossCommission",
  "pendingCommission",
  "netCommission",
]);
const NUMBER_KEYS = new Set([
  "networkClicks",
  "mboLinkClicks",
  "grossOrders",
  "pendingOrders",
  "confirmedOrders",
  "cancelledOrders",
  "rejectedOrders",
]);
const DATE_KEYS = new Set(["date", "orderDate", "orderConfirmedDate"]);
const DATETIME_KEYS = new Set(["lastUpdatedAt"]);

function mapRawRow(r) {
  return {
    date: r.date ?? r.reportDate ?? null,
    network: r.network || r.networkSource || null,
    reportGranularity: r.reportGranularity ?? null,
    brandName: r.brandName ?? null,
    campaignName: r.campaignName ?? null,
    campaignType: r.campaignType ?? r.campaignChannelType ?? null,
    country: r.country ?? null,
    customerType: r.customerType ?? null,
    currency: r.currency ?? null,
    couponCode: r.couponCode ?? null,
    networkOrderId: r.networkOrderId ?? r.supplierOrderId ?? null,
    networkConversionId: r.networkConversionId ?? null,
    networkClickId: r.networkClickId ?? null,
    subId1: r.subId1 ?? null,
    networkClicks: r.networkClicks ?? r.linkClicks ?? null,
    mboLinkClicks: r.mboLinkClicks ?? null,
    grossOrders: r.grossOrders ?? null,
    pendingOrders: r.pendingOrders ?? null,
    confirmedOrders: r.confirmedOrders ?? null,
    cancelledOrders: r.cancelledOrders ?? r.cancelOrders ?? null,
    rejectedOrders: r.rejectedOrders ?? null,
    grossOrderValue: r.grossOrderValue ?? null,
    netOrderValue: r.netOrderValue ?? r.confirmedOrderValue ?? null,
    grossCommission: r.grossCommission ?? null,
    pendingCommission: r.pendingCommission ?? null,
    netCommission: r.netCommission ?? r.confirmedCommission ?? null,
    networkOrderStatusRaw: r.networkOrderStatusRaw ?? r.rawStatus ?? null,
    orderDate: r.orderDate ?? null,
    orderConfirmedDate: r.orderConfirmedDate ?? r.orderConfirmDate ?? null,
    lastUpdatedAt: r.lastUpdatedAt ?? r.lastSyncedAt ?? null,
    sourceEndpoint: r.sourceEndpoint ?? null,
    _currency: r.currency ?? null,
  };
}

/**
 * Reporting → Raw Performance — NetworkPerformanceFact grain (v20 HTML parity).
 */
export function AdminClientRawPerformancePage() {
  const [filters, setFilters] = useState(() => ({
    network: "",
    granularity: "",
    from: yearStartIso(),
    to: todayIso(),
    q: "",
  }));
  const [applied, setApplied] = useState(filters);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [draftKeys, setDraftKeys] = useState([]);
  const [draftName, setDraftName] = useState("");

  const views = useSavedReportViews("mboRawPerformanceViews", RAW_PERFORMANCE_FIELDS, {
    full: {
      name: "Raw Performance - Full",
      keys: RAW_PERFORMANCE_FIELDS.map((f) => f.key),
      filters: {},
    },
  });

  const queryFilters = useMemo(() => {
    const next = { grain: "network" };
    if (applied.from) next.from = applied.from;
    if (applied.to) next.to = applied.to;
    if (applied.network) next.network = applied.network;
    if (applied.q?.trim()) next.q = applied.q.trim();
    return next;
  }, [applied]);

  const { rows, loading, error, reload, page, setPage, pagination, extras } = usePagedQuery(
    "/ops/admin/performance",
    queryFilters,
    { pageSize: 50 },
  );

  const mappedRows = useMemo(() => {
    const list = (rows || []).map(mapRawRow);
    const gran = applied.granularity;
    if (!gran) return list;
    return list.filter((r) => {
      const g = String(r.reportGranularity || "").toUpperCase();
      return g === gran || g.includes(gran);
    });
  }, [rows, applied.granularity]);

  const kpis = extras?.kpis || {};
  const networksCount =
    kpis.networks ??
    new Set(mappedRows.map((r) => r.network).filter(Boolean)).size;

  const columns = useMemo(() => {
    const byKey = Object.fromEntries(RAW_PERFORMANCE_FIELDS.map((f) => [f.key, f]));
    return views.activeKeys
      .filter((k) => byKey[k])
      .map((key) => {
        const field = byKey[key];
        const col = { key, label: field.label, minWidth: 110 };
        if (MONEY_KEYS.has(key)) {
          col.className = "tabular-nums text-right";
          col.render = (r) => displayMoney(r[key], r._currency || r.currency);
        } else if (NUMBER_KEYS.has(key)) {
          col.className = "tabular-nums text-right";
          col.render = (r) => displayNumber(r[key]);
        } else if (DATE_KEYS.has(key)) {
          col.render = (r) => displayDate(r[key]);
        } else if (DATETIME_KEYS.has(key)) {
          col.render = (r) => displayDateTime(r[key]);
        } else if (key === "couponCode" || key.includes("Id") || key === "subId1") {
          col.render = (r) => (
            <span className="font-mono text-[11px]">{r[key] || "—"}</span>
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
    exportRowsCsv(views.activeName || "raw_performance", RAW_PERFORMANCE_FIELDS, views.activeKeys, mappedRows);
  }

  return (
    <PageLayout
      title="Raw Performance"
      subtitle="Full standardized network performance with saved custom report views and export."
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
          label="Gross Orders"
          value={displayNumber(kpis.grossOrders)}
          hint="Generated across all networks"
          loading={loading}
        />
        <KpiStat
          label="Gross Order Value"
          value={displayMoney(kpis.grossOrderValue)}
          hint="Generated order value"
          loading={loading}
        />
        <KpiStat
          label="Gross Commission"
          value={displayMoney(kpis.grossCommission)}
          hint="Generated / provisional commission"
          loading={loading}
        />
        <KpiStat
          label="Pending Orders"
          value={displayNumber(kpis.pendingOrders)}
          hint="Awaiting network validation"
          loading={loading}
        />
        <KpiStat
          label="Confirmed Orders"
          value={displayNumber(kpis.confirmedOrders)}
          hint="Confirmed within raw performance"
          loading={loading}
          tone="success"
        />
        <KpiStat
          label="Networks"
          value={displayNumber(networksCount)}
          hint="Connected reporting networks"
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
          options={REPORTING_NETWORKS}
        />
        <Select
          label="Granularity"
          value={filters.granularity}
          onChange={(e) => setFilters((p) => ({ ...p, granularity: e.target.value }))}
          options={GRANULARITY_OPTIONS}
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
          placeholder="Brand, campaign, coupon, order ID"
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
        <Button
          variant="secondary"
          onClick={() => views.saveCurrent({ ...applied })}
        >
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
        emptyMessage="No network performance rows for this period."
      />

      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
        <b>Export rule:</b> Export Current View uses the selected columns, their current order, and
        the current filters. Hidden fields are not added to the export.
      </div>
      <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-900">
        Network grain (NetworkPerformanceFact). Boostiny confirmation remains aggregate-settlement
        based and is summarized on Overview / Client Confirmed Orders — not invented as individual
        order rows here.
      </div>

      <ReportViewBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        catalogFields={RAW_PERFORMANCE_FIELDS}
        viewName={draftName}
        onViewNameChange={setDraftName}
        selectedKeys={draftKeys}
        onSelectedKeysChange={setDraftKeys}
        onApply={applyBuilder}
        subtitle="Choose which Raw Performance fields appear and export."
      />
    </PageLayout>
  );
}
