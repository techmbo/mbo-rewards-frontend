import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { fetchApi, patchApi } from "../../api";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { useAuth } from "../../context/AuthContext";
import { hasAnyPermission, PERMISSIONS } from "../../auth/permissions";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { Button } from "../../components/ui/Button";
import { StatusPill } from "../../components/ui/StatusPill";
import { Drawer } from "../../components/ui/Drawer";
import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";
import { MonoChip, UrlCell } from "../../components/ui/TableCells";
import { countryListTitle, displayDate, displayText } from "../../utils/display";
import { CampaignDetailsPanel } from "./CampaignDetailsPanel";
import {
  assignabilityOf,
  formatAssetAvailability,
  formatCampaignType,
  formatCommissionDisplay,
  formatCountries,
  formatCouponScope,
  masterCampaignCouponCode,
  masterCampaignLinkUrl,
} from "./masterCampaignHelpers";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "network", label: "Network Campaigns" },
  { id: "master", label: "Master Campaigns" },
  { id: "coupons", label: "Coupons" },
  { id: "links", label: "Affiliate Links" },
  { id: "products", label: "Products" },
];

function fmt(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return Number(n).toLocaleString("en-US");
}

function brandLetter(name) {
  const ch = String(name || "?").trim().charAt(0);
  return ch ? ch.toUpperCase() : "?";
}

function formatNetworkLabel(value) {
  if (!value) return "—";
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function yesNo(value) {
  return value ? "Yes" : "No";
}

function KpiCard({ label, value, caption }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-slate-900">{value}</p>
      {caption ? <p className="mt-2 text-[11px] text-slate-500">{caption}</p> : null}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-[11rem_1fr] gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="text-sm text-slate-900">{children}</div>
    </div>
  );
}

function brandCampaignQuery(brand, extra = {}) {
  if (!brand) return { forMaster: true, ...extra };
  const base = brand.merchantId
    ? { forMaster: true, merchantId: brand.merchantId }
    : { forMaster: true, brandKey: brand.id || brand.brandKey };
  const search = extra.q || extra.search || undefined;
  const rest = { ...extra };
  delete rest.q;
  delete rest.search;
  return { ...base, ...rest, ...(search ? { search } : {}) };
}

export function BrandWorkspacePage() {
  const { brandKey: rawBrandKey } = useParams();
  const brandKey = decodeURIComponent(rawBrandKey || "");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const { user } = useAuth();
  const canEdit = hasAnyPermission(user, [PERMISSIONS.CATALOG_MANAGE, PERMISSIONS.CLIENTS_MANAGE]);

  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editBusy, setEditBusy] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [campaignDetail, setCampaignDetail] = useState(null);

  const [netFilters, setNetFilters] = useState({ q: "", networkSource: "" });
  const [productFilters, setProductFilters] = useState({ search: "", network: "" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetchApi(`/supplier-campaigns/brands/${encodeURIComponent(brandKey)}`);
        if (cancelled) return;
        setBrand(res?.data ?? null);
        if (!res?.data) setError("Brand not found.");
      } catch (err) {
        if (!cancelled) {
          setBrand(null);
          setError(err?.message || "Failed to load brand workspace.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (brandKey) load();
    return () => {
      cancelled = true;
    };
  }, [brandKey]);

  const campaignFilters = useMemo(
    () => brandCampaignQuery(brand, {
      q: netFilters.q || undefined,
      networkSource: netFilters.networkSource || undefined,
    }),
    [brand, netFilters],
  );

  const networkQuery = usePagedQuery("/supplier-campaigns", campaignFilters, {
    pageSize: 25,
    enabled: Boolean(brand) && (tab === "network" || tab === "links"),
  });

  const masterQuery = usePagedQuery(
    "/supplier-campaigns",
    brandCampaignQuery(brand),
    { pageSize: 25, enabled: Boolean(brand) && tab === "master" },
  );

  const couponQuery = usePagedQuery(
    "/admin/coupons/pool",
    { campaign: brand?.displayName || "" },
    { pageSize: 25, enabled: Boolean(brand?.displayName) && tab === "coupons" },
  );

  const productQuery = usePagedQuery(
    "/ops/products",
    {
      ...(brand?.merchantId ? { merchantId: brand.merchantId } : {}),
      q: productFilters.search || (!brand?.merchantId ? brand?.displayName || "" : "") || undefined,
      ...(productFilters.network ? { supplier: productFilters.network } : {}),
    },
    { pageSize: 50, enabled: Boolean(brand) && tab === "products" },
  );

  function setTab(next) {
    const params = new URLSearchParams(searchParams);
    params.set("tab", next);
    setSearchParams(params, { replace: true });
  }

  function openEdit() {
    setEditForm({
      displayName: brand?.displayName || "",
      website: brand?.website || "",
      logoUrl: brand?.logoUrl || "",
      category: brand?.category || "",
      country: brand?.country || "",
      notes: brand?.description || "",
      status: brand?.status || "ACTIVE",
    });
    setEditMessage("");
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!brand?.merchantId) {
      setEditMessage("This brand is network-only. Match it to a merchant record before editing.");
      return;
    }
    setEditBusy(true);
    setEditMessage("");
    try {
      const country = String(editForm.country || "").trim();
      await patchApi(`/merchants/${brand.merchantId}`, {
        displayName: editForm.displayName || undefined,
        website: editForm.website?.trim() || null,
        logoUrl: editForm.logoUrl?.trim() || null,
        category: editForm.category?.trim() || null,
        country: country.length === 2 ? country.toUpperCase() : undefined,
        notes: editForm.notes?.trim() || null,
        status: editForm.status || undefined,
      });
      const res = await fetchApi(`/supplier-campaigns/brands/${encodeURIComponent(brandKey)}`);
      setBrand(res?.data ?? brand);
      setEditOpen(false);
    } catch (err) {
      setEditMessage(err?.message || "Save failed.");
    } finally {
      setEditBusy(false);
    }
  }

  async function openCampaign(row) {
    try {
      const res = await fetchApi(`/supplier-campaigns/${row.id}`, { forMaster: true });
      setCampaignDetail(res?.data ?? row);
    } catch {
      setCampaignDetail(row);
    }
  }

  const networkColumns = useMemo(
    () => [
      { key: "network", label: "Network", render: (row) => displayText(formatNetworkLabel(row.networkSource || row.supplier)) },
      { key: "account", label: "Network Account", render: (row) => displayText(row.sourceAccountLabel) },
      { key: "name", label: "Campaign Name", minWidth: 160, render: (row) => displayText(row.campaignName || row.displayName) },
      {
        key: "sourceId",
        label: "Campaign Source ID",
        render: (row) => (
          <span className="font-mono text-xs">{displayText(row.campaignSourceId || row.primaryCampaignSourceId)}</span>
        ),
      },
      {
        key: "networkId",
        label: "Network Campaign ID",
        render: (row) => <span className="font-mono text-xs">{displayText(row.supplierCampaignId || row.primarySourceId)}</span>,
      },
      {
        key: "country",
        label: "Country",
        render: (row) => {
          const countries = row.countries || row.country || row.countryCodes;
          return (
            <span className="block max-w-[7rem] truncate" title={countryListTitle(countries) || undefined}>
              {displayText(formatCountries(countries))}
            </span>
          );
        },
      },
      { key: "currency", label: "Currency", render: (row) => displayText(row.currencyCode || row.commissionCurrency) },
      { key: "type", label: "Campaign Type", render: (row) => displayText(formatCampaignType(row) || row.campaignType) },
      { key: "commission", label: "Commission", render: (row) => displayText(formatCommissionDisplay(row)) },
      {
        key: "coupon",
        label: "Coupon",
        render: (row) => yesNo(Boolean(masterCampaignCouponCode(row) || row.hasCoupon || assignabilityOf(row).supportsCoupon)),
      },
      {
        key: "link",
        label: "Link",
        render: (row) => yesNo(Boolean(masterCampaignLinkUrl(row) || row.hasLink || assignabilityOf(row).supportsLink)),
      },
      {
        key: "deeplink",
        label: "Deeplink",
        render: (row) => yesNo(Boolean(row.deepLinkingEnabled || assignabilityOf(row).supportsDeeplink)),
      },
      { key: "productFeed", label: "Product Feed", render: (row) => yesNo(Boolean(row.hasProducts)) },
      {
        key: "relationship",
        label: "Relationship",
        render: (row) => <StatusPill status={assignabilityOf(row).relationshipStatus || "UNKNOWN"} />,
      },
      { key: "status", label: "Status", render: (row) => <StatusPill status={row.campaignStatus || row.catalogStatus} /> },
      {
        key: "mapping",
        label: "Mapping",
        render: (row) => (
          <StatusPill
            status={row.merchantId || row.merchant ? "MAPPED" : "NEEDS_REVIEW"}
            label={row.merchantId || row.merchant ? "Mapped" : "Unmapped"}
          />
        ),
      },
      { key: "lastSync", label: "Last Sync", render: (row) => displayDate(row.lastSyncedAt) },
      {
        key: "action",
        label: "Action",
        render: (row) => (
          <Button size="sm" onClick={() => openCampaign(row)}>
            Open
          </Button>
        ),
      },
    ],
    [],
  );

  const masterColumns = useMemo(
    () => [
      { key: "name", label: "Campaign Name", minWidth: 160, render: (row) => displayText(row.campaignName || row.displayName) },
      {
        key: "masterId",
        label: "Master Campaign ID",
        render: (row) => <span className="font-mono text-xs">{displayText(row.masterCampaignId || row.id)}</span>,
      },
      {
        key: "country",
        label: "Country",
        render: (row) => displayText(formatCountries(row.countries || row.country || row.countryCodes)),
      },
      { key: "type", label: "Campaign Type", render: (row) => displayText(formatCampaignType(row) || row.campaignType) },
      { key: "commission", label: "Commission", render: (row) => displayText(formatCommissionDisplay(row)) },
      { key: "network", label: "Primary Network", render: (row) => displayText(formatNetworkLabel(row.networkSource || row.supplier)) },
      {
        key: "source",
        label: "Primary Source",
        render: (row) => (
          <span className="font-mono text-xs">{displayText(row.primarySourceId || row.supplierCampaignId)}</span>
        ),
      },
      { key: "alt", label: "Alternative Sources", render: (row) => displayText(row.alternateSources ?? Math.max(0, (row.sources?.length || 0) - 1)) },
      {
        key: "coupon",
        label: "Coupon",
        render: (row) =>
          displayText(formatAssetAvailability(Boolean(masterCampaignCouponCode(row) || row.hasCoupon || assignabilityOf(row).supportsCoupon))),
      },
      {
        key: "link",
        label: "Link",
        render: (row) =>
          displayText(formatAssetAvailability(Boolean(masterCampaignLinkUrl(row) || row.hasLink || assignabilityOf(row).supportsLink))),
      },
      {
        key: "products",
        label: "Products",
        render: (row) => displayText(formatAssetAvailability(Boolean(row.hasProducts))),
      },
      {
        key: "ready",
        label: "Assignment Ready",
        render: (row) => {
          const el = assignabilityOf(row);
          return <StatusPill status={el.assignable ? "READY" : "BLOCKED"} label={el.assignable ? "Yes" : "No"} />;
        },
      },
      { key: "assigned", label: "Assigned Count", render: (row) => displayText(row.assignedCount ?? 0) },
      {
        key: "action",
        label: "Action",
        render: (row) => (
          <Button size="sm" onClick={() => openCampaign(row)}>
            Open
          </Button>
        ),
      },
    ],
    [],
  );

  const couponColumns = useMemo(
    () => [
      { key: "network", label: "Network", render: (row) => displayText(formatNetworkLabel(row.supplier || row.network)) },
      { key: "campaign", label: "Campaign Name", render: (row) => displayText(row.campaignName || row.campaign) },
      {
        key: "sourceId",
        label: "Campaign Source ID",
        render: (row) => <span className="font-mono text-xs">{displayText(row.campaignSourceId || row.campaignSource)}</span>,
      },
      { key: "code", label: "Coupon Code", render: (row) => (row.couponCode ? <MonoChip value={row.couponCode} /> : displayText(null)) },
      { key: "source", label: "Source", render: (row) => displayText(row.source || "Network API") },
      { key: "scope", label: "Scope", render: (row) => displayText(formatCouponScope(row.scope)) },
      { key: "total", label: "Total", render: (row) => displayText(row.totalQuantity) },
      { key: "assigned", label: "Assigned", render: (row) => displayText(row.assignedQuantity) },
      { key: "remaining", label: "Remaining", render: (row) => displayText(row.remainingQuantity) },
      { key: "from", label: "Valid From", render: (row) => displayDate(row.validFrom) },
      { key: "until", label: "Valid Until", render: (row) => displayDate(row.validUntil) },
      { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
      {
        key: "alert",
        label: "Alert",
        render: (row) =>
          row.newCodeAlert ? <StatusPill status="NEEDS_REVIEW" label="New Code" /> : displayText(null),
      },
    ],
    [],
  );

  const linkColumns = useMemo(
    () => [
      { key: "network", label: "Network", render: (row) => displayText(formatNetworkLabel(row.networkSource || row.supplier)) },
      { key: "campaign", label: "Campaign Name", render: (row) => displayText(row.campaignName || row.displayName) },
      {
        key: "sourceId",
        label: "Campaign Source ID",
        render: (row) => (
          <span className="font-mono text-xs">{displayText(row.campaignSourceId || row.primaryCampaignSourceId)}</span>
        ),
      },
      { key: "type", label: "Link Type", render: () => "Campaign Link" },
      {
        key: "tracking",
        label: "Network Tracking Link",
        minWidth: 180,
        render: (row) => {
          const url = masterCampaignLinkUrl(row) || row.trackingUrl;
          return url ? <UrlCell url={url} missingLabel="—" tone="indigo" /> : displayText(null);
        },
      },
      {
        key: "destination",
        label: "Destination URL",
        render: (row) =>
          row.destinationUrl || brand?.website ? (
            <UrlCell url={row.destinationUrl || brand.website} missingLabel="—" tone="indigo" />
          ) : (
            displayText(null)
          ),
      },
      {
        key: "deeplink",
        label: "Deeplink",
        render: (row) => yesNo(Boolean(row.deepLinkingEnabled || assignabilityOf(row).supportsDeeplink)),
      },
      { key: "status", label: "Status", render: (row) => <StatusPill status={row.campaignStatus || row.catalogStatus} /> },
      { key: "until", label: "Valid Until", render: (row) => displayDate(row.couponExpiry || row.campaignEndDate) },
      { key: "sync", label: "Last Sync", render: (row) => displayDate(row.lastSyncedAt) },
    ],
    [brand?.website],
  );

  const productColumns = useMemo(
    () => [
      {
        key: "network",
        label: "Network",
        render: (row) => displayText(formatNetworkLabel(row.sources?.[0]?.supplier || row.supplier)),
      },
      { key: "campaign", label: "Campaign", render: (row) => displayText(row.campaignName || row.campaign?.campaignName) },
      { key: "productId", label: "Product ID", render: (row) => <span className="font-mono text-xs">{displayText(row.id)}</span> },
      { key: "sku", label: "SKU", render: (row) => displayText(row.sku) },
      { key: "name", label: "Product Name", minWidth: 160, render: (row) => displayText(row.title || row.name) },
      { key: "category", label: "Category", render: (row) => displayText(row.category) },
      { key: "price", label: "Price", render: (row) => displayText(row.price) },
      { key: "sale", label: "Sale Price", render: (row) => displayText(row.salePrice) },
      { key: "currency", label: "Currency", render: (row) => displayText(row.currency) },
      { key: "availability", label: "Availability", render: (row) => <StatusPill status={row.availability || row.status} /> },
      {
        key: "url",
        label: "Product URL",
        render: (row) => (row.url ? <UrlCell url={row.url} missingLabel="—" tone="indigo" /> : displayText(null)),
      },
      {
        key: "networkLink",
        label: "Network Product Link",
        render: (row) =>
          row.supplierProductTrackingUrl ? (
            <UrlCell url={row.supplierProductTrackingUrl} missingLabel="—" tone="indigo" />
          ) : (
            displayText(null)
          ),
      },
      { key: "updated", label: "Last Updated", render: (row) => displayDate(row.updatedAt) },
    ],
    [],
  );

  const networkSummaryColumns = useMemo(
    () => [
      { key: "network", label: "Network", render: (row) => displayText(formatNetworkLabel(row.network)) },
      { key: "campaigns", label: "Campaigns", render: (row) => fmt(row.campaigns) },
      { key: "coupon", label: "Coupon Campaigns", render: (row) => fmt(row.couponCampaigns) },
      { key: "link", label: "Link Campaigns", render: (row) => fmt(row.linkCampaigns) },
      { key: "product", label: "Product Campaigns", render: (row) => fmt(row.productCampaigns) },
      {
        key: "health",
        label: "Source Health",
        render: (row) => (
          <StatusPill
            status={row.sourceHealth === "Healthy" ? "HEALTHY" : "NEEDS_REVIEW"}
            label={row.sourceHealth || "—"}
          />
        ),
      },
    ],
    [],
  );

  const linkRows = useMemo(
    () => (networkQuery.rows || []).filter((row) => masterCampaignLinkUrl(row) || row.trackingUrl || assignabilityOf(row).supportsLink),
    [networkQuery.rows],
  );

  if (loading) {
    return (
      <PageLayout eyebrow="Master" title="Brand Workspace" subtitle="Loading brand…">
        <LoadingState label="Loading brand workspace" />
      </PageLayout>
    );
  }

  if (error || !brand) {
    return (
      <PageLayout
        eyebrow="Master"
        title="Brand Workspace"
        actions={
          <Link to="/master/brands" className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Back to Brands
          </Link>
        }
      >
        <ErrorState message={error || "Brand not found."} onRetry={() => navigate(0)} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      eyebrow="Master Catalog"
      title="Brand Workspace"
      subtitle="Everything MBO has for this brand across all connected networks."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            to="/master/brands"
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Brands
          </Link>
          <Button variant="primary" onClick={openEdit}>
            Edit Brand
          </Button>
        </div>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt="" className="h-14 w-14 rounded-full border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
                {brandLetter(brand.displayName)}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900">{brand.displayName}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{displayText(brand.description)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusPill status={brand.status} />
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                  {fmt(brand.networks ?? brand.networkSources?.length)} Networks
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                  {fmt(brand.networkCampaignCount ?? brand.campaignCount)} Network Campaigns
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                  {fmt(brand.masterCampaignCount)} Master Campaigns
                </span>
              </div>
            </div>
          </div>
          {brand.website ? (
            <a
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Open Website
            </a>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard label="Networks" value={fmt(brand.networks ?? brand.networkSources?.length)} caption={brand.networkNames || "Connected sources"} />
            <KpiCard label="Network Campaigns" value={fmt(brand.networkCampaignCount ?? brand.campaignCount)} caption="Source records" />
            <KpiCard label="Master Campaigns" value={fmt(brand.masterCampaignCount)} caption="MBO normalized" />
            <KpiCard label="Coupon Records" value={fmt(brand.couponRecordCount)} caption="Across sources" />
            <KpiCard label="Products" value={fmt(brand.productRecordCount)} caption="Product feed records" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-bold text-slate-900">Brand Information</h3>
            <InfoRow label="Brand Name">{displayText(brand.displayName)}</InfoRow>
            <InfoRow label="Brand Website">
              {brand.website ? (
                <a href={brand.website} className="text-brand-700 hover:underline" target="_blank" rel="noreferrer">
                  {brand.website}
                </a>
              ) : (
                "—"
              )}
            </InfoRow>
            <InfoRow label="Primary Category">{displayText(brand.primaryCategory || brand.category)}</InfoRow>
            <InfoRow label="Secondary Category">{displayText(brand.secondaryCategory)}</InfoRow>
            <InfoRow label="Primary Country">{displayText(brand.primaryCountry || brand.country)}</InfoRow>
            <InfoRow label="Secondary Countries">
              {displayText((brand.secondaryCountries || []).join(", ") || null)}
            </InfoRow>
            <InfoRow label="Brand Aliases">{displayText((brand.aliases || []).join(", ") || null)}</InfoRow>
            <InfoRow label="Brand Status">
              <StatusPill status={brand.status} />
            </InfoRow>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-bold text-slate-900">Network Summary</h3>
            <DataTable
              columns={networkSummaryColumns}
              rows={brand.networkSummary || []}
              emptyTitle="No network sources"
              emptyDescription="Campaigns for this brand have not been synced yet."
            />
          </div>
        </div>
      ) : null}

      {tab === "network" ? (
        <div className="space-y-3">
          <FilterBar
            values={netFilters}
            onChange={(key, value) => setNetFilters((prev) => ({ ...prev, [key]: value }))}
            onReset={() => setNetFilters({ q: "", networkSource: "" })}
            filters={[
              { key: "q", type: "search", label: "Search", placeholder: "Campaign name or source ID" },
              {
                key: "networkSource",
                label: "Network",
                allLabel: "All",
                options: [
                  { value: "OPTIMISE", label: "Optimise" },
                  { value: "TRACKIER", label: "Trackier" },
                  { value: "BOOSTINY", label: "Boostiny" },
                  { value: "PARTNERIZE", label: "Partnerize" },
                  { value: "IMPACT", label: "Impact" },
                ],
              },
            ]}
          />
          <DataTable
            columns={networkColumns}
            rows={networkQuery.rows}
            loading={networkQuery.loading}
            error={networkQuery.error}
            onRetry={networkQuery.reload}
            onRefresh={networkQuery.reload}
            page={networkQuery.page}
            totalPages={networkQuery.pagination.totalPages}
            total={networkQuery.pagination.total}
            pageSize={networkQuery.pagination.pageSize}
            onPageChange={networkQuery.setPage}
            emptyTitle="No network campaigns"
            emptyDescription="No source campaigns found for this brand."
          />
        </div>
      ) : null}

      {tab === "master" ? (
        <DataTable
          columns={masterColumns}
          rows={masterQuery.rows}
          loading={masterQuery.loading}
          error={masterQuery.error}
          onRetry={masterQuery.reload}
          onRefresh={masterQuery.reload}
          page={masterQuery.page}
          totalPages={masterQuery.pagination.totalPages}
          total={masterQuery.pagination.total}
          pageSize={masterQuery.pagination.pageSize}
          onPageChange={masterQuery.setPage}
          emptyTitle="No master campaigns"
          emptyDescription={`No normalized campaigns for ${brand.displayName}.`}
        />
      ) : null}

      {tab === "coupons" ? (
        <DataTable
          columns={couponColumns}
          rows={couponQuery.rows}
          loading={couponQuery.loading}
          error={couponQuery.error}
          onRetry={couponQuery.reload}
          onRefresh={couponQuery.reload}
          page={couponQuery.page}
          totalPages={couponQuery.pagination.totalPages}
          total={couponQuery.pagination.total}
          pageSize={couponQuery.pagination.pageSize}
          onPageChange={couponQuery.setPage}
          emptyTitle="No coupon records"
          emptyDescription="No coupon records for this brand."
        />
      ) : null}

      {tab === "links" ? (
        <DataTable
          columns={linkColumns}
          rows={linkRows}
          loading={networkQuery.loading}
          error={networkQuery.error}
          onRetry={networkQuery.reload}
          onRefresh={networkQuery.reload}
          page={networkQuery.page}
          totalPages={networkQuery.pagination.totalPages}
          total={networkQuery.pagination.total}
          pageSize={networkQuery.pagination.pageSize}
          onPageChange={networkQuery.setPage}
          emptyTitle="No affiliate links"
          emptyDescription="No affiliate/tracking links for this brand."
        />
      ) : null}

      {tab === "products" ? (
        <div className="space-y-3">
          <FilterBar
            values={productFilters}
            onChange={(key, value) => setProductFilters((prev) => ({ ...prev, [key]: value }))}
            onReset={() => setProductFilters({ search: "", network: "" })}
            filters={[
              { key: "search", type: "search", label: "Search", placeholder: "Product, SKU, product ID" },
              {
                key: "network",
                label: "Network",
                allLabel: "All",
                options: [
                  { value: "OPTIMISE", label: "Optimise" },
                  { value: "IMPACT", label: "Impact" },
                  { value: "PARTNERIZE", label: "Partnerize" },
                  { value: "TRACKIER", label: "Trackier" },
                  { value: "BOOSTINY", label: "Boostiny" },
                ],
              },
            ]}
          />
          <DataTable
            columns={productColumns}
            rows={productQuery.rows}
            loading={productQuery.loading}
            error={productQuery.error}
            onRetry={productQuery.reload}
            onRefresh={productQuery.reload}
            page={productQuery.page}
            totalPages={productQuery.pagination.totalPages}
            total={productQuery.pagination.total}
            pageSize={productQuery.pagination.pageSize}
            onPageChange={productQuery.setPage}
            emptyTitle="No products"
            emptyDescription="No product records for this brand."
          />
        </div>
      ) : null}

      <Drawer open={editOpen} title="Edit Brand" onClose={() => setEditOpen(false)}>
        <div className="space-y-3">
          {!brand.merchantId ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Network-only brand — create/match a merchant record to edit canonical fields.
            </p>
          ) : null}
          {[
            ["displayName", "Brand Name"],
            ["website", "Brand Website"],
            ["logoUrl", "Brand Logo URL"],
            ["category", "Primary Category"],
            ["country", "Primary Country"],
            ["notes", "Internal Notes"],
          ].map(([key, label]) => (
            <label key={key} className="block text-xs font-semibold text-slate-600">
              {label}
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900"
                value={editForm[key] || ""}
                disabled={!canEdit || !brand.merchantId}
                onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </label>
          ))}
          {editMessage ? <p className="text-sm text-amber-800">{editMessage}</p> : null}
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!canEdit || editBusy || !brand.merchantId} onClick={saveEdit}>
              {editBusy ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Drawer>

      <CampaignDetailsPanel
        open={Boolean(campaignDetail)}
        campaign={campaignDetail}
        clientFacing={{}}
        sources={campaignDetail?.sources || []}
        selectedSourceId={campaignDetail?.campaignSourceId || campaignDetail?.primaryCampaignSourceId}
        resetKey={campaignDetail?.id}
        canEdit={false}
        onClose={() => setCampaignDetail(null)}
      />
    </PageLayout>
  );
}
