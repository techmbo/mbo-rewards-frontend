import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchApi, patchApi, postApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { PageLayout } from "../../components/layout/PageLayout";
import { Button } from "../../components/ui/Button";
import { StatusPill } from "../../components/ui/StatusPill";
import { Drawer } from "../../components/ui/Drawer";
import { BrandIdentity, brandFromRow } from "../../components/brand/BrandIdentity";
import { countryListTitle, displayText } from "../../utils/display";
import { deriveAllocationMode } from "../master/masterCampaignHelpers";
import {
  buildAllocationQuery,
  clientCommissionDisplay,
  countryDisplay,
  couponPoolCell,
  customerOfferDisplay,
  distributionTypeDisplay,
  emptyCatalogMessage,
  formatExpiry,
  parseAllocationListResponse,
} from "./catalogHelpers";
import { NetworkFilter, readStoredClientNetwork, useClientOpsNetworkFilter } from "./NetworkFilter";

const TABS = [
  { id: "available", label: "Available Campaigns" },
  { id: "assigned", label: "Assigned Campaigns" },
  { id: "review", label: "Assignment Review" },
];

const EMPTY_FILTERS = {
  search: "",
  country: "",
  offerType: "",
  completeness: "",
  network: "",
};

function dash(value) {
  if (value == null || value === "") return "—";
  return String(value);
}

function visibilityLabel(row) {
  if (row.published === true && String(row.status || "").toUpperCase() !== "REVOKED") {
    return { code: "ACTIVE", label: "Visible" };
  }
  if (row.published === true) return { code: "ACTIVE", label: "Visible" };
  return { code: "PENDING", label: "Hidden" };
}

/**
 * Client Ops v5 — Client Campaigns distribution engine.
 * Global client selector + Available / Assigned / Assignment Review.
 */
export function ClientCampaignsPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.CLIENTS_MANAGE);
  const [searchParams, setSearchParams] = useSearchParams();

  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(() => searchParams.get("clientId") || "");
  const [client, setClient] = useState(null);
  const [mode, setMode] = useState(() => searchParams.get("tab") || "available");
  const [network, setNetwork] = useClientOpsNetworkFilter();
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    network: readStoredClientNetwork(),
  }));
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [detail, setDetail] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [draftSummary, setDraftSummary] = useState({
    draftCount: 0,
    couponCount: 0,
    linkCount: 0,
    blocking: 0,
  });
  const loadRequestRef = useRef(0);

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        search: filters.search || "",
        country: filters.country || "",
        offerType: filters.offerType || "",
        completeness: filters.completeness || "",
        network: filters.network || "",
      }),
    [filters.search, filters.country, filters.offerType, filters.completeness, filters.network],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchApi("/clients", { page: 1, pageSize: 200 });
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
            ? res.items
            : Array.isArray(res?.data?.items)
              ? res.data.items
              : [];
        if (!cancelled) {
          setClients(items);
          setClientId((prev) => prev || items[0]?.id || "");
        }
      } catch {
        if (!cancelled) setClients([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.network === network) return prev;
      return { ...prev, network };
    });
  }, [network]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (clientId) next.set("clientId", clientId);
    if (mode && mode !== "available") next.set("tab", mode);
    setSearchParams(next, { replace: true });
  }, [clientId, mode, setSearchParams]);

  const load = useCallback(async () => {
    if (!clientId) {
      setRows([]);
      setDrafts([]);
      setClient(null);
      setPagination(null);
      setLoading(false);
      return;
    }
    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
    setLoading(true);
    setError("");
    // Clear stale rows/footer immediately so a prior Network filter (e.g. Boostiny "6")
    // does not show while All networks is still fetching.
    setRows([]);
    setDrafts([]);
    setPagination(null);
    setSelected(new Set());

    const stillCurrent = () => loadRequestRef.current === requestId;

    try {
      if (mode === "review") {
        const res = await fetchApi(
          "/client-assignments",
          {
            clientId,
            published: "false",
            page: String(page),
            pageSize: "25",
            ...(filters.network ? { network: filters.network } : {}),
          },
          { skipCache: true },
        );
        if (!stillCurrent()) return;
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res?.items) ? res.items : [];
        setDrafts(items);
        setRows([]);
        const couponCount = items.filter(
          (r) => r.couponCode || r.couponAssigned || (r.couponAssignments || []).length,
        ).length;
        const linkCount = items.filter(
          (r) => r.hasTrackingUrl || r.trackingUrl || r.mboTrackingUrl || r.trackingLinkId,
        ).length;
        const blocking = items.filter((r) => {
          const life = String(r.status || "").toUpperCase();
          return life === "REVOKED" || r.provisioning?.assignmentReady === false;
        }).length;
        setDraftSummary({
          draftCount: items.length,
          couponCount,
          linkCount,
          blocking,
        });
        try {
          const onb = await fetchApi(`/clients/${clientId}/onboarding`, {}, { skipCache: true });
          if (!stillCurrent()) return;
          const body = onb?.data ?? onb;
          setClient(body?.client || null);
        } catch {
          /* ignore */
        }
        setSummary(null);
        setPagination(res?.pagination || null);
      } else if (mode === "assigned") {
        const res = await fetchApi(
          "/client-assignments",
          {
            clientId,
            page: String(page),
            pageSize: "25",
            ...(filters.network ? { network: filters.network } : {}),
          },
          { skipCache: true },
        );
        if (!stillCurrent()) return;
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res?.items) ? res.items : [];
        setRows(items);
        setDrafts([]);
        setSummary(null);
        setPagination(res?.pagination || null);
        try {
          const onb = await fetchApi(`/clients/${clientId}/onboarding`, {}, { skipCache: true });
          if (!stillCurrent()) return;
          const body = onb?.data ?? onb;
          setClient(body?.client || null);
        } catch {
          /* ignore */
        }
      } else {
        const params = buildAllocationQuery({
          page,
          pageSize: 25,
          mode,
          filters,
        });
        const res = await fetchApi(`/clients/${clientId}/allocation/campaigns`, params, {
          skipCache: true,
        });
        if (!stillCurrent()) return;
        const parsed = parseAllocationListResponse(res);
        setRows(parsed.items);
        setClient(parsed.client);
        setSummary(parsed.summary);
        setPagination(
          res?.pagination || {
            page,
            pageSize: 25,
            total: undefined,
            hasMore: undefined,
          },
        );
        setDrafts([]);
      }
    } catch (err) {
      if (!stillCurrent()) return;
      setError(err?.message || "Unable to load client campaigns.");
      setRows([]);
      setDrafts([]);
      setSummary(null);
      setPagination(null);
    } finally {
      if (stillCurrent()) setLoading(false);
    }
  }, [clientId, page, filterKey, mode, filters.network, filters.search, filters.country, filters.offerType, filters.completeness]);

  useEffect(() => {
    load();
  }, [load]);

  function patchFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === "network") setNetwork(value);
    setPage(1);
  }

  // When network changes from the shared Client Ops filter, reset to page 1 once.
  const prevNetworkRef = useRef(network);
  useEffect(() => {
    if (prevNetworkRef.current === network) return;
    prevNetworkRef.current = network;
    setPage(1);
  }, [network]);

  function toggleSelect(id, assignable) {
    if (!assignable) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runAllot(canonicalCampaignIds) {
    if (!canManage || !clientId || !canonicalCampaignIds.length) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await postApi(`/clients/${clientId}/onboarding/allot`, {
        assignments: canonicalCampaignIds.map((id) => ({ canonicalCampaignId: id })),
      });
      const data = res?.data ?? res;
      const meta = data?.allotResults?.meta || data?.meta;
      setMessage(
        meta
          ? `Draft-assigned ${meta.assigned ?? meta.selected ?? canonicalCampaignIds.length} campaign(s). Open Assignment Review to validate and publish.`
          : "Campaign draft-assigned. Open Assignment Review to validate and publish before client visibility.",
      );
      setSelected(new Set());
      setMode("review");
      setPage(1);
      await load();
    } catch (err) {
      setMessage(err?.message || "Allotment failed.");
    } finally {
      setBusy(false);
    }
  }

  async function publishAllDrafts() {
    if (!canManage || !drafts.length) return;
    setBusy(true);
    setMessage("");
    let ok = 0;
    let fail = 0;
    for (const row of drafts) {
      try {
        await patchApi(`/client-assignments/${row.id}`, { lifecycle: "published" });
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    setMessage(
      fail
        ? `Published ${ok} draft(s); ${fail} failed. Resolve blockers and retry.`
        : `Published ${ok} assignment(s).`,
    );
    setBusy(false);
    await load();
  }

  async function cancelAllDrafts() {
    if (!canManage || !drafts.length) return;
    if (!window.confirm(`Cancel ${drafts.length} draft assignment(s)?`)) return;
    setBusy(true);
    for (const row of drafts) {
      try {
        await patchApi(`/client-assignments/${row.id}`, { lifecycle: "archived" });
      } catch {
        /* continue */
      }
    }
    setMessage("Drafts cancelled.");
    setBusy(false);
    await load();
  }

  const agreementOk = String(client?.agreementStatus || "").toUpperCase() === "SIGNED";
  const commercialOk = Boolean(client?.commercialModel);
  const accountEligible =
    String(client?.status || "").toUpperCase() === "ACTIVE" ||
    String(client?.status || "").toUpperCase() === "PENDING" ||
    Boolean(client?.id);

  const emptyText = emptyCatalogMessage(mode, {
    hasError: Boolean(error),
    filtersActive: Object.values(filters).some((v) => v != null && String(v).trim() !== ""),
  });

  const totalLabel = useMemo(() => {
    const total = pagination?.total;
    if (total == null) return null;
    const size = pagination?.pageSize || 25;
    const start = (page - 1) * size + 1;
    const end = Math.min(page * size, total);
    if (mode === "available") {
      return `Showing ${start}–${end} of ${total.toLocaleString()} eligible campaigns`;
    }
    if (mode === "assigned") {
      return `Showing ${start}–${end} of ${total.toLocaleString()} assigned campaigns`;
    }
    return `Showing ${start}–${end} of ${total.toLocaleString()}`;
  }, [pagination, page, mode]);

  const pageCount = pagination?.total
    ? Math.max(1, Math.ceil(pagination.total / (pagination.pageSize || 25)))
    : 1;

  return (
    <PageLayout
      title="Client Campaigns"
      subtitle="Client distribution engine: select approved Master Campaigns, apply MBO assignment logic, validate and publish."
    >
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="min-w-[220px] flex-1">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Client
            </span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setPage(1);
                setSelected(new Set());
                setMessage("");
              }}
            >
              {!clientId ? <option value="">Select client…</option> : null}
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <NetworkFilter
            id="campaigns-network-filter"
            value={network}
            onChange={(v) => {
              setNetwork(v);
              patchFilter("network", v);
            }}
            className="min-w-[180px]"
          />
          <div className="flex flex-wrap gap-2 pb-1">
            <StatusPill
              status={agreementOk ? "ACTIVE" : "PENDING"}
              label={agreementOk ? "Agreement Signed" : "Agreement Pending"}
            />
            <StatusPill
              status={commercialOk ? "ACTIVE" : "PENDING"}
              label={commercialOk ? "Commercials Configured" : "Commercials Pending"}
            />
            <StatusPill
              status={accountEligible ? "ACTIVE" : "PENDING"}
              label={accountEligible ? "Account Eligible" : "Account Not Eligible"}
            />
          </div>
          {clientId ? (
            <Link
              to={`/clients/${clientId}/setup`}
              className="ml-auto rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Open Client Setup
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              mode === tab.id
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-transparent bg-transparent text-slate-600 hover:bg-slate-50"
            }`}
            onClick={() => {
              setMode(tab.id);
              setPage(1);
              setSelected(new Set());
            }}
          >
            {tab.label}
            {tab.id === "review" && draftSummary.draftCount
              ? ` · ${draftSummary.draftCount}`
              : null}
          </button>
        ))}
      </div>

      {message ? (
        <p className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {message}
        </p>
      ) : null}

      {error ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
          <span>{error}</span>
          <Button type="button" onClick={() => load()}>
            Retry
          </Button>
        </div>
      ) : null}

      {!clientId ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
          Select a client to load available Master Campaigns.
        </p>
      ) : null}

      {clientId && mode === "review" ? (
        <ReviewPanel
          loading={loading}
          drafts={drafts}
          draftSummary={draftSummary}
          busy={busy}
          canManage={canManage}
          emptyText={emptyText}
          onCancelAll={cancelAllDrafts}
          onPublishAll={publishAllDrafts}
          onPublishOne={async (row) => {
            setBusy(true);
            try {
              await patchApi(`/client-assignments/${row.id}`, { lifecycle: "published" });
              setMessage(`Published ${row.campaignName || row.brandName || "assignment"}.`);
              await load();
            } catch (err) {
              setMessage(err?.message || "Publish failed.");
            } finally {
              setBusy(false);
            }
          }}
          onCancelOne={async (row) => {
            setBusy(true);
            try {
              await patchApi(`/client-assignments/${row.id}`, { lifecycle: "archived" });
              setMessage("Draft cancelled.");
              await load();
            } catch (err) {
              setMessage(err?.message || "Cancel failed.");
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

      {clientId && mode === "available" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Available Master Campaigns</h2>
              <p className="text-xs text-slate-500">
                Campaigns not yet assigned to this client. Only rows with Assignment Ready = Yes can be
                selected.
              </p>
            </div>
            <Button
              variant="primary"
              disabled={busy || selected.size === 0 || !canManage}
              onClick={() => runAllot([...selected])}
            >
              Assign Selected ({selected.size})
            </Button>
          </div>

          <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Country
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium normal-case text-slate-800"
                value={filters.country}
                onChange={(e) => patchFilter("country", e.target.value)}
              >
                <option value="">All</option>
                <option value="IN">India</option>
                <option value="AE">UAE</option>
                <option value="SA">Saudi Arabia</option>
              </select>
            </label>
            <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Campaign Type
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium normal-case text-slate-800"
                value={filters.offerType}
                onChange={(e) => patchFilter("offerType", e.target.value)}
              >
                <option value="">All</option>
                <option value="COUPON_OFFER">Coupon Offer</option>
                <option value="AFFILIATE_LINK">Affiliate Link</option>
                <option value="PRODUCT_CAMPAIGN">Product Campaign</option>
              </select>
            </label>
            <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Completeness
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium normal-case text-slate-800"
                value={filters.completeness}
                onChange={(e) => patchFilter("completeness", e.target.value)}
              >
                <option value="">All</option>
                <option value="COMPLETE">Complete</option>
                <option value="INCOMPLETE">Incomplete</option>
              </select>
            </label>
            <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Search
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium normal-case text-slate-800"
                placeholder="Brand or campaign"
                value={filters.search}
                onChange={(e) => patchFilter("search", e.target.value)}
              />
            </label>
          </div>

          <AvailableTable
            loading={loading}
            rows={rows}
            selected={selected}
            canManage={canManage}
            emptyText={emptyText}
            onToggle={toggleSelect}
            onDetails={setDetail}
          />

          <PaginationBar
            label={loading ? "Loading campaigns…" : totalLabel}
            page={page}
            pageCount={loading ? 1 : pageCount}
            loading={loading}
            hasMore={!loading && (pagination?.hasMore ?? page < pageCount)}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
            onPage={setPage}
          />
        </div>
      ) : null}

      {clientId && mode === "assigned" ? (
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Assigned Campaigns</h2>
            <p className="text-xs text-slate-500">Draft and published assignments for the selected client.</p>
          </div>
          <AssignedTable
            loading={loading}
            rows={rows}
            emptyText={emptyText}
            clientId={clientId}
          />
          <PaginationBar
            label={loading ? "Loading campaigns…" : totalLabel}
            page={page}
            pageCount={loading ? 1 : pageCount}
            loading={loading}
            hasMore={!loading && (pagination?.hasMore ?? page < pageCount)}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
            onPage={setPage}
          />
        </div>
      ) : null}

      <Drawer
        open={Boolean(detail)}
        title={detail?.campaignName || "Campaign Details"}
        onClose={() => setDetail(null)}
      >
        {detail ? (
          <div className="space-y-3 text-sm">
            {[
              ["Brand", detail.brandName || brandFromRow(detail).name || "—"],
              ["Campaign Type", distributionTypeDisplay(detail)],
              ["Customer Offer", customerOfferDisplay(detail)],
              ["Selected Source Preview", detail.primarySource || detail.networkSource || "—"],
              ["Client Commission Preview", clientCommissionDisplay(detail)],
              [
                "Assignment Readiness",
                detail.assignmentReady || detail.isAssignable ? "Ready" : detail.issue || "Not ready",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2"
              >
                <span className="text-xs font-medium text-slate-500">{label}</span>
                <b className="text-right text-slate-900">{value}</b>
              </div>
            ))}
            <p className="pt-2 text-xs text-slate-500">
              The client does not receive source-selection details or coupon pool inventory. Those stay
              internal to MBO.
            </p>
            {detail.isAssignable && canManage ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  toggleSelect(detail.id, true);
                  setDetail(null);
                }}
              >
                {selected.has(detail.id) ? "Selected — close" : "Select for assignment"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </PageLayout>
  );
}

function AvailableTable({ loading, rows, selected, canManage, emptyText, onToggle, onDetails }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[1400px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
            {[
              "Select",
              "Brand",
              "Campaign",
              "Type",
              "Customer Offer",
              "Coupon Total",
              "Coupon Assigned",
              "Coupon Reserved",
              "Coupon Remaining",
              "Expiry",
              "Countries",
              "Primary Source",
              "Alternative Sources",
              "Client Commission",
              "Completeness",
              "Assignment Ready",
              "Action",
            ].map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={17} className="px-3 py-12 text-center text-slate-400">
                Loading available campaigns…
              </td>
            </tr>
          ) : null}
          {!loading && !rows.length ? (
            <tr>
              <td colSpan={17} className="px-3 py-12 text-center text-slate-400">
                {emptyText}
              </td>
            </tr>
          ) : null}
          {!loading
            ? rows.map((row) => {
                const brand = brandFromRow(row);
                const supportsCoupon = Boolean(row.channels?.coupon || row.coupon);
                const offer = customerOfferDisplay(row);
                return (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        disabled={!row.isAssignable || !canManage}
                        checked={selected.has(row.id)}
                        onChange={() => onToggle(row.id, row.isAssignable)}
                      />
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      <BrandIdentity name={brand.name || row.brandName} logoUrl={brand.logoUrl || row.brandLogoLink} />
                    </td>
                    <td className="max-w-[200px] px-3 py-3 font-semibold text-slate-900">
                      {row.campaignName || "—"}
                    </td>
                    <td className="px-3 py-3">{distributionTypeDisplay(row)}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">{offer}</td>
                    <td className="px-3 py-3">{couponPoolCell(row.couponTotal, { supportsCoupon })}</td>
                    <td className="px-3 py-3">{couponPoolCell(row.couponAssigned, { supportsCoupon })}</td>
                    <td className="px-3 py-3">{couponPoolCell(row.couponReserved, { supportsCoupon })}</td>
                    <td className="px-3 py-3">{couponPoolCell(row.couponRemaining, { supportsCoupon })}</td>
                    <td className="px-3 py-3">{formatExpiry(row.expiry || row.couponExpiry || row.campaignEndDate)}</td>
                    <td
                      className="max-w-[9rem] truncate px-3 py-3"
                      title={countryListTitle(row.country) || undefined}
                    >
                      {countryDisplay(row.country)}
                    </td>
                    <td className="px-3 py-3">{dash(row.primarySource || row.networkSource)}</td>
                    <td className="px-3 py-3">
                      {row.alternativeSources != null ? String(row.alternativeSources) : "—"}
                    </td>
                    <td className="px-3 py-3">{clientCommissionDisplay(row)}</td>
                    <td className="px-3 py-3">
                      <StatusPill
                        status={row.completeness === "Complete" ? "ACTIVE" : "PENDING"}
                        label={row.completeness || "—"}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill
                        status={row.assignmentReady || row.isAssignable ? "ACTIVE" : "PENDING"}
                        label={row.assignmentReady || row.isAssignable ? "Yes" : "No"}
                      />
                      {!row.isAssignable && row.issue ? (
                        <p className="mt-1 max-w-[140px] text-[10px] leading-snug text-amber-700">
                          {row.issue}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <Button type="button" onClick={() => onDetails?.(row)}>
                        Details
                      </Button>
                    </td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </table>
    </div>
  );
}

function AssignedTable({ loading, rows, emptyText, clientId }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[1280px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
            {[
              "Brand",
              "Campaign",
              "Type",
              "Customer Offer",
              "Coupon Code",
              "Coupon Allocation Type",
              "Selected Source",
              "MBO Tracking Link",
              "MBO Link Status",
              "Client Commission",
              "Publish Status",
              "Visibility",
              "Action",
            ].map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={13} className="px-3 py-12 text-center text-slate-400">
                Loading assigned campaigns…
              </td>
            </tr>
          ) : null}
          {!loading && !rows.length ? (
            <tr>
              <td colSpan={13} className="px-3 py-12 text-center text-slate-400">
                {emptyText}
              </td>
            </tr>
          ) : null}
          {!loading
            ? rows.map((row) => {
                const brand = brandFromRow(row);
                const couponCode =
                  row.coupon?.code ||
                  row.couponCode ||
                  row.clientFacing?.couponCode ||
                  (row.couponAssignments || []).find((c) => c.clientCouponCode)?.clientCouponCode ||
                  null;
                const tracking =
                  row.mboTrackingUrl ||
                  row.trackingUrl ||
                  row.clientFacing?.mboTrackingUrl ||
                  (row.trackingLinks || []).find((l) => l.mboTrackingUrl)?.mboTrackingUrl ||
                  null;
                const offerRow = {
                  ...row,
                  customerOffer:
                    row.customerOffer ||
                    row.clientFacing?.customerOffer ||
                    row.clientFacing?.discountLabel ||
                    null,
                  distributionType: row.distributionType,
                  channels: row.channels,
                  channelType: row.channelType,
                };
                const linkStatus =
                  row.trackingStatus ||
                  (row.trackingLinks || []).find((l) => l.status)?.status ||
                  (tracking ? "ACTIVE" : "PENDING");
                const vis = visibilityLabel(row);
                const allocType = deriveAllocationMode(row, row.clientFacing || {});
                return (
                  <tr key={row.assignmentId || row.id} className="border-t border-slate-100">
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      <BrandIdentity name={brand.name || row.brandName} logoUrl={brand.logoUrl || row.brandLogoLink} />
                    </td>
                    <td className="max-w-[200px] px-3 py-3 font-semibold text-slate-900">
                      {row.campaignName || row.canonicalCampaign?.displayName || "—"}
                    </td>
                    <td className="px-3 py-3">{distributionTypeDisplay(offerRow)}</td>
                    <td className="px-3 py-3">{customerOfferDisplay(offerRow)}</td>
                    <td className="px-3 py-3 font-mono">{dash(couponCode)}</td>
                    <td className="px-3 py-3">{dash(allocType)}</td>
                    <td className="px-3 py-3">{dash(row.primarySource || row.networkSource)}</td>
                    <td className="max-w-[220px] truncate px-3 py-3 font-mono text-[10px]" title={tracking || undefined}>
                      {dash(tracking)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill status={linkStatus} label={displayText(linkStatus, "—")} />
                    </td>
                    <td className="px-3 py-3">{clientCommissionDisplay(row)}</td>
                    <td className="px-3 py-3">
                      <StatusPill
                        status={row.assignmentPublished || row.published ? "ACTIVE" : "PENDING"}
                        label={row.assignmentPublished || row.published ? "Published" : "Draft"}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill status={vis.code} label={vis.label} />
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        to={`/activation-review?clientId=${clientId}`}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </table>
    </div>
  );
}

function ReviewPanel({
  loading,
  drafts,
  draftSummary,
  busy,
  canManage,
  emptyText,
  onCancelAll,
  onPublishAll,
  onPublishOne,
  onCancelOne,
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Draft Assignments", draftSummary.draftCount],
          ["Coupon Reservations", draftSummary.couponCount],
          ["MBO Links Created", draftSummary.linkCount],
          ["Blocking Issues", draftSummary.blocking],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
            <strong className="mt-1 block text-xl text-slate-900">{value}</strong>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Assignment Review</h2>
            <p className="text-xs text-slate-500">
              MBO links are created in draft, validated here, and activated only on publish.
            </p>
          </div>
          {canManage && drafts.length ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={busy} onClick={onCancelAll}>
                Cancel Drafts
              </Button>
              <Button type="button" variant="primary" disabled={busy} onClick={onPublishAll}>
                Publish Assignments
              </Button>
            </div>
          ) : null}
        </div>

        {loading ? (
          <p className="px-4 py-10 text-center text-sm text-slate-400">Loading drafts…</p>
        ) : !drafts.length ? (
          <p className="px-4 py-10 text-center text-sm text-slate-400">{emptyText}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {drafts.map((row) => {
              const tracking = row.mboTrackingUrl || row.trackingUrl || null;
              const ready = row.provisioning?.assignmentReady !== false;
              return (
                <div
                  key={row.id}
                  className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-center"
                >
                  <div className="lg:col-span-1">
                    <div className="font-semibold text-slate-900">
                      {row.brandName || "—"} — {row.campaignName || "—"}
                    </div>
                    <div className="text-xs text-slate-500">{distributionTypeDisplay(row)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Selected Source</div>
                    <div className="text-sm font-semibold">{dash(row.networkSource || row.sourceName)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Allocated Coupon</div>
                    <div className="font-mono text-sm">{dash(row.couponCode)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">MBO Link</div>
                    <div className="truncate font-mono text-[10px]" title={tracking || undefined}>
                      {dash(tracking) === "—" ? "Reserved / pending" : tracking}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Client Commission</div>
                    <div className="text-sm font-semibold">{clientCommissionDisplay(row)}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={ready ? "ACTIVE" : "PENDING"} label={ready ? "Ready" : "Blocked"} />
                    {canManage ? (
                      <>
                        <Button type="button" disabled={busy} onClick={() => onPublishOne(row)}>
                          Publish
                        </Button>
                        <Button type="button" disabled={busy} onClick={() => onCancelOne(row)}>
                          Cancel
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {drafts.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Final Validation</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Campaign", "Master Campaign complete and approved."],
              ["Source", "Selected source active and eligible."],
              ["Coupon / Asset", "Required asset reserved."],
              ["Tracking", "MBO tracking route created and valid."],
              ["Commercial", "Client commission resolved."],
              ["Client", "Client account eligible for assignment."],
            ].map(([label, note]) => (
              <div key={label} className="rounded-lg border border-slate-100 p-3 text-xs">
                <strong className="flex items-center justify-between gap-2">
                  {label} <StatusPill status="ACTIVE" label="Passed" />
                </strong>
                <p className="mt-1 text-slate-500">{note}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PaginationBar({ label, page, pageCount, loading, hasMore, onPrev, onNext, onPage }) {
  const pages = [];
  const max = Math.min(pageCount, 3);
  for (let i = 1; i <= max; i += 1) pages.push(i);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
      <span>{label || `Page ${page}`}</span>
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            disabled={loading}
            onClick={() => onPage(p)}
            className={`min-w-[2rem] rounded-md border px-2 py-1 font-semibold ${
              p === page
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {p}
          </button>
        ))}
        <Button type="button" disabled={loading || !hasMore} onClick={onNext}>
          Next
        </Button>
        <Button type="button" disabled={loading || page <= 1} onClick={onPrev}>
          Previous
        </Button>
      </div>
    </div>
  );
}
