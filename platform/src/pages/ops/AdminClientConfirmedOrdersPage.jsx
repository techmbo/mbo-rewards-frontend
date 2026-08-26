import { useMemo, useState } from "react";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Input, Select } from "../../components/ui/FormControls";
import { Button } from "../../components/ui/Button";
import { KpiGrid, KpiStat } from "../../components/ui/KpiStat";
import {
  displayDate,
  displayMoney,
  displayNumber,
  displayText,
} from "../../utils/display";
import {
  CLIENT_CONFIRMED_FIELDS,
  REPORTING_NETWORKS,
  exportRowsCsv,
} from "./reportingV20Fields";
import { ReportViewBuilder, useSavedReportViews } from "./ReportViewBuilder";
import { todayIso, yearStartIso } from "./reportingDateDefaults";

const MONEY_KEYS = new Set(["confirmedOrderValueAmount", "confirmedClientCommissionAmount"]);
const NUMBER_KEYS = new Set(["confirmedOrders"]);
const DATE_KEYS = new Set(["orderConfirmedDate", "orderDate", "lastUpdatedDate"]);

/**
 * Admin Reporting v20 — Client Confirmed Orders.
 * Uses CLIENT_CONFIRMED_FIELDS only (no confirmedNetworkCommission / mboCommissionAmount).
 */
export function AdminClientConfirmedOrdersPage() {
  const [filters, setFilters] = useState(() => ({
    from: yearStartIso(),
    to: todayIso(),
    clientId: "",
    network: "",
    confirmationType: "",
    q: "",
  }));
  const [applied, setApplied] = useState(filters);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [draftKeys, setDraftKeys] = useState([]);
  const [draftName, setDraftName] = useState("");

  const views = useSavedReportViews("mboClientConfirmedViews", CLIENT_CONFIRMED_FIELDS, {
    full: {
      name: "Client Confirmed Orders - Full",
      keys: CLIENT_CONFIRMED_FIELDS.map((f) => f.key),
      filters: {},
    },
  });

  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(applied).filter(([, v]) => v != null && v !== "")),
    [applied],
  );

  const { rows, loading, error, reload, page, setPage, pagination, extras } = usePagedQuery(
    "/ops/admin/client-confirmed-orders",
    queryFilters,
    { pageSize: 50 },
  );

  const kpis = extras?.kpis || {};
  const clients = extras?.clients || [];
  const currency = kpis.currency;

  const columns = useMemo(() => {
    const byKey = Object.fromEntries(CLIENT_CONFIRMED_FIELDS.map((f) => [f.key, f]));
    return views.activeKeys
      .filter((k) => byKey[k])
      .map((key) => {
        const field = byKey[key];
        const col = { key, label: field.label, minWidth: 110 };
        if (MONEY_KEYS.has(key)) {
          col.className = "tabular-nums text-right";
          col.render = (r) => displayMoney(r[key], r.currency || currency);
        } else if (NUMBER_KEYS.has(key)) {
          col.className = "tabular-nums text-right";
          col.render = (r) => displayNumber(r[key]);
        } else if (DATE_KEYS.has(key)) {
          col.render = (r) => displayDate(r[key]);
        } else if (
          key.includes("Id") ||
          key === "couponCode" ||
          key === "mboTrackingLink" ||
          key === "lastUpdatedTime"
        ) {
          col.render = (r) => (
            <span className="block max-w-[180px] truncate font-mono text-[10px]" title={r[key] || ""}>
              {r[key] || "—"}
            </span>
          );
        } else {
          col.render = (r) => displayText(r[key]);
        }
        return col;
      });
  }, [views.activeKeys, currency]);

  function openBuilder() {
    setDraftKeys([...views.activeKeys]);
    setDraftName(views.activeName);
    setBuilderOpen(true);
  }

  function applyBuilder(save) {
    if (!draftKeys.length) return;
    views.setActiveKeys([...draftKeys]);
    views.setActiveName(draftName.trim() || "Custom Client Confirmed View");
    if (save) {
      views.saveAsNew(draftName.trim() || "Custom Client Confirmed View", draftKeys, {
        ...applied,
      });
    }
    setBuilderOpen(false);
  }

  function exportCurrent() {
    exportRowsCsv(
      views.activeName || "client_confirmed_orders",
      CLIENT_CONFIRMED_FIELDS,
      views.activeKeys,
      rows,
    );
  }

  return (
    <PageLayout
      title="Client Confirmed Orders"
      subtitle="One row per confirmed client result. Aggregate Boostiny settlements never create fake individual orders."
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
      <KpiGrid className="mb-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        <KpiStat label="Confirmed Client Orders" value={displayNumber(kpis.confirmedClientOrders)} />
        <KpiStat
          label="Confirmed Order Value"
          value={displayMoney(kpis.confirmedOrderValue, currency)}
        />
        <KpiStat
          label="Confirmed Client Commission"
          value={displayMoney(kpis.confirmedClientCommission, currency)}
        />
        <KpiStat label="Individual Confirmed" value={displayNumber(kpis.individualConfirmed)} />
        <KpiStat
          label="Aggregate Confirmed"
          value={displayNumber(kpis.aggregateConfirmed)}
          hint="Boostiny cycles"
        />
        <KpiStat label="Clients" value={displayNumber(kpis.clients)} />
      </KpiGrid>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <Select
          label="Saved Report View"
          value={views.activeId}
          onChange={(e) => views.loadView(e.target.value)}
          options={views.viewOptions}
        />
        <Select
          label="Client"
          value={filters.clientId}
          onChange={(e) => setFilters((p) => ({ ...p, clientId: e.target.value }))}
          options={[
            { value: "", label: "All Clients" },
            ...clients.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <Select
          label="Network"
          value={filters.network}
          onChange={(e) => setFilters((p) => ({ ...p, network: e.target.value }))}
          options={REPORTING_NETWORKS}
        />
        <Select
          label="Confirmation Type"
          value={filters.confirmationType}
          onChange={(e) => setFilters((p) => ({ ...p, confirmationType: e.target.value }))}
          options={[
            { value: "", label: "All Types" },
            { value: "Individual Order", label: "Individual Order" },
            { value: "Aggregate Settlement", label: "Aggregate Settlement" },
          ]}
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
          placeholder="Client, brand, campaign, coupon, order ID"
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
            One row per confirmed result. Currency, amounts, statuses, dates and times remain
            separate fields.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
          {views.activeKeys.length} columns
        </span>
      </div>

      <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
        <b>Boostiny rule:</b> Partner Payment uploads create aggregate settlement-cycle rows only.
        Network Order ID / Conversion ID / Coupon / MBO Click ID stay blank unless Boostiny provides
        them.
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        page={page}
        onPageChange={setPage}
        pagination={pagination}
        emptyMessage="No confirmed client orders for this period."
      />

      <ReportViewBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        catalogFields={CLIENT_CONFIRMED_FIELDS}
        viewName={draftName}
        onViewNameChange={setDraftName}
        selectedKeys={draftKeys}
        onSelectedKeysChange={setDraftKeys}
        onApply={applyBuilder}
        title="Client Confirmed Orders Custom Report View"
        subtitle="Choose confirmed-client fields to show and export."
      />
    </PageLayout>
  );
}
