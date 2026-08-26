import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { StatusPill } from "../../components/ui/StatusPill";
import { Drawer } from "../../components/ui/Drawer";
import { BrandIdentity } from "../../components/brand/BrandIdentity";
import { COUNTRY_OPTIONS } from "../../utils/countries";
import { displayDate, displayText } from "../../utils/display";
import { toNetworkBrandQueryFilters } from "./masterCampaignHelpers";

const FILTER_DEFS = [
  { key: "search", type: "search", label: "Search", placeholder: "Brand name..." },
  {
    key: "networkSource",
    label: "Network",
    allLabel: "All networks",
    options: [
      { value: "OPTIMISE", label: "Optimise" },
      { value: "TRACKIER", label: "Trackier" },
      { value: "BOOSTINY", label: "Boostiny" },
      { value: "PARTNERIZE", label: "Partnerize" },
      { value: "IMPACT", label: "Impact" },
    ],
  },
  {
    key: "status",
    label: "Status",
    allLabel: "All statuses",
    options: [
      { value: "ACTIVE", label: "Active" },
      { value: "DRAFT", label: "Draft" },
      { value: "MERGED", label: "Merged" },
      { value: "ARCHIVED", label: "Archived" },
      { value: "NETWORK", label: "Network only" },
    ],
  },
  { key: "country", label: "Country", allLabel: "All countries", options: COUNTRY_OPTIONS.filter((o) => o.value) },
];

function formatNetworks(value) {
  if (!Array.isArray(value) || !value.length) return "—";
  return value
    .map((item) =>
      String(item)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    )
    .join(", ");
}

function countCell(value) {
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : "—";
}

export function BrandsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: "", networkSource: "", status: "", country: "" });
  const [detail, setDetail] = useState(null);

  const queryFilters = useMemo(() => toNetworkBrandQueryFilters(filters), [filters]);
  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/supplier-campaigns/brands",
    queryFilters,
    { pageSize: 25 },
  );

  const columns = useMemo(
    () => [
      {
        key: "brandName",
        label: "Brand Name",
        minWidth: 200,
        render: (row) => <BrandIdentity name={row.displayName} logoUrl={row.logoUrl} />,
      },
      {
        key: "primaryCategory",
        label: "Primary Category",
        render: (row) => displayText(row.primaryCategory || row.category),
      },
      {
        key: "primaryCountry",
        label: "Primary Country",
        render: (row) => displayText(row.primaryCountry || row.country),
      },
      {
        key: "networks",
        label: "Networks",
        minWidth: 140,
        render: (row) => displayText(formatNetworks(row.networkSources)),
      },
      {
        key: "networkCampaigns",
        label: "Network Campaigns",
        render: (row) => countCell(row.networkCampaignCount ?? row.campaignCount),
      },
      {
        key: "masterCampaigns",
        label: "Master Campaigns",
        render: (row) => countCell(row.masterCampaignCount),
      },
      {
        key: "couponCampaigns",
        label: "Coupon Campaigns",
        render: (row) => countCell(row.couponCampaignCount),
      },
      {
        key: "linkCampaigns",
        label: "Link Campaigns",
        render: (row) => countCell(row.linkCampaignCount),
      },
      {
        key: "productCampaigns",
        label: "Product Campaigns",
        render: (row) => countCell(row.productCampaignCount),
      },
      {
        key: "activeCampaigns",
        label: "Active Campaigns",
        render: (row) => countCell(row.activeCampaignCount),
      },
      {
        key: "lastUpdated",
        label: "Last Updated",
        render: (row) => displayDate(row.lastUpdated || row.lastSyncedAt),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusPill status={row.status} />,
      },
      {
        key: "action",
        label: "Action",
        render: (row) => (
          <Link
            to={`/master/brands/${encodeURIComponent(row.id)}`}
            className="text-xs font-medium text-brand-700 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Open Brand
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <PageLayout
      eyebrow="Master"
      title="Brands"
      subtitle="Canonical brand rollups from network supplier campaigns — counts mirror Master Catalog v11."
    >
      <FilterBar
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onReset={() => setFilters({ search: "", networkSource: "", status: "", country: "" })}
        filters={FILTER_DEFS}
      />
      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        onRefresh={reload}
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        pageSize={pagination.pageSize}
        onPageChange={setPage}
        emptyTitle="No brands yet"
        emptyDescription="Brands appear here after network campaigns are synced from suppliers."
        onRowClick={(row) => {
          if (row?.id) navigate(`/master/brands/${encodeURIComponent(row.id)}`);
        }}
      />
      <Drawer open={Boolean(detail)} title={detail?.displayName || "Brand"} onClose={() => setDetail(null)}>
        {detail ? (
          <dl className="grid gap-3">
            <div>
              <dt className="text-[11px] font-semibold uppercase text-slate-400">Brand Name</dt>
              <dd className="mt-1">
                <BrandIdentity name={detail.displayName} logoUrl={detail.logoUrl} size="md" />
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase text-slate-400">Primary Category</dt>
              <dd className="text-sm">{displayText(detail.primaryCategory || detail.category)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase text-slate-400">Primary Country</dt>
              <dd className="text-sm">{displayText(detail.primaryCountry || detail.country)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase text-slate-400">Networks</dt>
              <dd className="text-sm">{displayText(formatNetworks(detail.networkSources))}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase text-slate-400">Network Campaigns</dt>
              <dd className="text-sm">{countCell(detail.networkCampaignCount ?? detail.campaignCount)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase text-slate-400">Master Campaigns</dt>
              <dd className="text-sm">{countCell(detail.masterCampaignCount)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase text-slate-400">Coupon / Link / Product / Active</dt>
              <dd className="text-sm">
                {countCell(detail.couponCampaignCount)} / {countCell(detail.linkCampaignCount)} /{" "}
                {countCell(detail.productCampaignCount)} / {countCell(detail.activeCampaignCount)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase text-slate-400">Last Updated</dt>
              <dd className="text-sm">{displayDate(detail.lastUpdated || detail.lastSyncedAt)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase text-slate-400">Website</dt>
              <dd className="text-sm">
                {detail.website ? (
                  <a href={detail.website} className="text-brand-700 hover:underline" target="_blank" rel="noreferrer">
                    {detail.website}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase text-slate-400">Status</dt>
              <dd>
                <StatusPill status={detail.status} />
              </dd>
            </div>
            <div className="pt-2">
              <Link
                to={`/master/brands/${encodeURIComponent(detail.id)}`}
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                Open Brand Workspace
              </Link>
            </div>
          </dl>
        ) : null}
      </Drawer>
    </PageLayout>
  );
}
