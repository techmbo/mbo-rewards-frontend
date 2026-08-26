import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchApi } from "../../api";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Input, Select } from "../../components/ui/FormControls";
import { Button } from "../../components/ui/Button";
import { KpiGrid, KpiStat } from "../../components/ui/KpiStat";
import {
  displayCompactMoney,
  displayMoney,
  displayNumber,
  displayText,
} from "../../utils/display";
import { REPORTING_NETWORKS } from "./reportingV20Fields";
import { todayIso, yearStartIso } from "./reportingDateDefaults";

function BarPanel({ title, subtitle, rows, labelKey, valueKey, valueFormat = "number" }) {
  const max = Math.max(1, ...rows.map((r) => Number(r[valueKey]) || 0));
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="px-4 py-3 space-y-3">
        {!rows.length ? (
          <p className="py-6 text-center text-sm text-slate-400">No data for this period.</p>
        ) : (
          rows.map((row) => {
            const value = Number(row[valueKey]) || 0;
            const pct = Math.round((value / max) * 100);
            const display =
              valueFormat === "money"
                ? displayCompactMoney(value) || displayMoney(value)
                : displayNumber(value);
            return (
              <div
                key={String(row[labelKey])}
                className="grid grid-cols-[110px_1fr_80px] items-center gap-2 sm:grid-cols-[130px_1fr_90px]"
              >
                <span className="truncate text-sm text-slate-700">{displayText(row[labelKey])}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
                </div>
                <b className="text-right text-xs tabular-nums text-slate-800">{display}</b>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * Reporting Overview — all-network generated + confirmed commission summary (v20).
 */
export function AdminReportingOverviewPage() {
  const [filters, setFilters] = useState({
    from: yearStartIso(),
    to: todayIso(),
    network: "",
    brand: "",
  });
  const [applied, setApplied] = useState(filters);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (next = applied) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (next.from) params.from = next.from;
      if (next.to) params.to = next.to;
      if (next.network) params.network = next.network;
      if (next.brand?.trim()) params.brand = next.brand.trim();
      const res = await fetchApi("/ops/admin/reporting-overview", params, { skipCache: true });
      setData(res?.data ?? res);
    } catch (err) {
      setError(err?.message || "Failed to load reporting overview");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [applied]);

  useEffect(() => {
    load(applied);
  }, [applied, load]);

  const kpis = data?.kpis || {};
  const topNetworks = data?.topNetworks || [];
  const topBrands = data?.topBrands || [];
  const networkSummary = data?.networkSummary || [];

  const brandOptions = useMemo(() => {
    const names = [...new Set(topBrands.map((b) => b.brandName).filter(Boolean))];
    return [{ value: "", label: "All Brands" }, ...names.map((n) => ({ value: n, label: n }))];
  }, [topBrands]);

  const columns = useMemo(
    () => [
      {
        key: "network",
        label: "Network",
        render: (r) => <b className="text-slate-900">{displayText(r.network)}</b>,
      },
      {
        key: "ordersGenerated",
        label: "Orders Generated",
        className: "tabular-nums text-right",
        render: (r) => displayNumber(r.ordersGenerated),
      },
      {
        key: "grossOrderValue",
        label: "Gross Order Value",
        className: "tabular-nums text-right",
        render: (r) => displayCompactMoney(r.grossOrderValue) || displayMoney(r.grossOrderValue),
      },
      {
        key: "networkCommission",
        label: "Network Commission",
        className: "tabular-nums text-right",
        render: (r) => displayCompactMoney(r.networkCommission) || displayMoney(r.networkCommission),
      },
      {
        key: "confirmedOrders",
        label: "Confirmed Orders",
        className: "tabular-nums text-right",
        render: (r) => displayNumber(r.confirmedOrders),
      },
      {
        key: "confirmedCommission",
        label: "Confirmed Commission",
        className: "tabular-nums text-right",
        render: (r) =>
          displayCompactMoney(r.confirmedCommission) || displayMoney(r.confirmedCommission),
      },
      {
        key: "mboCommissionMade",
        label: "MBO Commission Made",
        className: "tabular-nums text-right",
        render: (r) =>
          displayCompactMoney(r.mboCommissionMade) || displayMoney(r.mboCommissionMade),
      },
    ],
    [],
  );

  return (
    <PageLayout
      title="Reporting Overview"
      subtitle="All-network generated performance and confirmed commission summary."
    >
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3">
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
        <Select
          label="Network"
          value={filters.network}
          onChange={(e) => setFilters((p) => ({ ...p, network: e.target.value }))}
          options={REPORTING_NETWORKS}
        />
        {brandOptions.length > 1 ? (
          <Select
            label="Brand"
            value={filters.brand}
            onChange={(e) => setFilters((p) => ({ ...p, brand: e.target.value }))}
            options={brandOptions}
          />
        ) : (
          <Input
            label="Brand"
            value={filters.brand}
            onChange={(e) => setFilters((p) => ({ ...p, brand: e.target.value }))}
            placeholder="All brands"
          />
        )}
        <Button
          onClick={() => {
            setApplied({ ...filters });
          }}
        >
          Apply
        </Button>
        <Button variant="secondary" onClick={() => load(applied)}>
          Refresh
        </Button>
      </div>

      <KpiGrid className="mb-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" columns={6}>
        <KpiStat
          label="Orders Generated"
          value={displayNumber(kpis.ordersGenerated)}
          hint="All networks"
          loading={loading}
        />
        <KpiStat
          label="Gross Order Value"
          value={displayCompactMoney(kpis.grossOrderValue) || displayMoney(kpis.grossOrderValue)}
          hint="Generated performance"
          loading={loading}
        />
        <KpiStat
          label="Network Commission"
          value={displayCompactMoney(kpis.networkCommission) || displayMoney(kpis.networkCommission)}
          hint="Generated / provisional"
          loading={loading}
        />
        <KpiStat
          label="Confirmed Orders"
          value={displayNumber(kpis.confirmedOrders)}
          hint="Network-confirmed"
          loading={loading}
          tone="success"
        />
        <KpiStat
          label="Confirmed Commission"
          value={
            displayCompactMoney(kpis.confirmedCommission) || displayMoney(kpis.confirmedCommission)
          }
          hint="Validated network commission"
          loading={loading}
        />
        <KpiStat
          label="MBO Commission Made"
          value={displayCompactMoney(kpis.mboCommissionMade) || displayMoney(kpis.mboCommissionMade)}
          hint="After client commission"
          loading={loading}
        />
      </KpiGrid>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <BarPanel
          title="Top Performing Networks"
          subtitle="Ranked by generated network commission."
          rows={topNetworks}
          labelKey="network"
          valueKey="networkCommission"
          valueFormat="money"
        />
        <BarPanel
          title="Top Brands by Orders"
          subtitle="Brands generating the most orders across all networks."
          rows={topBrands}
          labelKey="brandName"
          valueKey="orders"
          valueFormat="number"
        />
      </div>

      <div className="mb-2 rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">Network Performance Summary</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Generated and confirmed results by network. Boostiny confirmation remains
            aggregate-settlement based.
          </p>
        </div>
        <DataTable
          columns={columns}
          rows={networkSummary}
          loading={loading}
          error={error}
          onRetry={() => load(applied)}
          emptyMessage="No network summary for this period."
        />
        <div className="m-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          <b>Boostiny rule:</b> generated performance comes from Boostiny performance data. Confirmed
          totals come from the manually uploaded Partner Payment settlement report; individual
          Boostiny orders are not marked confirmed from that aggregate file.
        </div>
      </div>
    </PageLayout>
  );
}
