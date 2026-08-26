import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApi } from "../../api";
import { unwrap } from "./portalUtils";

function KpiCard({ label, value, meta }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1.5 text-[22px] font-bold text-slate-900">{value != null ? value : "—"}</div>
      {meta ? <div className="mt-0.5 text-xs text-slate-400">{meta}</div> : null}
    </div>
  );
}

function StatusBadge({ status }) {
  if (!status) return <span className="text-slate-400">—</span>;
  const s = String(status).toUpperCase();
  if (s === "AVAILABLE") return <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">AVAILABLE</span>;
  if (s === "REQUESTED") return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">REQUESTED</span>;
  if (s === "PAID") return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">PAID</span>;
  if (s === "APPROVED") return <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">APPROVED</span>;
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{String(status)}</span>;
}

function CampaignStatusBadge({ status, isNew }) {
  const s = String(isNew ? "NEW" : status || "").toUpperCase();
  if (s === "LIVE" || s === "ACTIVE" || s === "CLIENT_VISIBLE") return <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">LIVE</span>;
  if (s === "NEW") return <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-700">NEW</span>;
  if (s === "EXPIRING") return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">EXPIRING</span>;
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{s || "—"}</span>;
}

function fmtMoney(n) {
  const num = Number(n);
  if (n == null || !Number.isFinite(num)) return "—";
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtNum(n) {
  const num = Number(n);
  if (n == null || !Number.isFinite(num)) return "—";
  return num.toLocaleString();
}

export function PortalOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi("/portal/v1/dashboard-summary");
      const payload = unwrap(res);
      setData(payload || null);
    } catch (err) {
      // Fallback to old overview endpoint
      try {
        const res2 = await fetchApi("/portal/v1/overview");
        const old = unwrap(res2) || {};
        setData({
          kpis: {
            activeCampaigns: old.kpis?.activeCampaigns ?? null,
            orders: null,
            confirmedOrders: null,
            confirmedOrderValue: null,
            confirmedCommission: null,
            availableToWithdraw: old.kpis?.availableToWithdraw ?? null,
            currency: old.kpis?.currency ?? null,
            period: new Date().toLocaleString("en-US", { month: "short", year: "numeric" }),
          },
          performanceSummary: Array.isArray(old.topPerformance)
            ? old.topPerformance.map((r) => ({
                brand: r.brand || "—",
                campaign: r.campaign || "—",
                orders: null,
                confirmedOrders: null,
                confirmedOrderValue: null,
                commission: r.approvedCommission ?? null,
              }))
            : [],
          withdrawalBalance: {
            available: old.kpis?.availableToWithdraw ?? null,
            currency: old.kpis?.currency ?? null,
            pendingRequest: null,
            approvedForPayout: null,
            paidThisMonth: null,
          },
          recentStatements: [],
          recentPayment: null,
          availableCampaigns: [],
        });
      } catch {
        setError(err.message || "Failed to load dashboard.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
        <div className="grid gap-4 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-rose-600">{error}</p>
        <button type="button" onClick={load} className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold">
          Try again
        </button>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const period = kpis.period || new Date().toLocaleString("en-US", { month: "short", year: "numeric" });
  const wb = data?.withdrawalBalance || {};
  const performanceSummary = Array.isArray(data?.performanceSummary) ? data.performanceSummary : [];
  const recentStatements = Array.isArray(data?.recentStatements) ? data.recentStatements : [];
  const availableCampaigns = Array.isArray(data?.availableCampaigns) ? data.availableCampaigns : [];
  const recentPayment = data?.recentPayment || null;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Overview of your campaigns, performance, payable commission, and withdrawals.
          </p>
        </div>
        <Link
          to="/portal/campaigns"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          View Campaigns
        </Link>
      </div>

      {/* 6 KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Active Campaigns"
          value={kpis.activeCampaigns != null ? String(kpis.activeCampaigns) : "—"}
          meta="Currently live"
        />
        <KpiCard
          label="Orders"
          value={kpis.orders != null ? fmtNum(kpis.orders) : "—"}
          meta={period}
        />
        <KpiCard
          label="Confirmed Orders"
          value={kpis.confirmedOrders != null ? fmtNum(kpis.confirmedOrders) : "—"}
          meta={period}
        />
        <KpiCard
          label="Confirmed Order Value"
          value={kpis.confirmedOrderValue != null ? fmtMoney(kpis.confirmedOrderValue) : "—"}
          meta={period}
        />
        <KpiCard
          label="Confirmed Commission"
          value={kpis.confirmedCommission != null ? fmtMoney(kpis.confirmedCommission) : "—"}
          meta="Client commission"
        />
        <KpiCard
          label="Available to Withdraw"
          value={kpis.availableToWithdraw != null ? fmtMoney(kpis.availableToWithdraw) : "—"}
          meta="Ready now"
        />
      </div>

      {/* Performance Summary + Withdrawal Balance */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* Performance Summary */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-900">Performance Summary</h2>
            <Link to="/portal/performance" className="text-sm font-semibold text-blue-600 hover:underline">
              View Performance
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2.5">Brand</th>
                  <th className="px-3 py-2.5">Campaign</th>
                  <th className="px-3 py-2.5 text-right">Orders</th>
                  <th className="px-3 py-2.5 text-right">Confirmed Orders</th>
                  <th className="px-3 py-2.5 text-right">Confirmed Order Value</th>
                  <th className="px-3 py-2.5 text-right">Commission</th>
                </tr>
              </thead>
              <tbody>
                {performanceSummary.length > 0 ? (
                  performanceSummary.map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-semibold text-slate-800">{row.brand || "—"}</td>
                      <td className="px-3 py-3 text-slate-600">{row.campaign || "—"}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{fmtNum(row.orders)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{fmtNum(row.confirmedOrders)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{fmtMoney(row.confirmedOrderValue)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{fmtMoney(row.commission)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">
                      No performance data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Balance */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-900">Withdrawal Balance</h2>
            <Link to="/portal/withdrawal-requests" className="text-sm font-semibold text-blue-600 hover:underline">
              View Statements
            </Link>
          </div>
          <div className="p-5">
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Available for Withdrawal
              </div>
              <div className="mt-1 text-[32px] font-bold text-slate-900">
                {wb.available != null ? fmtMoney(wb.available) : "—"}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {wb.currency || "USD"} — Based on released payable statements
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/portal/withdrawal-requests"
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Raise Withdrawal Request
              </Link>
              <Link
                to="/portal/payable-statements"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                View Payable Statements
              </Link>
            </div>
            <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
              {[
                ["Pending Request", wb.pendingRequest],
                ["Approved for Payout", wb.approvedForPayout],
                ["Paid This Month", wb.paidThisMonth],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold tabular-nums">{fmtMoney(val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payable Statements + Recent Payments + Available Campaigns */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* Recent Payable Statements */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-900">Recent Payable Statements</h2>
            <Link to="/portal/payable-statements" className="text-sm font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2.5">Statement</th>
                  <th className="px-3 py-2.5">Period</th>
                  <th className="px-3 py-2.5 text-right">Amount</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentStatements.length > 0 ? (
                  recentStatements.map((s, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="px-5 py-3 font-mono text-xs text-slate-700">
                        {s.statementId || "—"}
                      </td>
                      <td className="px-3 py-3 text-slate-600">{s.period || "—"}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{fmtMoney(s.amount)}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-sm text-slate-400">
                      No statements yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-900">Recent Payments</h2>
            <Link to="/portal/withdrawal-requests" className="text-sm font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="p-5">
            {recentPayment ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-slate-700">
                    {recentPayment.paymentId || "—"}
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {fmtMoney(recentPayment.amount)}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payment Date</span>
                    <span className="font-semibold">
                      {recentPayment.date
                        ? new Date(recentPayment.date).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                      PAID
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Reference</span>
                    <span className="font-mono text-xs font-semibold">
                      {recentPayment.reference || "—"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">No payments yet.</p>
            )}
          </div>
        </div>

        {/* Available Campaigns */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-900">Available Campaigns</h2>
            <Link to="/portal/campaigns" className="text-sm font-semibold text-blue-600 hover:underline">
              Browse All
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {availableCampaigns.length > 0 ? (
              availableCampaigns.map((c, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                      {String(c.brand || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{c.brand || "—"}</div>
                      <div className="text-xs text-slate-400">
                        {c.type || "—"} · {c.commission || "—"}
                      </div>
                    </div>
                  </div>
                  <CampaignStatusBadge status={c.status} isNew={c.isNew} />
                </div>
              ))
            ) : (
              <p className="px-5 py-6 text-center text-sm text-slate-400">
                No campaigns available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
