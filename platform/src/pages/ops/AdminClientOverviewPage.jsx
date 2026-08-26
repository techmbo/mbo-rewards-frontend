import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Input, Select } from "../../components/ui/FormControls";
import { Button } from "../../components/ui/Button";
import { KpiGrid, KpiStat } from "../../components/ui/KpiStat";
import {
  displayCompactMoney,
  displayDateTime,
  displayMoney,
  displayNumber,
  displayText,
} from "../../utils/display";
import {
  CLIENT_OVERVIEW_FIELDS,
  REPORTING_NETWORKS,
  exportRowsCsv,
} from "./reportingV20Fields";
import { ReportViewBuilder, useSavedReportViews } from "./ReportViewBuilder";
import { todayIso, yearStartIso } from "./reportingDateDefaults";

const COUNTRIES = [
  { value: "", label: "All Countries" },
  { value: "IN", label: "India" },
  { value: "AE", label: "UAE" },
  { value: "EG", label: "Egypt" },
  { value: "SA", label: "Saudi Arabia" },
];

const MONEY_KEYS = new Set([
  "grossOrderValue",
  "confirmedOrderValue",
  "grossNetworkCommission",
  "confirmedNetworkCommission",
  "clientCommissionGenerated",
  "confirmedClientCommission",
  "mboCommission",
]);
const NUMBER_KEYS = new Set([
  "networkOrders",
  "mboOrders",
  "clientOrders",
  "pendingOrders",
  "confirmedOrders",
  "rejectedOrders",
  "cancelledOrders",
  "couponOrders",
  "affiliateLinkOrders",
  "activeCampaigns",
]);

function moneyCell(value, currency) {
  if (value == null || value === 0) return displayMoney(value, currency);
  return displayCompactMoney(value, currency) || displayMoney(value, currency);
}

/**
 * Admin Reporting v20 — Client Overview (one row per client).
 */
export function AdminClientOverviewPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(() => ({
    from: yearStartIso(),
    to: todayIso(),
    country: "",
    network: "",
    q: "",
  }));
  const [applied, setApplied] = useState(filters);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [draftKeys, setDraftKeys] = useState([]);
  const [draftName, setDraftName] = useState("");

  const views = useSavedReportViews("mboClientOverviewViews", CLIENT_OVERVIEW_FIELDS, {
    full: {
      name: "Client Overview - Full",
      keys: CLIENT_OVERVIEW_FIELDS.map((f) => f.key),
      filters: {},
    },
  });

  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(applied).filter(([, v]) => v != null && v !== "")),
    [applied],
  );

  const { rows, loading, error, reload, page, setPage, pagination, extras } = usePagedQuery(
    "/ops/admin/client-overview",
    queryFilters,
    { pageSize: 50 },
  );

  const kpis = extras?.kpis || {};

  const columns = useMemo(() => {
    const byKey = Object.fromEntries(CLIENT_OVERVIEW_FIELDS.map((f) => [f.key, f]));
    return views.activeKeys
      .filter((k) => byKey[k])
      .map((key) => {
        const field = byKey[key];
        const col = { key, label: field.label, minWidth: 110 };
        if (key === "clientName") {
          col.minWidth = 160;
          col.render = (r) => (
            <button
              type="button"
              className="font-semibold text-blue-600 hover:underline"
              onClick={() =>
                navigate(`/ops/admin/client-performance?clientId=${encodeURIComponent(r.clientId)}`)
              }
            >
              {displayText(r.clientName)}
            </button>
          );
        } else if (MONEY_KEYS.has(key)) {
          col.className = "tabular-nums text-right";
          col.render = (r) => moneyCell(r[key], r.currency);
        } else if (NUMBER_KEYS.has(key)) {
          col.className = "tabular-nums text-right";
          col.render = (r) => displayNumber(r[key]);
        } else if (key === "lastUpdatedAt") {
          col.render = (r) => displayDateTime(r.lastUpdatedAt);
        } else {
          col.render = (r) => displayText(r[key]);
        }
        return col;
      });
  }, [views.activeKeys, navigate]);

  function openBuilder() {
    setDraftKeys([...views.activeKeys]);
    setDraftName(views.activeName);
    setBuilderOpen(true);
  }

  function applyBuilder(save) {
    if (!draftKeys.length) return;
    views.setActiveKeys([...draftKeys]);
    views.setActiveName(draftName.trim() || "Custom Client View");
    if (save) {
      views.saveAsNew(draftName.trim() || "Custom Client View", draftKeys, { ...applied });
    }
    setBuilderOpen(false);
  }

  function exportCurrent() {
    exportRowsCsv(
      views.activeName || "client_overview",
      CLIENT_OVERVIEW_FIELDS,
      views.activeKeys,
      rows,
    );
  }

  return (
    <PageLayout
      title="Client Overview"
      subtitle="Full client order funnel from network reporting through MBO attribution, client status and confirmed commission."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openBuilder}>
            Custom Report View
          </Button>
          <Button variant="secondary" onClick={exportCurrent} disabled={!rows.length}>
            Export Current View
          </Button>
        </div>
      }
    >
      <KpiGrid className="mb-4 grid-cols-2 sm:grid-cols-4 xl:grid-cols-8">
        <KpiStat label="Active Clients" value={displayNumber(kpis.activeClients)} hint="Reporting-enabled clients" />
        <KpiStat label="Network Orders" value={displayNumber(kpis.networkOrders)} hint="Orders reported by networks" />
        <KpiStat label="MBO Orders" value={displayNumber(kpis.mboOrders)} hint="Valid orders retained by MBO" />
        <KpiStat label="Client Orders" value={displayNumber(kpis.clientOrders)} hint="Attributed to active clients" />
        <KpiStat label="Pending Client Orders" value={displayNumber(kpis.pendingClientOrders)} hint="Awaiting network validation" />
        <KpiStat label="Confirmed Client Orders" value={displayNumber(kpis.confirmedClientOrders)} hint="Order-level confirmations" />
        <KpiStat
          label="Confirmed Client Commission"
          value={displayCompactMoney(kpis.confirmedClientCommission) || displayMoney(kpis.confirmedClientCommission)}
          hint="Confirmed client earnings"
        />
        <KpiStat
          label="MBO Commission"
          value={displayCompactMoney(kpis.mboCommission) || displayMoney(kpis.mboCommission)}
          hint="Confirmed MBO commission"
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
          label="Country"
          value={filters.country}
          onChange={(e) => setFilters((p) => ({ ...p, country: e.target.value }))}
          options={COUNTRIES}
        />
        <Select
          label="Network"
          value={filters.network}
          onChange={(e) => setFilters((p) => ({ ...p, network: e.target.value }))}
          options={REPORTING_NETWORKS}
        />
        <Input
          label="From Date"
          type="date"
          value={filters.from}
          onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
        />
        <Input
          label="To Date"
          type="date"
          value={filters.to}
          onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
        />
        <Input
          label="Search"
          placeholder="Client, country, network"
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
            One row per client. Saved views control columns and filters.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
          {views.activeKeys.length} columns
        </span>
      </div>

      <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
        <b>Visibility rule:</b> MBO Admin can see Network Orders, MBO Orders, network commission and
        MBO commission. Client-facing reporting only exposes that client&apos;s own orders, statuses,
        order values and client commission.
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        page={page}
        onPageChange={setPage}
        pagination={pagination}
        emptyMessage="No client reporting rows for this period."
      />

      <ReportViewBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        catalogFields={CLIENT_OVERVIEW_FIELDS}
        viewName={draftName}
        onViewNameChange={setDraftName}
        selectedKeys={draftKeys}
        onSelectedKeysChange={setDraftKeys}
        onApply={applyBuilder}
        title="Client Overview Custom Report View"
        subtitle="Choose which client summary fields appear and export."
      />
    </PageLayout>
  );
}
