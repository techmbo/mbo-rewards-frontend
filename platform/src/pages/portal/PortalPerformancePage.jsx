import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, CLIENT_API, fetchApi } from "../../api";
import { unwrap } from "./portalUtils";
import {
  classifyPerformanceLoadError,
  performanceItems,
} from "./portalPerformanceHelpers";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Individual Orders" },
];

function KpiCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-[18px] font-bold text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

function fmtNum(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return Number(n).toLocaleString();
}

function fmtMoney(n, currency = "USD") {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(Number(n));
  } catch {
    return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

function orderStatusBadge(status) {
  const s = String(status || "").toUpperCase();
  if (s === "APPROVED" || s === "CONFIRMED" || s === "PAID") {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
        CONFIRMED
      </span>
    );
  }
  if (s === "PENDING") {
    return (
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
        PENDING
      </span>
    );
  }
  if (s === "REJECTED") {
    return (
      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">
        REJECTED
      </span>
    );
  }
  if (s === "CANCELLED" || s === "CANCELED") {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
        CANCELLED
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
      {status || "—"}
    </span>
  );
}

/**
 * Client portal Performance — tenant-scoped campaign metrics + individual orders.
 * Admin Reporting (Client Overview / Performance / Confirmed Orders) lives under /ops/admin/*.
 */
export function PortalPerformancePage() {
  const [tab, setTab] = useState("overview");
  const [payload, setPayload] = useState(null);
  const [ordersPayload, setOrdersPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [brandFilter, setBrandFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const load = useCallback(
    async (filters = { from, to }) => {
      setLoading(true);
      setLoadError(null);
      try {
        const params = { pageSize: 200 };
        if (filters.from) params.from = filters.from;
        if (filters.to) params.to = filters.to;

        const [perfRes, ordersRes] = await Promise.all([
          fetchApi(CLIENT_API.performance || "/portal/v1/performance", params),
          fetchApi(CLIENT_API.orders || "/portal/v1/orders", params).catch(() => null),
        ]);
        setPayload(unwrap(perfRes));
        setOrdersPayload(ordersRes ? unwrap(ordersRes) : null);
      } catch (err) {
        setLoadError(classifyPerformanceLoadError(err, ApiError, "/portal/v1/performance"));
      } finally {
        setLoading(false);
      }
    },
    [from, to],
  );

  useEffect(() => {
    load();
  }, []);

  function applyFilters() {
    load({ from, to });
  }

  const rows = useMemo(() => performanceItems(payload), [payload]);
  const kpis = payload?.kpis || {};
  const currency = kpis.currency || rows.find((r) => r.currency)?.currency || "USD";

  const campaignRows = useMemo(() => {
    return rows
      .map((row) => ({
        id: row.id,
        date: row.date,
        brandName: row.brandName || row.brand || "—",
        campaignName: row.campaignName || row.campaign || "—",
        campaignType: row.campaignType || row.channelType || "—",
        couponCode: row.couponCode || null,
        mboTrackingLink: row.mboTrackingLink || row.trackingLink || null,
        linkClicks: row.linkClicks ?? row.clicks ?? null,
        grossOrders: row.grossOrders ?? row.orders ?? null,
        pendingOrders: row.pendingOrders ?? null,
        confirmedOrders: row.confirmedOrders ?? null,
        rejectedOrders: row.rejectedOrders ?? null,
        cancelledOrders: row.cancelledOrders ?? null,
        grossOrderValue: row.grossOrderValue ?? null,
        confirmedOrderValue: row.confirmedOrderValue ?? row.netOrderValue ?? null,
        clientCommissionGenerated: row.clientCommissionGenerated ?? null,
        confirmedClientCommission:
          row.confirmedClientCommission ?? row.clientCommission ?? null,
        currency: row.currency || currency,
      }))
      .filter((r) => brandFilter === "all" || r.brandName === brandFilter)
      .filter((r) => {
        if (typeFilter === "all") return true;
        const t = String(r.campaignType || "").toLowerCase();
        if (typeFilter === "affiliate") return t.includes("affiliate") || t.includes("link") || (!r.couponCode && r.mboTrackingLink);
        if (typeFilter === "coupon") return t.includes("coupon") || Boolean(r.couponCode);
        return true;
      });
  }, [rows, brandFilter, typeFilter, currency]);

  const trackingMethodSummary = useMemo(() => {
    const affiliate = campaignRows.filter((r) => !r.couponCode || String(r.campaignType || "").toLowerCase().includes("affiliate"));
    const coupon = campaignRows.filter((r) => r.couponCode || String(r.campaignType || "").toLowerCase().includes("coupon"));
    const sum = (arr, key) => arr.reduce((s, r) => s + (Number(r[key]) || 0), 0);
    return {
      affiliate: {
        campaigns: affiliate.length,
        clicks: sum(affiliate, "linkClicks"),
        orders: sum(affiliate, "grossOrders"),
        commission: sum(affiliate, "confirmedClientCommission"),
      },
      coupon: {
        campaigns: coupon.length,
        orders: sum(coupon, "grossOrders"),
        commission: sum(coupon, "confirmedClientCommission"),
      },
    };
  }, [campaignRows]);

  const commissionSummary = useMemo(() => {
    const generated = campaignRows.reduce((s, r) => s + (Number(r.clientCommissionGenerated) || 0), 0);
    const confirmed = campaignRows.reduce((s, r) => s + (Number(r.confirmedClientCommission) || 0), 0);
    const pending = Math.max(0, generated - confirmed);
    return { generated, confirmed, pending };
  }, [campaignRows]);

  const brands = useMemo(
    () => [...new Set(rows.map((r) => r.brandName || r.brand).filter(Boolean))],
    [rows],
  );

  const orders = useMemo(() => {
    return ordersPayload?.orders || ordersPayload?.items || ordersPayload?.rows || [];
  }, [ordersPayload]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Performance</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Track clicks, orders, confirmed sales, and your commission across campaigns.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="date"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
        >
          <option value="all">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Campaign Types</option>
          <option value="affiliate">Affiliate Link</option>
          <option value="coupon">Coupon</option>
        </select>
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Apply
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        <KpiCard label="Clicks" value={fmtNum(kpis.linkClicks)} />
        <KpiCard label="Orders" value={fmtNum(kpis.grossOrders)} />
        <KpiCard label="Pending Orders" value={fmtNum(kpis.pendingOrders)} />
        <KpiCard label="Confirmed Orders" value={fmtNum(kpis.confirmedOrders)} />
        <KpiCard label="Rejected Orders" value={fmtNum(kpis.rejectedOrders)} />
        <KpiCard label="Cancelled Orders" value={fmtNum(kpis.cancelledOrders)} />
        <KpiCard
          label="Confirmed Order Value"
          value={fmtMoney(kpis.confirmedOrderValue ?? kpis.netOrderValue, currency)}
        />
        <KpiCard
          label="Confirmed Commission"
          value={fmtMoney(kpis.confirmedClientCommission ?? kpis.clientCommission, currency)}
        />
      </div>

      {tab === "overview" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Tracking Method Summary</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="font-semibold text-slate-800">Affiliate Link</div>
                <div className="mt-1 text-slate-500">{trackingMethodSummary.affiliate.campaigns} campaigns</div>
                <div className="mt-2 tabular-nums">Clicks: {fmtNum(trackingMethodSummary.affiliate.clicks)}</div>
                <div className="tabular-nums">Orders: {fmtNum(trackingMethodSummary.affiliate.orders)}</div>
                <div className="tabular-nums font-semibold">
                  Comm: {fmtMoney(trackingMethodSummary.affiliate.commission, currency)}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="font-semibold text-slate-800">Coupon Code</div>
                <div className="mt-1 text-slate-500">{trackingMethodSummary.coupon.campaigns} campaigns</div>
                <div className="mt-2 tabular-nums">Orders: {fmtNum(trackingMethodSummary.coupon.orders)}</div>
                <div className="tabular-nums font-semibold">
                  Comm: {fmtMoney(trackingMethodSummary.coupon.commission, currency)}
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Commission Summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-slate-500">Generated</span>
                <span className="font-semibold">{fmtMoney(commissionSummary.generated, currency)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-slate-500">Confirmed</span>
                <span className="font-semibold text-emerald-700">{fmtMoney(commissionSummary.confirmed, currency)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-slate-500">Pending confirmation</span>
                <span className="font-semibold text-amber-700">{fmtMoney(commissionSummary.pending, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex gap-0 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 pb-2.5 pt-2 text-base font-semibold transition-colors ${
              tab === t.id
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-800">Campaign Performance</h2>
            <span className="text-xs text-slate-400">Selected date range</span>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-sm text-slate-400">Loading performance…</div>
            ) : loadError ? (
              <div className="py-12 text-center text-sm text-rose-500">{loadError.message}</div>
            ) : (
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3">Brand</th>
                    <th className="px-3 py-3">Campaign</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Coupon / Tracking</th>
                    <th className="px-3 py-3 text-right">Clicks</th>
                    <th className="px-3 py-3 text-right">Orders</th>
                    <th className="px-3 py-3 text-right">Pending</th>
                    <th className="px-3 py-3 text-right">Confirmed</th>
                    <th className="px-3 py-3 text-right">Gross Value</th>
                    <th className="px-3 py-3 text-right">Confirmed Value</th>
                    <th className="px-3 py-3 text-right">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignRows.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-semibold text-slate-800">{r.brandName}</td>
                      <td className="px-3 py-3 text-slate-700">{r.campaignName}</td>
                      <td className="px-3 py-3 text-slate-600">{r.campaignType || "—"}</td>
                      <td className="px-3 py-3">
                        {r.couponCode ? (
                          <span className="font-mono font-bold text-slate-800">{r.couponCode}</span>
                        ) : r.mboTrackingLink ? (
                          <code className="max-w-[160px] truncate font-mono text-xs text-slate-500">
                            {r.mboTrackingLink}
                          </code>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{fmtNum(r.linkClicks)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{fmtNum(r.grossOrders)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{fmtNum(r.pendingOrders)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{fmtNum(r.confirmedOrders)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {fmtMoney(r.grossOrderValue, r.currency)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {fmtMoney(r.confirmedOrderValue, r.currency)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {fmtMoney(r.confirmedClientCommission, r.currency)}
                      </td>
                    </tr>
                  ))}
                  {campaignRows.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-sm text-slate-400">
                        No performance data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-800">Individual Orders</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-sm text-slate-400">Loading orders…</div>
            ) : (
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3">Order ID</th>
                    <th className="px-3 py-3">Brand</th>
                    <th className="px-3 py-3">Campaign</th>
                    <th className="px-3 py-3">Order Date</th>
                    <th className="px-3 py-3 text-right">Order Value</th>
                    <th className="px-3 py-3 text-right">Commission</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((o, i) => (
                      <tr
                        key={o.id || o.orderId || i}
                        className="border-b border-slate-50 hover:bg-slate-50/50"
                      >
                        <td className="px-5 py-3 font-mono text-xs text-slate-700">
                          {o.id || o.orderId || "—"}
                        </td>
                        <td className="px-3 py-3 font-semibold text-slate-800">
                          {o.brandName || o.brand || o.merchantName || "—"}
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {o.campaignName || o.campaign || "—"}
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {o.orderDate || o.createdAt
                            ? new Date(o.orderDate || o.createdAt).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {fmtMoney(o.orderValue || o.grossOrderValue, o.currency || currency)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {fmtMoney(o.clientCommission || o.commission, o.currency || currency)}
                        </td>
                        <td className="px-3 py-3">
                          {orderStatusBadge(o.orderStatus || o.status || o.paymentStatus)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                        No individual order data available for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
