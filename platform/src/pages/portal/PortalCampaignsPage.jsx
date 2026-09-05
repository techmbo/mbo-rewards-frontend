import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, PORTAL_API, fetchApi } from "../../api";
import { Modal } from "../../components/ui/Modal";
import { BrandIdentity } from "../../components/brand/BrandIdentity";
import { unwrap } from "./portalUtils";
import {
  brandLogoUrl,
  brandName,
  brandWebsiteUrl,
  campaignName,
  campaignStatusLabel,
  assignmentStatusLabel,
  categoryLabel,
  channelLabel,
  classifyCampaignLoadError,
  commercialModelLabel,
  commissionLabel,
  countryLabel,
  couponLinkPresentation,
  couponLinkPrimary,
  couponState,
  currencyLabel,
  isCouponChannel,
  isLinkChannel,
  offerLabel,
  trackingState,
} from "./portalCampaignHelpers";

const TABS = [
  { id: "all", label: "All Campaigns" },
  { id: "affiliate", label: "Affiliate Link Report" },
  { id: "coupon", label: "Coupon Code Report" },
];

function StatusBadge({ status }) {
  const s = String(status || "").toUpperCase();
  if (s === "LIVE" || s === "CLIENT_VISIBLE" || s === "ACTIVE") {
    return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-700">LIVE</span>;
  }
  if (s === "NEW") {
    return <span className="rounded-full bg-violet-50 px-2.5 py-1 text-sm font-bold text-violet-700">NEW</span>;
  }
  if (s === "EXPIRING") {
    return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-700">EXPIRING</span>;
  }
  if (s === "PAUSED") {
    return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-500">PAUSED</span>;
  }
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-500">{status || "—"}</span>;
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

function fmtMoney(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DetailField({ label, children, className = "" }) {
  return (
    <div className={`rounded-[10px] border border-slate-200 bg-slate-50 p-4 ${className}`}>
      <span className="block text-sm font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <div className="mt-1.5 text-sm leading-relaxed text-slate-800">{children}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h4>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function CouponLinkCell({ campaign, compact = false, onCopy }) {
  const parts = couponLinkPresentation(campaign);
  if (!parts.length) return <span className="text-slate-400">—</span>;

  return (
    <div className="space-y-1">
      {parts.map((part) => {
        if (part.value) {
          const mono = part.kind === "coupon";
          return (
            <div key={part.kind} className="flex items-center gap-1.5">
              {compact ? null : (
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {part.kind === "coupon" ? "Coupon" : "Link"}
                </span>
              )}
              <code
                className={`${mono ? "font-bold" : "max-w-[280px] truncate"} font-mono text-sm text-slate-700`}
              >
                {part.value}
              </code>
              {onCopy ? (
                <button
                  type="button"
                  onClick={() => onCopy(part.value)}
                  className="shrink-0 rounded border border-slate-200 px-2 py-1 text-sm text-slate-500"
                >
                  Copy
                </button>
              ) : null}
            </div>
          );
        }
        return (
          <span key={part.kind} className="text-slate-400">
            {part.label || "—"}
          </span>
        );
      })}
    </div>
  );
}

export function PortalCampaignsPage() {
  const [tab, setTab] = useState("all");
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toast, setToast] = useState("");

  const [perfByCampaign, setPerfByCampaign] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = { pageSize: 200 };
      const [response, perfRes] = await Promise.all([
        fetchApi(PORTAL_API.campaigns, params),
        fetchApi(PORTAL_API.performance, { pageSize: 500 }).catch(() => null),
      ]);
      const data = unwrap(response);
      setPayload(data);

      const perf = perfRes ? unwrap(perfRes) : null;
      const items = perf?.items || perf?.rows || perf?.performance || [];
      const map = {};
      for (const row of items) {
        const key = String(row.campaignName || row.campaign || "").trim().toLowerCase();
        const brandKey = String(row.brandName || row.brand || "").trim().toLowerCase();
        const compound = `${brandKey}::${key}`;
        const bucket = map[compound] || map[key] || {
          clicks: 0,
          orders: 0,
          confirmedOrders: 0,
          confirmedOrderValue: 0,
          commission: 0,
        };
        bucket.clicks += Number(row.linkClicks ?? row.clicks ?? 0) || 0;
        bucket.orders += Number(row.grossOrders ?? row.orders ?? 0) || 0;
        bucket.confirmedOrders += Number(row.confirmedOrders ?? 0) || 0;
        bucket.confirmedOrderValue += Number(row.confirmedOrderValue ?? row.netOrderValue ?? 0) || 0;
        bucket.commission += Number(
          row.confirmedClientCommission ?? row.clientCommission ?? row.clientCommissionGenerated ?? 0,
        ) || 0;
        if (key) map[key] = bucket;
        if (compound) map[compound] = bucket;
      }
      setPerfByCampaign(map);
    } catch (err) {
      setLoadError(classifyCampaignLoadError(err, ApiError, PORTAL_API.campaigns));
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, []);

  function metricsFor(c) {
    const key = String(campaignName(c) || "").trim().toLowerCase();
    const brandKey = String(brandName(c) || "").trim().toLowerCase();
    return (
      perfByCampaign[`${brandKey}::${key}`] ||
      perfByCampaign[key] || {
        clicks: null,
        orders: null,
        confirmedOrders: null,
        confirmedOrderValue: null,
        commission: null,
      }
    );
  }

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const campaigns = useMemo(() => [...(payload?.campaigns || [])], [payload]);

  const countries = useMemo(() => {
    const set = new Set();
    campaigns.forEach((c) => {
      if (c.primaryCountry) set.add(c.primaryCountry);
      (c.countries || []).forEach((x) => set.add(x));
    });
    return [...set].sort();
  }, [campaigns]);

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !String(brandName(c) || "").toLowerCase().includes(q) &&
          !String(campaignName(c) || "").toLowerCase().includes(q)
        ) return false;
      }
      if (statusFilter !== "all") {
        const s = String(c.assignmentStatus || c.displayStatus || "").toUpperCase();
        if (statusFilter === "LIVE" && s !== "CLIENT_VISIBLE" && c.displayStatus !== "Live") return false;
        if (statusFilter !== "LIVE" && !s.includes(statusFilter)) return false;
      }
      if (typeFilter !== "all") {
        const model = commercialModelLabel(c).toLowerCase();
        if (!model.includes(typeFilter.toLowerCase())) return false;
      }
      if (countryFilter !== "all") {
        const cc = countryLabel(c);
        if (!String(cc || "").toLowerCase().includes(countryFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [campaigns, search, statusFilter, typeFilter, countryFilter]);

  // Affiliate link campaigns — channel-aware, not coupon-only rows.
  const affiliateCampaigns = useMemo(
    () => campaigns.filter((c) => isLinkChannel(c)),
    [campaigns],
  );

  // Coupon campaigns — channel-aware, not link-only rows.
  const couponCampaigns = useMemo(
    () => campaigns.filter((c) => isCouponChannel(c)),
    [campaigns],
  );

  const affiliateKpis = useMemo(() => {
    let clicks = 0;
    let orders = 0;
    let confirmedOrders = 0;
    let commission = 0;
    let any = false;
    for (const c of affiliateCampaigns) {
      const m = metricsFor(c);
      if (m.clicks != null || m.orders != null || m.commission != null) any = true;
      clicks += Number(m.clicks) || 0;
      orders += Number(m.orders) || 0;
      confirmedOrders += Number(m.confirmedOrders) || 0;
      commission += Number(m.commission) || 0;
    }
    return {
      count: affiliateCampaigns.length,
      clicks: any ? clicks : null,
      orders: any ? orders : null,
      confirmedOrders: any ? confirmedOrders : null,
      commission: any ? commission : null,
    };
  }, [affiliateCampaigns, perfByCampaign]);

  const couponKpis = useMemo(() => {
    let orders = 0;
    let confirmedOrders = 0;
    let confirmedOrderValue = 0;
    let commission = 0;
    let any = false;
    for (const c of couponCampaigns) {
      const m = metricsFor(c);
      if (m.orders != null || m.commission != null) any = true;
      orders += Number(m.orders) || 0;
      confirmedOrders += Number(m.confirmedOrders) || 0;
      confirmedOrderValue += Number(m.confirmedOrderValue) || 0;
      commission += Number(m.commission) || 0;
    }
    return {
      count: couponCampaigns.length,
      orders: any ? orders : null,
      confirmedOrders: any ? confirmedOrders : null,
      confirmedOrderValue: any ? confirmedOrderValue : null,
      commission: any ? commission : null,
    };
  }, [couponCampaigns, perfByCampaign]);

  function copyText(text) {
    navigator.clipboard.writeText(text).then(() => setToast("Copied!")).catch(() => setToast("Copy failed."));
  }

  async function openDetail(c) {
    setDetail(c);
    setDetailLoading(true);
    try {
      const id = c.assignmentId || c.campaignId || c.id;
      if (!id) return;
      const response = await fetchApi(PORTAL_API.campaign(id));
      const data = unwrap(response);
      const fresh = data?.campaign || data;
      if (fresh && typeof fresh === "object") setDetail(fresh);
    } catch {
      // Keep list row if detail fetch fails.
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse campaigns available to your account and access client-safe campaign details.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-5 pb-3 pt-2.5 text-base font-semibold transition-colors ${
              tab === t.id
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* All Campaigns Tab */}
      {tab === "all" && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              className="min-w-[240px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
              placeholder="Search brand or campaign"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="LIVE">Live</option>
              <option value="PAUSED">Paused</option>
              <option value="NEW">New</option>
            </select>
            <select
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="affiliate">Affiliate Link</option>
              <option value="coupon">Coupon</option>
            </select>
            <select
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="all">All Countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-800">Available Campaigns</h2>
              <span className="text-sm text-slate-400">{filtered.length} campaigns</span>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-14 text-center text-sm text-slate-400">Loading campaigns…</div>
              ) : loadError ? (
                <div className="py-14 text-center text-sm text-rose-500">{loadError.message}</div>
              ) : (
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-sm font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-6 py-4">Brand</th>
                      <th className="px-4 py-4">Campaign Name</th>
                      <th className="px-4 py-4">Channel</th>
                      <th className="px-4 py-4">Commercial</th>
                      <th className="px-4 py-4">Customer Offer</th>
                      <th className="px-4 py-4 text-right">Commission</th>
                      <th className="px-4 py-4">Coupon/Link</th>
                      <th className="px-4 py-4">Country</th>
                      <th className="px-4 py-4">Valid Until</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? (
                      filtered.map((c) => {
                        const validUntil = c.campaignValidity?.endDate || c.validity?.endDate || null;
                        const displayStatus = c.isNew
                          ? "NEW"
                          : c.displayStatus || (String(c.assignmentStatus || "").toUpperCase() === "CLIENT_VISIBLE" ? "LIVE" : c.assignmentStatus);
                        return (
                          <tr key={c.assignmentId || c.campaignId} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                                  {String(brandName(c) || "?").slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-semibold text-slate-800">{brandName(c) || "—"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-semibold text-slate-800">{campaignName(c) || "—"}</div>
                              <div className="text-xs text-slate-400">{c.assignmentId || c.campaignId || ""}</div>
                            </td>
                            <td className="px-4 py-4 text-slate-600">{channelLabel(c)}</td>
                            <td className="px-4 py-4 text-slate-600">{commercialModelLabel(c)}</td>
                            <td className="px-4 py-4 text-slate-600">{offerLabel(c) || "—"}</td>
                            <td className="px-4 py-4 text-right font-semibold">{commissionLabel(c)}</td>
                            <td className="px-4 py-4">
                              <CouponLinkCell campaign={c} compact onCopy={copyText} />
                            </td>
                            <td className="px-4 py-4 text-slate-600">{countryLabel(c)}</td>
                            <td className="px-4 py-4 text-slate-600">
                              {validUntil ? new Date(validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge status={displayStatus} />
                            </td>
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                onClick={() => openDetail(c)}
                                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-sm text-slate-400">
                          No campaigns match the filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Affiliate Link Report Tab */}
      {tab === "affiliate" && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <SummaryCard label="Affiliate Campaigns" value={affiliateKpis.count} />
            <SummaryCard label="Clicks" value={affiliateKpis.clicks != null ? affiliateKpis.clicks.toLocaleString() : "—"} />
            <SummaryCard label="Orders" value={affiliateKpis.orders != null ? affiliateKpis.orders.toLocaleString() : "—"} />
            <SummaryCard label="Confirmed Orders" value={affiliateKpis.confirmedOrders != null ? affiliateKpis.confirmedOrders.toLocaleString() : "—"} />
            <SummaryCard label="Commission" value={fmtMoney(affiliateKpis.commission)} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-800">Affiliate Link Report</h2>
              <span className="text-sm text-slate-400">Link-attributed campaigns only</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-4">Brand</th>
                    <th className="px-4 py-4">Campaign Name</th>
                    <th className="px-4 py-4">MBO Tracking Link</th>
                    <th className="px-4 py-4 text-right">Clicks</th>
                    <th className="px-4 py-4 text-right">Orders</th>
                    <th className="px-4 py-4 text-right">Confirmed Orders</th>
                    <th className="px-4 py-4 text-right">Confirmed Order Value</th>
                    <th className="px-4 py-4 text-right">Commission</th>
                    <th className="px-4 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateCampaigns.length > 0 ? (
                    affiliateCampaigns.map((c) => {
                      const displayStatus = c.isNew ? "NEW" : c.displayStatus || "LIVE";
                      const m = metricsFor(c);
                      const linkPart = couponLinkPresentation(c).find((p) => p.kind === "link" && p.value);
                      return (
                        <tr key={c.assignmentId || c.campaignId} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-semibold text-slate-800">{brandName(c)}</td>
                          <td className="px-4 py-4 text-slate-700">{campaignName(c)}</td>
                          <td className="px-4 py-4">
                            {linkPart?.value ? (
                              <div className="flex items-center gap-2">
                                <code className="max-w-[280px] truncate font-mono text-sm text-slate-600">{linkPart.value}</code>
                                <button
                                  type="button"
                                  onClick={() => copyText(linkPart.value)}
                                  className="shrink-0 rounded border border-slate-200 px-2 py-1 text-sm text-slate-500"
                                >
                                  Copy
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400">{trackingState(c).label}</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right tabular-nums">{m.clicks != null ? m.clicks.toLocaleString() : "—"}</td>
                          <td className="px-4 py-4 text-right tabular-nums">{m.orders != null ? m.orders.toLocaleString() : "—"}</td>
                          <td className="px-4 py-4 text-right tabular-nums">{m.confirmedOrders != null ? m.confirmedOrders.toLocaleString() : "—"}</td>
                          <td className="px-4 py-4 text-right tabular-nums">{fmtMoney(m.confirmedOrderValue)}</td>
                          <td className="px-4 py-4 text-right tabular-nums">{fmtMoney(m.commission)}</td>
                          <td className="px-4 py-4"><StatusBadge status={displayStatus} /></td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-sm text-slate-400">
                        No affiliate link campaigns found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Code Report Tab */}
      {tab === "coupon" && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <SummaryCard label="Coupon Campaigns" value={couponKpis.count} />
            <SummaryCard label="Orders" value={couponKpis.orders != null ? couponKpis.orders.toLocaleString() : "—"} />
            <SummaryCard label="Confirmed Orders" value={couponKpis.confirmedOrders != null ? couponKpis.confirmedOrders.toLocaleString() : "—"} />
            <SummaryCard label="Confirmed Order Value" value={fmtMoney(couponKpis.confirmedOrderValue)} />
            <SummaryCard label="Commission" value={fmtMoney(couponKpis.commission)} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-800">Coupon Code Report</h2>
              <span className="text-sm text-slate-400">Coupon-attributed campaigns only</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-4">Brand</th>
                    <th className="px-4 py-4">Campaign Name</th>
                    <th className="px-4 py-4">Coupon Code</th>
                    <th className="px-4 py-4">Customer Offer</th>
                    <th className="px-4 py-4 text-right">Orders</th>
                    <th className="px-4 py-4 text-right">Confirmed Orders</th>
                    <th className="px-4 py-4 text-right">Confirmed Order Value</th>
                    <th className="px-4 py-4 text-right">Commission</th>
                    <th className="px-4 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {couponCampaigns.length > 0 ? (
                    couponCampaigns.map((c) => {
                      const displayStatus = c.isNew ? "NEW" : c.displayStatus || "LIVE";
                      const m = metricsFor(c);
                      const couponPart = couponLinkPresentation(c).find((p) => p.kind === "coupon" && p.value)
                        || couponLinkPrimary(c);
                      return (
                        <tr key={c.assignmentId || c.campaignId} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-semibold text-slate-800">{brandName(c)}</td>
                          <td className="px-4 py-4 text-slate-700">{campaignName(c)}</td>
                          <td className="px-4 py-4">
                            {couponPart?.value ? (
                              <span className="font-mono text-base font-bold text-slate-800">{couponPart.value}</span>
                            ) : (
                              <span className="text-slate-400">{couponState(c).label}</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-slate-600">{offerLabel(c) || "—"}</td>
                          <td className="px-4 py-4 text-right tabular-nums">{m.orders != null ? m.orders.toLocaleString() : "—"}</td>
                          <td className="px-4 py-4 text-right tabular-nums">{m.confirmedOrders != null ? m.confirmedOrders.toLocaleString() : "—"}</td>
                          <td className="px-4 py-4 text-right tabular-nums">{fmtMoney(m.confirmedOrderValue)}</td>
                          <td className="px-4 py-4 text-right tabular-nums">{fmtMoney(m.commission)}</td>
                          <td className="px-4 py-4"><StatusBadge status={displayStatus} /></td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-sm text-slate-400">
                        No coupon campaigns found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Detail Modal */}
      <Modal
        open={Boolean(detail)}
        title={detail ? `${brandName(detail) || "Campaign"} — ${campaignName(detail) || ""}` : "Campaign detail"}
        onClose={() => setDetail(null)}
      >
        {detail ? (
          <div className="space-y-4 text-sm">
            {detailLoading ? (
              <p className="text-sm text-slate-400">Loading campaign details…</p>
            ) : null}
            <Section title="Overview">
              <DetailField label="Brand">
                <BrandIdentity name={brandName(detail)} logoUrl={brandLogoUrl(detail)} size="sm" />
              </DetailField>
              <DetailField label="Campaign">{campaignName(detail) || "—"}</DetailField>
              <DetailField label="Description">{detail.campaignDescription || detail.description || "—"}</DetailField>
              <DetailField label="Category">{categoryLabel(detail)}</DetailField>
              <DetailField label="Campaign status">{campaignStatusLabel(detail)}</DetailField>
              <DetailField label="Assignment status">{assignmentStatusLabel(detail)}</DetailField>
              <DetailField label="Country">{countryLabel(detail)}</DetailField>
            </Section>
            <Section title="Commercial">
              <DetailField label="Channel">{channelLabel(detail)}</DetailField>
              <DetailField label="Commercial model">{commercialModelLabel(detail)}</DetailField>
              <DetailField label="Commission">{commissionLabel(detail)}</DetailField>
              <DetailField label="Customer Offer">{offerLabel(detail) || "—"}</DetailField>
              <DetailField label="Currency">{currencyLabel(detail)}</DetailField>
            </Section>
            <Section title="Tracking">
              <DetailField label="Coupon/Link">
                <CouponLinkCell campaign={detail} onCopy={copyText} />
              </DetailField>
            </Section>
            <Section title="Validity">
              <DetailField label="Valid From">
                {detail.campaignValidity?.startDate
                  ? new Date(detail.campaignValidity.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                  : "—"}
              </DetailField>
              <DetailField label="Valid Until">
                {detail.campaignValidity?.endDate
                  ? new Date(detail.campaignValidity.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                  : "—"}
              </DetailField>
              <DetailField label="Terms & conditions" className="sm:col-span-2">
                <div className="max-h-40 overflow-y-auto overscroll-contain whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {detail.termsAndConditions || "Not available"}
                </div>
              </DetailField>
              <DetailField label="Website">
                {brandWebsiteUrl(detail) || "Not available"}
              </DetailField>
            </Section>
          </div>
        ) : null}
      </Modal>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[120] rounded-[10px] bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
