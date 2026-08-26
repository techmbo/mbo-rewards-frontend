import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchApi } from "../../api";
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
import { CLIENT_PERFORMANCE_FIELDS, exportRowsCsv } from "./reportingV20Fields";
import { ReportViewBuilder, useSavedReportViews } from "./ReportViewBuilder";
import { todayIso, yearStartIso } from "./reportingDateDefaults";

const MONEY_KEYS = new Set([
  "grossOrderValue",
  "confirmedOrderValue",
  "clientCommissionGenerated",
  "confirmedClientCommission",
]);
const NUMBER_KEYS = new Set([
  "grossOrders",
  "pendingOrders",
  "confirmedOrders",
  "rejectedOrders",
  "cancelledOrders",
]);

/**
 * Admin Reporting v20 — Client Performance (campaign grain for one client).
 */
export function AdminClientPerformancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clients, setClients] = useState([]);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [clientId, setClientId] = useState(searchParams.get("clientId") || "");
  const [from, setFrom] = useState(() => yearStartIso());
  const [to, setTo] = useState(() => todayIso());
  const [campaignType, setCampaignType] = useState("");
  const [brand, setBrand] = useState("");
  const [q, setQ] = useState("");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [draftKeys, setDraftKeys] = useState([]);
  const [draftName, setDraftName] = useState("");

  const views = useSavedReportViews("mboClientPerformanceViews", CLIENT_PERFORMANCE_FIELDS, {
    full: {
      name: "Client Performance - Full",
      keys: CLIENT_PERFORMANCE_FIELDS.map((f) => f.key),
      filters: {},
    },
  });

  async function load(nextClientId = clientId, opts = {}) {
    setLoading(true);
    setError(null);
    try {
      const params = { pageSize: 200, from, to };
      if (nextClientId) params.clientId = nextClientId;
      if (campaignType) params.campaignType = campaignType;
      if (brand) params.brand = brand;
      const res = await fetchApi("/ops/admin/client-performance", params);
      const data = res?.data ?? res;
      setPayload(data);
      if (Array.isArray(data?.clients)) setClients(data.clients);
      // Auto-select a client with assignments when possible so campaign rows load.
      if (!nextClientId && !opts.skipAutoSelect) {
        const first = data?.suggestedClientId || data?.clients?.[0]?.id;
        if (first) {
          setClientId(first);
          setSearchParams({ clientId: first });
          return load(first, { skipAutoSelect: true });
        }
      }
    } catch (err) {
      setError(err?.message || "Failed to load client performance");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(clientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function apply() {
    if (clientId) setSearchParams({ clientId });
    else setSearchParams({});
    load(clientId);
  }

  const items = useMemo(() => {
    const list = payload?.items || payload?.rows || [];
    const needle = q.trim().toLowerCase();
    return list.filter((r) => {
      if (brand && (r.brandName || "") !== brand) return false;
      if (campaignType === "coupon" && r.campaignType !== "Coupon") return false;
      if (campaignType === "affiliate" && r.campaignType !== "Affiliate Link") return false;
      if (!needle) return true;
      return [r.brandName, r.campaignName, r.couponCode, r.mboTrackingLink]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [payload, q, brand, campaignType]);

  const kpis = payload?.kpis || {};
  const brands = useMemo(
    () => [...new Set((payload?.items || []).map((r) => r.brandName).filter(Boolean))],
    [payload],
  );
  const currency = kpis.currency || items.find((r) => r.currency)?.currency;

  const columns = useMemo(() => {
    const byKey = Object.fromEntries(CLIENT_PERFORMANCE_FIELDS.map((f) => [f.key, f]));
    return views.activeKeys
      .filter((k) => byKey[k])
      .map((key) => {
        const field = byKey[key];
        const col = { key, label: field.label, minWidth: 110 };
        if (key === "date") {
          col.render = (r) => displayDate(r.date);
        } else if (key === "lastUpdatedAt") {
          col.render = (r) => displayDateTime(r.lastUpdatedAt);
        } else if (MONEY_KEYS.has(key)) {
          col.className = "tabular-nums text-right";
          col.render = (r) =>
            displayMoney(
              key === "confirmedClientCommission"
                ? r.confirmedClientCommission ?? r.clientCommission
                : r[key],
              r.currency || currency,
            );
        } else if (NUMBER_KEYS.has(key)) {
          col.className = "tabular-nums text-right";
          col.render = (r) => displayNumber(r[key]);
        } else if (key === "couponCode" || key === "mboTrackingLink") {
          col.render = (r) => (
            <span
              className="block max-w-[200px] truncate font-mono text-[10px] text-slate-500"
              title={r[key] || ""}
            >
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
    views.setActiveName(draftName.trim() || "Custom Client Performance View");
    if (save) {
      views.saveAsNew(draftName.trim() || "Custom Client Performance View", draftKeys, {
        campaignType,
        brand,
        from,
        to,
        q,
      });
    }
    setBuilderOpen(false);
  }

  function exportCurrent() {
    const clientLabel = clients.find((c) => c.id === clientId)?.name || clientId || "client";
    exportRowsCsv(
      `${clientLabel}_${views.activeName || "client_performance"}`,
      CLIENT_PERFORMANCE_FIELDS,
      views.activeKeys,
      items,
    );
  }

  const clientOptions = [
    { value: "", label: "Select client…" },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <PageLayout
      title="Client Performance"
      subtitle="Campaign-level performance for one client, including brand, campaign, coupon or MBO link attribution, order status and client commission."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openBuilder}>
            Custom Report View
          </Button>
          <Button variant="secondary" onClick={exportCurrent} disabled={!items.length}>
            Export Current View
          </Button>
        </div>
      }
    >
      <KpiGrid className="mb-4 grid-cols-2 sm:grid-cols-4 xl:grid-cols-8">
        <KpiStat label="Client Orders" value={displayNumber(kpis.grossOrders)} />
        <KpiStat label="Pending Orders" value={displayNumber(kpis.pendingOrders)} />
        <KpiStat label="Confirmed Orders" value={displayNumber(kpis.confirmedOrders)} />
        <KpiStat label="Rejected Orders" value={displayNumber(kpis.rejectedOrders)} />
        <KpiStat label="Cancelled Orders" value={displayNumber(kpis.cancelledOrders)} />
        <KpiStat label="Gross Order Value" value={displayMoney(kpis.grossOrderValue, currency)} />
        <KpiStat
          label="Confirmed Order Value"
          value={displayMoney(kpis.confirmedOrderValue ?? kpis.netOrderValue, currency)}
        />
        <KpiStat
          label="Confirmed Client Commission"
          value={displayMoney(kpis.confirmedClientCommission ?? kpis.clientCommission, currency)}
        />
      </KpiGrid>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <Select
          label="Client"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          options={clientOptions}
        />
        <Select
          label="Saved Report View"
          value={views.activeId}
          onChange={(e) => views.loadView(e.target.value)}
          options={views.viewOptions}
        />
        <Select
          label="Campaign Type"
          value={campaignType}
          onChange={(e) => setCampaignType(e.target.value)}
          options={[
            { value: "", label: "All Types" },
            { value: "coupon", label: "Coupon" },
            { value: "affiliate", label: "Affiliate Link" },
          ]}
        />
        <Select
          label="Brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          options={[
            { value: "", label: "All Brands" },
            ...brands.map((b) => ({ value: b, label: b })),
          ]}
        />
        <Input label="From Date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="To Date" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Input
          label="Search"
          placeholder="Campaign, coupon code, tracking link"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button onClick={apply} disabled={!clientId}>
          Apply
        </Button>
        <Button variant="secondary" onClick={openBuilder}>
          Edit View
        </Button>
        <Button
          variant="secondary"
          onClick={() => views.saveCurrent({ campaignType, brand, from, to, q })}
        >
          Save Changes
        </Button>
      </div>

      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{views.activeName}</h2>
          <p className="text-xs text-slate-500">
            One row per client campaign / attribution route.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
          {views.activeKeys.length} columns
        </span>
      </div>

      <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
        <b>Client visibility:</b> Network commission and MBO margin are intentionally excluded from
        this client performance model.
      </div>

      {!clientId ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
          Select a client to load campaign performance.
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={items}
          loading={loading}
          error={error}
          emptyMessage="No campaign performance rows for this client and period."
        />
      )}

      <ReportViewBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        catalogFields={CLIENT_PERFORMANCE_FIELDS}
        viewName={draftName}
        onViewNameChange={setDraftName}
        selectedKeys={draftKeys}
        onSelectedKeysChange={setDraftKeys}
        onApply={applyBuilder}
        title="Client Performance Custom Report View"
        subtitle="Choose campaign performance fields to show and export."
      />
    </PageLayout>
  );
}
