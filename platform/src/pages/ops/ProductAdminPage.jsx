import { useEffect, useMemo, useState } from "react";
import { fetchApi, invalidateApiCache, postApi } from "../../api";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { StatusPill } from "../../components/ui/StatusPill";
import { displayText, isAbsent } from "../../utils/display";
import { PRODUCT_FEED_COLUMNS } from "./networkFieldCatalog";

const EMPTY_FILTERS = {
  search: "",
  network: "",
};

const FILTER_DEFINITIONS = [
  {
    key: "search",
    label: "Search",
    type: "text",
    placeholder: "Search products",
  },
  {
    key: "network",
    label: "Network Source",
    options: [
      { value: "OPTIMISE", label: "Optimise" },
      { value: "IMPACT", label: "Impact" },
      { value: "AWIN", label: "Awin" },
      { value: "PARTNERIZE", label: "Partnerize" },
      { value: "TRACKIER", label: "Trackier" },
      { value: "BOOSTINY", label: "Boostiny" },
    ],
  },
];

function HeaderCell({ label, technical }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-slate-700">
        {label}
      </span>
      <span className="whitespace-nowrap font-mono text-[10px] font-normal normal-case tracking-normal text-slate-400">
        {technical}
      </span>
    </span>
  );
}

function networkLabel(value) {
  if (value == null || value === "") return null;
  const key = String(value).toUpperCase();
  const labels = {
    OPTIMISE: "Optimise",
    TRACKIER: "Trackier",
    BOOSTINY: "Boostiny",
    PARTNERIZE: "Partnerize",
    IMPACT: "Impact",
    AWIN: "Awin",
  };
  return labels[key] || String(value);
}

function availabilityLabel(value) {
  if (value == null || value === "") return null;
  const v = String(value).toUpperCase();
  if (v === "UNKNOWN") return null;
  return String(value);
}

/** v13 sample shows plain price values (8999 / 89.00), currency in its own column. */
function displayPrice(value) {
  if (isAbsent(value)) return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  if (Number.isInteger(n)) return String(n);
  return String(n);
}

function DetailField({ label, children }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 break-words text-sm text-slate-900">{children}</div>
    </div>
  );
}

/**
 * Staff Products / Feeds — aligned to v13 Products / Feeds explorer.
 * Only real product/feed records; never invent from campaign metadata.
 */
export function ProductAdminPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const queryFilters = useMemo(() => {
    const next = {};
    if (filters.search?.trim()) next.q = filters.search.trim();
    if (filters.network) next.supplier = filters.network;
    return next;
  }, [filters]);

  const { rows, loading, error, refresh, page, setPage, pagination } = usePagedQuery(
    "/ops/products",
    queryFilters,
    { pageSize: 25 },
  );

  useEffect(() => {
    invalidateApiCache("/ops/products");
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only bust
  }, []);

  async function openDetail(row) {
    // Always show list-row data immediately so the panel never depends on a second round-trip.
    setSelected(row);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const json = await fetchApi(`/ops/products/${row.id}`, {}, { skipCache: true });
      if (json?.data) setSelected(json.data);
    } catch (err) {
      // Keep the list-row payload visible; surface a soft warning only.
      setDetailError(err.message || "Could not load full product detail");
    } finally {
      setDetailLoading(false);
    }
  }

  async function syncProductFeeds() {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const json = await postApi("/ops/products/sync-feeds", { maxFeeds: 3, maxRowsPerFeed: 40 });
      const payload = json.data || json;
      const products = Number(payload.products || 0);
      const feeds = Number(payload.syncedFeeds || 0);
      setSyncMessage(
        products > 0
          ? `Synced ${products} products from ${feeds} Optimise feed(s).`
          : feeds > 0
            ? `Checked ${feeds} feed(s); no product rows returned yet.`
            : "No Optimise product feeds available for connected accounts.",
      );
      invalidateApiCache("/ops/products");
      await refresh();
    } catch (err) {
      setSyncMessage(err.message || "Product feed sync failed");
    } finally {
      setSyncing(false);
    }
  }

  const columns = useMemo(
    () =>
      PRODUCT_FEED_COLUMNS.filter((c) => c.defaultVisible !== false).map((col) => ({
        key: col.key,
        label: <HeaderCell label={col.label} technical={col.technical} />,
        minWidth: col.key === "productName" || col.key === "campaignName" ? 160 : 110,
        className:
          col.key === "supplierProductId" || col.key === "sku"
            ? "font-mono text-[12px]"
            : col.key === "price"
              ? "tabular-nums"
              : undefined,
        render: (r) => {
          if (col.key === "networkSource") return networkLabel(r.networkSource) || "—";
          if (col.key === "price") return displayPrice(r.price);
          if (col.key === "availability") {
            const label = availabilityLabel(r.availability);
            return label ? <StatusPill status={label} /> : "—";
          }
          if (col.key === "mappingStatus") {
            return r.mappingStatus ? (
              <Badge
                variant={
                  r.mappingStatus === "MAPPED"
                    ? "success"
                    : r.mappingStatus === "NEEDS_REVIEW"
                      ? "warning"
                      : "default"
                }
              >
                {r.mappingStatus}
              </Badge>
            ) : (
              "—"
            );
          }
          return (
            <span className="block max-w-[220px] truncate" title={displayText(r[col.key])}>
              {displayText(r[col.key])}
            </span>
          );
        },
      })),
    [],
  );

  return (
    <PageLayout
      eyebrow="Network Operations"
      title="Products / Feeds"
      subtitle="Only real product/feed records are stored here. MBO does not manufacture Product records from campaign metadata."
      actions={
        <>
          <Button variant="secondary" onClick={() => refresh()}>
            Refresh
          </Button>
          <Button onClick={syncProductFeeds} disabled={syncing}>
            {syncing ? "Syncing feeds…" : "Sync Product Feeds"}
          </Button>
        </>
      }
    >
      {syncMessage ? (
        <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {syncMessage}
        </p>
      ) : null}
      <div className="mb-4">
        <FilterBar
          values={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
          onReset={() => setFilters(EMPTY_FILTERS)}
          filters={FILTER_DEFINITIONS}
        />
        <div className="mt-3">
          <Button onClick={() => refresh()}>Apply</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="p-4">
          <DataTable
            columns={columns}
            rows={Array.isArray(rows) ? rows : []}
            loading={loading}
            error={error}
            onRetry={refresh}
            onRowClick={(r) => openDetail(r)}
            emptyTitle="No product records"
            emptyDescription="Products appear after a network product/feed sync. Campaign metadata is never turned into fake products."
            page={page}
            onPageChange={setPage}
            totalPages={pagination?.totalPages}
            total={pagination?.total}
            dense
          />
        </div>
      </div>

      {selected ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Product detail</h3>
              {detailLoading ? (
                <p className="text-xs text-slate-500">Loading full record…</p>
              ) : detailError ? (
                <p className="text-xs text-amber-700">Showing table row data — {detailError}</p>
              ) : null}
            </div>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="Network Source">{networkLabel(selected.networkSource) || "—"}</DetailField>
            <DetailField label="Brand Name">{displayText(selected.brandName)}</DetailField>
            <DetailField label="Campaign Name">{displayText(selected.campaignName)}</DetailField>
            <DetailField label="Supplier Product ID">
              <span className="font-mono text-[12px]">{displayText(selected.supplierProductId)}</span>
            </DetailField>
            <DetailField label="Product Name">{displayText(selected.productName)}</DetailField>
            <DetailField label="SKU">
              <span className="font-mono text-[12px]">{displayText(selected.sku)}</span>
            </DetailField>
            <DetailField label="Price">{displayPrice(selected.price)}</DetailField>
            <DetailField label="Currency">{displayText(selected.currency)}</DetailField>
            <DetailField label="Availability">
              {availabilityLabel(selected.availability) ? (
                <StatusPill status={availabilityLabel(selected.availability)} />
              ) : (
                "—"
              )}
            </DetailField>
            <DetailField label="Product Feed / API Source">{displayText(selected.productFeedSource)}</DetailField>
            <DetailField label="Mapping Status">
              {selected.mappingStatus ? (
                <Badge
                  variant={
                    selected.mappingStatus === "MAPPED"
                      ? "success"
                      : selected.mappingStatus === "NEEDS_REVIEW"
                        ? "warning"
                        : "default"
                  }
                >
                  {selected.mappingStatus}
                </Badge>
              ) : (
                "—"
              )}
            </DetailField>
            {selected.url ? (
              <DetailField label="Product URL">
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-700 hover:underline"
                >
                  Open link
                </a>
              </DetailField>
            ) : null}
          </div>
        </div>
      ) : null}
    </PageLayout>
  );
}
