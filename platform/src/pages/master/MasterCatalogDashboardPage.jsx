import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApi } from "../../api";
import { PageLayout } from "../../components/layout/PageLayout";
import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";

function fmt(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return Number(n).toLocaleString("en-US");
}

function KpiCard({ label, value, caption }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-slate-900">{fmt(value)}</p>
      {caption ? <p className="mt-2 text-[11px] text-slate-500">{caption}</p> : null}
    </div>
  );
}

function SummaryAction({ row }) {
  const isAlert = row.actionVariant === "alert";
  return (
    <Link
      to={row.actionPath}
      className={`inline-flex rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition ${
        isAlert
          ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
          : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
      }`}
    >
      {row.actionLabel}
    </Link>
  );
}

export function MasterCatalogDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi("/master/catalog-summary");
        if (active) setSummary(res?.data ?? res);
      } catch (err) {
        if (active) setError(err?.message || "Unable to load dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <PageLayout
        eyebrow="Master Catalog"
        title="Master Catalog Dashboard"
        subtitle="Summary only. Detailed records are accessed through Brands or Master Campaigns."
      >
        <LoadingState rows={4} />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        eyebrow="Master Catalog"
        title="Master Catalog Dashboard"
        subtitle="Summary only. Detailed records are accessed through Brands or Master Campaigns."
      >
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </PageLayout>
    );
  }

  const kpis = summary?.kpis || {};
  const rows = summary?.operationalSummary || [];

  return (
    <PageLayout
      eyebrow="Master Catalog"
      title="Master Catalog Dashboard"
      subtitle="Summary only. Detailed records are accessed through Brands or Master Campaigns."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Brands" value={kpis.brands} caption="Canonical MBO brands" />
        <KpiCard label="Network Campaigns" value={kpis.networkCampaigns} caption="Across all brands" />
        <KpiCard label="Master Campaigns" value={kpis.masterCampaigns} caption="Normalized / grouped" />
        <KpiCard label="Assignment Ready" value={kpis.assignmentReady} caption="Ready for client use" />
        <KpiCard label="New Code Alerts" value={kpis.newCodeAlerts} caption="Needs operations review" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Operational Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Area</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Healthy / Ready</th>
                <th className="px-3 py-3">Needs Review</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.area} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{row.area}</td>
                  <td className="px-3 py-3.5 tabular-nums text-slate-700">{fmt(row.total)}</td>
                  <td className="px-3 py-3.5 tabular-nums text-slate-700">
                    {row.healthyReady != null ? fmt(row.healthyReady) : "—"}
                  </td>
                  <td className="px-3 py-3.5 text-slate-600">{row.needsReviewLabel ?? fmt(row.needsReview)}</td>
                  <td className="px-3 py-3.5">
                    <SummaryAction row={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}

export default MasterCatalogDashboardPage;
