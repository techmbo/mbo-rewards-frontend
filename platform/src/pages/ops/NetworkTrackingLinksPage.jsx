import { useMemo, useState } from "react";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { StatusPill } from "../../components/ui/StatusPill";
import {
  NetworkCampaignFilterBar,
  NETWORK_CAMPAIGN_EMPTY_FILTERS,
  updateNetworkCampaignFilter,
} from "../../components/ops/NetworkCampaignFilterBar";
import { buildSharedNetworkQuery } from "./networkCampaignFilters";
import { displayText } from "../../utils/display";
import { TRACKING_LINK_COLUMNS } from "./networkFieldCatalog";

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

function UrlCell({ value }) {
  if (!value) return <span className="text-slate-400">—</span>;
  const href = String(value);
  return (
    <a
      href={href.startsWith("http") ? href : `https://${href}`}
      target="_blank"
      rel="noreferrer"
      className="block max-w-[240px] truncate text-sky-700 hover:underline"
      title={href}
      onClick={(e) => e.stopPropagation()}
    >
      {href}
    </a>
  );
}

function networkDisplay(row) {
  return row.networkSourceLabel || displayText(row.networkSource);
}

/**
 * Pointer 11 — supplier tracking links (internal) and MBO tracking links (client-facing) are separate.
 */
export function NetworkTrackingLinksPage() {
  const [filters, setFilters] = useState(NETWORK_CAMPAIGN_EMPTY_FILTERS);

  const queryFilters = useMemo(() => buildSharedNetworkQuery(filters), [filters]);

  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/ops/admin/tracking-links",
    queryFilters,
    { pageSize: 25 },
  );

  const columns = useMemo(
    () =>
      TRACKING_LINK_COLUMNS.filter((c) => c.defaultVisible !== false).map((col) => ({
        key: col.key,
        label: <HeaderCell label={col.label} technical={col.technical} />,
        minWidth:
          col.key === "supplierTrackingLink" || col.key === "mboTrackingLink"
            ? 200
            : col.key === "redirectChainSummary"
              ? 260
              : col.key === "campaignName"
                ? 160
                : 120,
        render: (row) => {
          if (col.key === "networkSource") return networkDisplay(row) || "—";
          if (col.key === "supplierTrackingLink" || col.key === "mboTrackingLink") {
            return <UrlCell value={row[col.key]} />;
          }
          if (col.key === "redirectChainSummary") {
            return (
              <span
                className="block max-w-[280px] truncate text-xs text-slate-600"
                title={row.redirectChainSummary || row.note}
              >
                {row.redirectChainSummary || "—"}
              </span>
            );
          }
          if (col.key === "linkStatus" || col.key === "mappingStatus") {
            return row[col.key] ? <StatusPill status={row[col.key]} /> : "—";
          }
          return (
            <span className="block max-w-[200px] truncate" title={displayText(row[col.key])}>
              {displayText(row[col.key])}
            </span>
          );
        },
      })),
    [],
  );

  return (
    <PageLayout
      eyebrow="Network Operations"
      title="Tracking Links"
      subtitle="Supplier tracking links are internal network URLs. MBO tracking links are client-facing redirects created after assignment."
      actions={
        <Button variant="secondary" onClick={() => reload()}>
          Refresh
        </Button>
      }
    >
      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <span className="font-medium text-slate-800">Runtime redirect chain: </span>
        Client → MBO Tracking Link → MBO Click ID → network SubID/ClickRef/UID/u1 → Supplier Tracking Link → Brand
      </div>

      <div className="mb-4">
        <NetworkCampaignFilterBar
          values={filters}
          onChange={(key, value) => setFilters((prev) => updateNetworkCampaignFilter(prev, key, value))}
          onReset={() => setFilters(NETWORK_CAMPAIGN_EMPTY_FILTERS)}
          excludeKeys={[
            "recordType",
            "sourceStatus",
            "campaignStatus",
            "relationshipStatus",
            "isAssignable",
            "campaignType",
            "category",
            "currency",
            "country",
            "issue",
            "preset",
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="p-4">
          <DataTable
            columns={columns}
            rows={Array.isArray(rows) ? rows : []}
            loading={loading}
            error={error}
            onRetry={reload}
            emptyTitle="No tracking links"
            emptyDescription="Links appear from synced supplier campaigns that have a supplier tracking URL and/or an MBO tracking URL."
            page={page}
            onPageChange={setPage}
            totalPages={pagination?.totalPages}
            total={pagination?.total}
            dense
          />
        </div>
      </div>
    </PageLayout>
  );
}
