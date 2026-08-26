import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { useImportedRecordDetail } from "../../hooks/useImportedRecordDetail";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { StatusPill } from "../../components/ui/StatusPill";
import { Select } from "../../components/ui/FormControls";
import { ImportedRecordDetailDrawer } from "../../components/ops/ImportedRecordDetailDrawer";
import {
  NetworkCampaignFilterBar,
  NETWORK_CAMPAIGN_EMPTY_FILTERS,
  updateNetworkCampaignFilter,
} from "../../components/ops/NetworkCampaignFilterBar";
import { buildImportedRecordsQuery } from "./networkCampaignFilters";
import { displayText } from "../../utils/display";
import { formatDate, formatDateShort } from "../helpers";
import {
  ALL_NETWORK_RECORD_TYPES,
  CAMPAIGN_MBO_COLUMNS,
} from "./networkFieldCatalog";

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
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block max-w-[220px] truncate text-sky-700 hover:underline"
      title={href}
      onClick={(e) => e.stopPropagation()}
    >
      {href}
    </a>
  );
}

function YesNo({ value }) {
  if (value == null) return <span className="text-slate-400">—</span>;
  return value ? "YES" : "NO";
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
          let v = row[c.key];
          if (typeof v === "boolean") v = v ? "YES" : "NO";
          if (v && typeof v === "object") v = JSON.stringify(v);
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
 * Network Operations — All Network Data (CSV Campaign entity + MBO naming).
 */
export function AllNetworkDataPage() {
  const [recordType, setRecordType] = useState("campaign");
  const [filters, setFilters] = useState(NETWORK_CAMPAIGN_EMPTY_FILTERS);
  const [viewMode, setViewMode] = useState("mbo"); // mbo | all
  const [pickerOpen, setPickerOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(() =>
    CAMPAIGN_MBO_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key),
  );

  const queryFilters = useMemo(
    () => buildImportedRecordsQuery(filters, { entityType: recordType }),
    [filters, recordType],
  );

  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/ops/imported-records",
    queryFilters,
    { pageSize: 25 },
  );

  const { detail, detailLoading, detailError, openDetail, closeDetail } = useImportedRecordDetail();

  const recordMeta = ALL_NETWORK_RECORD_TYPES.find((r) => r.value === recordType);

  const activeColumns = useMemo(() => {
    const keys =
      viewMode === "all"
        ? CAMPAIGN_MBO_COLUMNS.map((c) => c.key)
        : visibleKeys;
    return CAMPAIGN_MBO_COLUMNS.filter((c) => keys.includes(c.key));
  }, [viewMode, visibleKeys]);

  const tableColumns = useMemo(
    () => [
      ...activeColumns.map((col) => ({
        key: col.key,
        label: <HeaderCell label={col.label} technical={col.technical} />,
        minWidth: 140,
        render: (row) => {
          switch (col.key) {
            case "brandWebsiteLink":
            case "brandLogoLink":
            case "networkTrackingLink":
              return <UrlCell value={row[col.key]} />;
            case "campaignStatus":
            case "relationshipStatus":
            case "mappingStatus":
              return row[col.key] != null ? <StatusPill status={row[col.key]} /> : "—";
            case "isAssignable":
            case "linkSupport":
            case "couponSupport":
            case "deeplinkSupport":
              return <YesNo value={row[col.key]} />;
            case "startDate":
            case "endDate":
              return formatDateShort(row[col.key]) || "—";
            case "lastSyncedAt":
              return formatDate(row[col.key]) || "—";
            case "rawPayloadId":
              return row.rawPayloadId ? (
                <Link
                  to={`/ops/network/raw-payload?id=${encodeURIComponent(row.rawPayloadId)}`}
                  className="font-mono text-[11px] text-sky-700 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {row.rawPayloadId.slice(0, 8)}…
                </Link>
              ) : (
                "—"
              );
            case "commissionDisplay":
              return displayText(row.commissionDisplay || row.commission);
            case "termsAndConditions": {
              const t = row.termsAndConditions;
              if (t == null || t === "" || (typeof t === "object" && !Array.isArray(t))) {
                return <span className="text-slate-400">—</span>;
              }
              const text = String(t);
              if (!text.trim() || text === "[object Object]") {
                return <span className="text-slate-400">—</span>;
              }
              return (
                <span className="block max-w-[220px] truncate text-xs text-slate-600" title={text}>
                  {text.length > 80 ? `${text.slice(0, 80)}…` : text}
                </span>
              );
            }
            default:
              return (
                <span className="block max-w-[200px] truncate" title={displayText(row[col.key])}>
                  {displayText(row[col.key])}
                </span>
              );
          }
        },
      })),
      {
        key: "action",
        label: "",
        minWidth: 88,
        render: (row) => (
          <Button size="sm" variant="secondary" onClick={() => openDetail(row)}>
            Open
          </Button>
        ),
      },
    ],
    [activeColumns, openDetail],
  );

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
          onChange={(e) => setRecordType(e.target.value)}
        />
        <Select
          className="min-w-[140px]"
          value={viewMode}
          options={[
            { value: "mbo", label: "MBO Default" },
            { value: "all", label: "All Columns" },
          ]}
          onChange={(e) => setViewMode(e.target.value)}
        />
        <Button variant="secondary" size="sm" onClick={() => setPickerOpen((v) => !v)}>
          Custom Columns
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            downloadCsv(
              `all-network-data-${recordType}.csv`,
              activeColumns,
              rows,
            )
          }
        >
          Export CSV
        </Button>
      </div>

      <div className="mb-4">
        <NetworkCampaignFilterBar
          values={filters}
          onChange={(key, value) => setFilters((prev) => updateNetworkCampaignFilter(prev, key, value))}
          onReset={() => setFilters(NETWORK_CAMPAIGN_EMPTY_FILTERS)}
          excludeKeys={["recordType"]}
        />
      </div>

      {pickerOpen ? (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Custom Columns (MBO Default view)
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CAMPAIGN_MBO_COLUMNS.map((col) => (
              <label key={col.key} className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={visibleKeys.includes(col.key)}
                  onChange={(e) => {
                    setVisibleKeys((prev) =>
                      e.target.checked
                        ? [...prev, col.key]
                        : prev.filter((k) => k !== col.key),
                    );
                    setViewMode("mbo");
                  }}
                />
                <span>
                  <span className="font-medium">{col.label}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-slate-400">{col.technical}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

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
          Rows: {pagination?.total ?? rows.length} · Visible Columns: {activeColumns.length} · Network:{" "}
          {filters.network ? filters.network.toUpperCase() : "All"} · View:{" "}
          {viewMode === "all" ? "All Columns" : "MBO Default"}
        </div>
        <div className="p-3">
          {error ? <p className="mb-2 text-sm text-rose-600">{error}</p> : null}
          <DataTable
            columns={tableColumns}
            rows={rows}
            loading={loading}
            showColumnPicker={false}
            onRefresh={reload}
            page={page}
            totalPages={pagination?.totalPages}
            total={pagination?.total}
            pageSize={pagination?.pageSize}
            onPageChange={setPage}
            emptyTitle="No network records"
            emptyDescription="No imported records match this record type and network filter."
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        <strong>How to use this:</strong> MBO Default shows the standard operational view. All Columns
        reveals every field retained for that record type. Source Field Catalog shows API-specific
        fields separately, including the mapped MBO Display Name and Canonical Field, so extra
        supplier fields do not change the MBO standard.
      </div>

      <ImportedRecordDetailDrawer
        detail={detail}
        detailLoading={detailLoading}
        detailError={detailError}
        onClose={closeDetail}
      />
    </PageLayout>
  );
}
