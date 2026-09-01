import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { useImportedRecordDetail } from "../../hooks/useImportedRecordDetail";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { StatusPill } from "../../components/ui/StatusPill";
import { Select } from "../../components/ui/FormControls";
import { ImportedRecordDetailDrawer } from "../../components/ops/ImportedRecordDetailDrawer";
import { CampaignCommissionCell, CampaignNameCell } from "../../components/ops/CampaignCommissionCell";
import { CampaignCapabilityCell } from "../../components/ops/CampaignCapabilityCell";
import {
  NetworkCampaignFilterBar,
  NETWORK_CAMPAIGN_EMPTY_FILTERS,
  updateNetworkCampaignFilter,
} from "../../components/ops/NetworkCampaignFilterBar";
import { buildImportedRecordsQuery, buildSharedNetworkQuery } from "./networkCampaignFilters";
import { displayText } from "../../utils/display";
import { formatDate, formatDateShort } from "../helpers";
import { ReportViewBuilder, useSavedReportViews } from "./ReportViewBuilder";
import {
  ALL_NETWORK_RECORD_TYPES,
  ALL_NETWORK_VIEW_MODES,
  buildSourceColumnDefs,
  collectSourceFieldKeys,
  getMboColumnCatalog,
  normalizeProductExplorerRow,
  normalizeRecordTypeForApi,
  resolveActiveColumnKeys,
} from "./networkFieldCatalog";

function HeaderCell({ label, technical, sourceOnly = false }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span
        className={`whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide ${sourceOnly ? "text-amber-800" : "text-slate-700"}`}
      >
        {label}
      </span>
      <span className="whitespace-nowrap font-mono text-[10px] font-normal normal-case tracking-normal text-slate-400">
        {technical}
      </span>
    </span>
  );
}

function UrlCell({ value, compact = false }) {
  const links = Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
  if (!links.length) return <span className="text-slate-400">—</span>;
  const maxW = compact ? "max-w-[120px]" : "max-w-[220px]";
  return (
    <span className="flex flex-col gap-1">
      {links.map((href) => {
        const url = String(href);
        return (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noreferrer"
            className={`block truncate text-sky-700 hover:underline ${maxW}`}
            title={url}
            onClick={(e) => e.stopPropagation()}
          >
            {url}
          </a>
        );
      })}
    </span>
  );
}

function TrackingLinkCell({ row, compact = false }) {
  const links =
    row.supplierTrackingLinks?.length > 0
      ? row.supplierTrackingLinks
      : row.networkTrackingLinks?.length > 0
        ? row.networkTrackingLinks
        : row.supplierTrackingLink || row.networkTrackingLink
          ? [row.supplierTrackingLink || row.networkTrackingLink]
          : [];
  if (!links.length) return <span className="text-slate-400">—</span>;
  if (links.length === 1) return <UrlCell value={links[0]} compact={compact} />;
  return (
    <span className="flex flex-col gap-1">
      <Link
        to="/ops/network/tracking-links"
        className="text-xs font-medium text-sky-700 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {links.length} supplier links
      </Link>
      <UrlCell value={links[0]} compact={compact} />
    </span>
  );
}

function YesNo({ value }) {
  if (value == null) return <span className="text-slate-400">—</span>;
  return value ? "YES" : "NO";
}

function formatCellValue(value) {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "YES" : "NO";
  if (typeof value === "object") {
    try {
      const s = JSON.stringify(value);
      return s.length > 80 ? `${s.slice(0, 80)}…` : s;
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function getRowFieldValue(row, colKey) {
  if (String(colKey).startsWith("source:")) {
    const sourceKey = colKey.slice("source:".length);
    return row?.sourceFields?.[sourceKey];
  }
  return row?.[colKey];
}

function renderCell(col, row, { compact = false, recordType = "campaign" } = {}) {
  const value = getRowFieldValue(row, col.key);
  switch (col.key) {
    case "brand":
    case "brandName":
      return (
        <span className={`block min-w-[${compact ? "80" : "120"}px]`}>
          <span
            className={`block truncate font-medium text-slate-900 ${compact ? "max-w-[120px] text-xs" : "max-w-[180px]"}`}
            title={displayText(value)}
          >
            {displayText(value) || "—"}
          </span>
          {row.groupedCampaignCount > 1 ? (
            <span className="mt-0.5 block text-[10px] text-slate-500">{row.groupedCampaignCount} operations</span>
          ) : null}
        </span>
      );
    case "campaign":
    case "campaignName":
    case "productName":
      if (recordType === "campaign" && col.key === "campaign") {
        return <CampaignNameCell row={row} />;
      }
      return (
        <span className={`block truncate ${compact ? "max-w-[120px] text-xs" : "max-w-[200px]"}`} title={displayText(value)}>
          {displayText(value) || "—"}
        </span>
      );
    case "brandWebsiteLink":
    case "brandLogoLink":
    case "couponLink":
      return <UrlCell value={value} compact={compact} />;
    case "networkTrackingLink":
      return <TrackingLinkCell row={row} compact={compact} />;
    case "campaignStatus":
    case "relationshipStatus":
    case "mappingStatus":
    case "couponStatus":
    case "sourceStatus":
      return value != null ? <StatusPill status={value} /> : "—";
    case "isAssignable":
      return <YesNo value={value} />;
    case "linkSupport":
    case "couponSupport":
    case "deeplinkSupport":
    case "feedSupport":
      return <CampaignCapabilityCell row={row} columnKey={col.key} />;
    case "startDate":
    case "endDate":
    case "reportDate":
      return formatDateShort(value) || "—";
    case "lastSyncedAt":
      return formatDate(value) || "—";
    case "rawPayloadId":
      return value ? (
        <Link
          to={`/ops/network/raw-payload?id=${encodeURIComponent(value)}`}
          className="font-mono text-[11px] text-sky-700 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {String(value).slice(0, 8)}…
        </Link>
      ) : (
        "—"
      );
    case "commissionDisplay":
      return <CampaignCommissionCell row={row} />;
    case "commissionAverageDisplay":
      if (!value) return <span className="text-slate-400">—</span>;
      return <span className="text-xs tabular-nums text-slate-800">{value}</span>;
    case "termsAndConditions": {
      const text = value == null ? "" : String(value);
      if (!text.trim() || text === "[object Object]") return <span className="text-slate-400">—</span>;
      const max = compact ? 40 : 80;
      return (
        <span className={`block truncate text-xs text-slate-600 ${compact ? "max-w-[120px]" : "max-w-[220px]"}`} title={text}>
          {text.length > max ? `${text.slice(0, max)}…` : text}
        </span>
      );
    }
    default:
      if (col.sourceOnly) {
        return (
          <span className={`block truncate font-mono text-[11px] text-amber-900 ${compact ? "max-w-[100px]" : "max-w-[180px]"}`} title={formatCellValue(value)}>
            {formatCellValue(value)}
          </span>
        );
      }
      return (
        <span className={`block truncate ${compact ? "max-w-[120px] text-xs" : "max-w-[200px]"}`} title={displayText(value)}>
          {displayText(value) || formatCellValue(value)}
        </span>
      );
  }
}

function downloadCsv(filename, columns, rows) {
  const escape = (v) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = columns.map((c) => escape(c.label)).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          let v = getRowFieldValue(row, c.key);
          if (typeof v === "boolean") v = v ? "YES" : "NO";
          if (c.key === "commissionDisplay") {
            if (Array.isArray(row.commissionOperations) && row.commissionOperations.length) {
              v = row.commissionOperations
                .map((op) => {
                  const rates = (op.commissions || []).map((item) => item?.display).filter(Boolean).join(" ");
                  return [op.campaign, rates].filter(Boolean).join(": ");
                })
                .filter(Boolean)
                .join(" · ");
            } else {
              const items = Array.isArray(row.commissions) ? row.commissions.map((item) => item?.display).filter(Boolean) : [];
              v = items.length ? items.join(" · ") : v;
            }
          }
          if (v != null && typeof v === "object") v = JSON.stringify(v);
          return escape(v);
        })
        .join(","),
    )
    .join("\n");
  const blob = new Blob([[header, body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Pointer 22 — Network Operations: All Network Data inspection screen.
 */
export function AllNetworkDataPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [recordType, setRecordType] = useState("campaign");
  const [filters, setFilters] = useState(() => ({
    ...NETWORK_CAMPAIGN_EMPTY_FILTERS,
    search: initialSearch,
  }));
  const [viewMode, setViewMode] = useState("MBO_DEFAULT");
  const [customBuilderOpen, setCustomBuilderOpen] = useState(false);

  const catalog = useMemo(() => getMboColumnCatalog(recordType), [recordType]);
  const savedViews = useSavedReportViews(`mboAllNetworkData:${recordType}`, catalog, {
    default: {
      name: "My Custom View",
      keys: catalog.filter((c) => c.defaultVisible !== false).map((c) => c.key),
    },
  });

  const isProduct = recordType === "product";
  const apiPath = isProduct ? "/ops/products" : "/ops/imported-records";

  const queryFilters = useMemo(() => {
    if (isProduct) {
      const q = buildSharedNetworkQuery(filters);
      if (filters.network) q.supplier = filters.network;
      return q;
    }
    return buildImportedRecordsQuery(filters, {
      entityType: normalizeRecordTypeForApi(recordType),
      groupBy: recordType === "campaign" ? "brand" : undefined,
    });
  }, [filters, recordType, isProduct]);

  const { rows: rawRows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    apiPath,
    queryFilters,
    { pageSize: 25 },
  );

  const rows = useMemo(
    () => (isProduct ? rawRows.map(normalizeProductExplorerRow) : rawRows),
    [rawRows, isProduct],
  );

  const { detail, detailLoading, detailError, openDetail, closeDetail } = useImportedRecordDetail();

  const recordMeta = ALL_NETWORK_RECORD_TYPES.find((r) => r.value === recordType);
  const compact = viewMode === "COMPACT";

  const sourceColumns = useMemo(() => {
    if (viewMode !== "ALL_COLUMNS") return [];
    return buildSourceColumnDefs(collectSourceFieldKeys(rows));
  }, [viewMode, rows]);

  const activeColumnKeys = useMemo(() => {
    const base = resolveActiveColumnKeys({
      viewMode,
      recordType,
      customKeys: savedViews.activeKeys,
    });
    if (viewMode === "ALL_COLUMNS") {
      return [...base, ...sourceColumns.map((c) => c.key)];
    }
    return base;
  }, [viewMode, recordType, savedViews.activeKeys, sourceColumns]);

  const activeColumns = useMemo(() => {
    const byKey = new Map([...catalog, ...sourceColumns].map((c) => [c.key, c]));
    return activeColumnKeys.map((k) => byKey.get(k)).filter(Boolean);
  }, [catalog, sourceColumns, activeColumnKeys]);

  const tableColumns = useMemo(
    () => [
      ...activeColumns.map((col) => ({
        key: col.key,
        label: <HeaderCell label={col.label} technical={col.technical} sourceOnly={col.sourceOnly} />,
        title: col.label,
        minWidth: compact ? 100 : 140,
        render: (row) => renderCell(col, row, { compact, recordType }),
      })),
      {
        key: "action",
        label: "",
        minWidth: compact ? 72 : 88,
        render: (row) => (
          <Button size="sm" variant="secondary" onClick={() => openDetail(row)}>
            Open
          </Button>
        ),
      },
    ],
    [activeColumns, compact, openDetail, recordType],
  );

  useEffect(() => {
    if (viewMode === "CUSTOM") {
      savedViews.setActiveKeys(savedViews.activeKeys.length ? savedViews.activeKeys : catalog.filter((c) => c.defaultVisible !== false).map((c) => c.key));
    }
  }, [recordType]);

  const viewModeLabel = ALL_NETWORK_VIEW_MODES.find((m) => m.value === viewMode)?.label || viewMode;

  return (
    <PageLayout
      title="All Network Data"
      subtitle="One operational explorer for every network-sourced record, shown with MBO Rewards display naming. Choose the record type, filter a network, and use Custom Columns when the API/source contains more fields than the default MBO view."
      actions={
        <Badge variant="info" className="font-mono text-[10px] tracking-wide">
          v13 · CAMPAIGN ACTUAL DATA + CUSTOM VIEWS
        </Badge>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          className="min-w-[160px]"
          value={recordType}
          options={ALL_NETWORK_RECORD_TYPES.map((r) => ({ value: r.value, label: r.label }))}
          onChange={(e) => {
            setRecordType(e.target.value);
            setViewMode("MBO_DEFAULT");
          }}
        />
        <Select
          className="min-w-[160px]"
          value={viewMode}
          options={ALL_NETWORK_VIEW_MODES}
          onChange={(e) => {
            const next = e.target.value;
            setViewMode(next);
            if (next === "CUSTOM") setCustomBuilderOpen(true);
          }}
        />
        {viewMode === "CUSTOM" ? (
          <>
            <Select
              className="min-w-[160px]"
              value={savedViews.activeId}
              options={savedViews.viewOptions}
              onChange={(e) => savedViews.loadView(e.target.value)}
            />
            <Button variant="secondary" size="sm" onClick={() => setCustomBuilderOpen(true)}>
              Edit Custom View
            </Button>
          </>
        ) : null}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => downloadCsv(`all-network-data-${recordType}.csv`, activeColumns, rows)}
        >
          Export CSV
        </Button>
      </div>

      {recordType !== "product" ? (
        <div className="mb-4">
          <NetworkCampaignFilterBar
            values={filters}
            onChange={(key, value) => setFilters((prev) => updateNetworkCampaignFilter(prev, key, value))}
            onReset={() => setFilters(NETWORK_CAMPAIGN_EMPTY_FILTERS)}
            excludeKeys={["recordType"]}
          />
        </div>
      ) : (
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            className="rounded border px-2 py-1 text-sm"
            placeholder="Search products…"
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
          />
          <Select
            className="min-w-[140px]"
            value={filters.network}
            options={[
              { value: "", label: "All networks" },
              { value: "optimise", label: "Optimise" },
              { value: "partnerize", label: "Partnerize" },
              { value: "impact", label: "Impact" },
            ]}
            onChange={(e) => setFilters((p) => ({ ...p, network: e.target.value }))}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{recordMeta?.label || "Records"}</h2>
            <p className="mt-0.5 max-w-2xl text-xs text-slate-500">{recordMeta?.blurb}</p>
          </div>
          <Badge variant="purple" className="text-[10px]">
            MBO Naming
          </Badge>
        </div>
        <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
          Rows: {pagination?.total ?? rows.length} · Visible Columns: {activeColumns.length}
          {sourceColumns.length ? ` (+${sourceColumns.length} source)` : ""} · Network:{" "}
          {filters.network ? filters.network.toUpperCase() : "All"} · View: {viewModeLabel}
        </div>
        <div className={`p-3 ${compact ? "text-xs" : ""}`}>
          {error ? <p className="mb-2 text-sm text-rose-600">{error}</p> : null}
          <DataTable
            columns={tableColumns}
            rows={rows}
            loading={loading}
            showColumnPicker={false}
            alignTop
            onRefresh={reload}
            page={page}
            totalPages={pagination?.totalPages}
            total={pagination?.total}
            pageSize={pagination?.pageSize}
            onPageChange={setPage}
            emptyTitle="No network records"
            emptyDescription="No records match this data type and network filter."
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        <strong>View modes:</strong> MBO Default = curated operational columns. Compact = fewer columns, tighter
        layout. All Columns = full MBO catalog plus dynamic <em>Source:</em> fields from raw API payloads. My Custom
        View = saved column layouts (persisted in this browser). Open a row → <strong>View source data</strong> for
        full immutable evidence.
      </div>

      <ReportViewBuilder
        open={customBuilderOpen}
        onClose={() => setCustomBuilderOpen(false)}
        catalogFields={catalog}
        viewName={savedViews.activeName}
        onViewNameChange={savedViews.setActiveName}
        selectedKeys={savedViews.activeKeys}
        onSelectedKeysChange={savedViews.setActiveKeys}
        title="My Custom View"
        subtitle="Choose MBO columns for this data type. Source-only fields are available in All Columns mode."
        onApply={(save) => {
          if (save) savedViews.saveCurrent();
          else savedViews.saveAsNew(savedViews.activeName, savedViews.activeKeys);
          setViewMode("CUSTOM");
          setCustomBuilderOpen(false);
        }}
      />

      {!isProduct ? (
        <ImportedRecordDetailDrawer
          detail={detail}
          detailLoading={detailLoading}
          detailError={detailError}
          onClose={closeDetail}
        />
      ) : null}
    </PageLayout>
  );
}
