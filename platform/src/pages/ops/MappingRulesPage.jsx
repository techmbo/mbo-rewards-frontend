import { useMemo, useState } from "react";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { fetchApi } from "../../api";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Select } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { displayDate, displayText } from "../../utils/display";
import { NETWORK_SOURCE_OPTIONS } from "./networkFieldCatalog";
import { MBO_CANONICAL_OBJECT_OPTIONS, mboCanonicalObjectLabel } from "./mboCanonicalObjects";

const STATUS_OPTIONS = [
  { value: "", label: "All rule statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "GAP", label: "Gap (no rule)" },
  { value: "DRAFT", label: "Draft" },
  { value: "DEPRECATED", label: "Deprecated" },
];

const OUTCOME_OPTIONS = [
  { value: "", label: "All outcomes" },
  { value: "MAPPED", label: "Mapped" },
  { value: "SOURCE_PRESENT_MAPPING_MISSING", label: "Mapping missing" },
  { value: "SOURCE_ONLY", label: "Source only" },
  { value: "VERIFY_LIVE", label: "Verify live" },
  { value: "MANUAL_REQUIRED", label: "Manual required" },
];

/**
 * Versioned Mapping Registry — network source path → MBO canonical field.
 */
export function MappingRulesPage() {
  const [filters, setFilters] = useState({
    network: "",
    mapping_status: "",
    field_mapping_outcome: "",
    mbo_target_object: "",
  });
  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    [filters],
  );
  const { rows, loading, error, refresh, page, setPage, pagination, extras } = usePagedQuery(
    "/ops/mapping-registry",
    queryFilters,
    { pageSize: 50 },
  );

  async function resyncRegistry() {
    try {
      await fetchApi("/ops/mapping-registry/sync", { method: "POST" });
      refresh();
    } catch {
      refresh();
    }
  }

  const columns = useMemo(
    () => [
      { key: "network", label: "Network", minWidth: 100, render: (r) => displayText(r.network) },
      {
        key: "sourceObject",
        label: "Source Object",
        minWidth: 110,
        render: (r) => displayText(r.sourceObject),
      },
      {
        key: "sourcePath",
        label: "Source Path",
        minWidth: 160,
        render: (r) => displayText(r.sourcePath),
      },
      {
        key: "mboTargetObject",
        label: "MBO Object",
        minWidth: 150,
        render: (r) => displayText(mboCanonicalObjectLabel(r.mboTargetObject)),
      },
      {
        key: "mboCanonicalField",
        label: "MBO Field",
        minWidth: 150,
        render: (r) => displayText(r.mboCanonicalField || "—"),
      },
      {
        key: "transform",
        label: "Transform",
        minWidth: 100,
        render: (r) => displayText(r.transform || "—"),
      },
      {
        key: "sampleRawValue",
        label: "Sample",
        minWidth: 120,
        render: (r) => displayText(r.sampleRawValue),
      },
      {
        key: "mappingVersion",
        label: "Version",
        minWidth: 120,
        render: (r) => displayText(r.mappingVersion),
      },
      {
        key: "fieldMappingOutcome",
        label: "Outcome",
        minWidth: 150,
        render: (r) => (
          <StatusPill
            status={
              r.fieldMappingOutcome ||
              (r.mappingStatus === "GAP" ? "SOURCE_PRESENT_MAPPING_MISSING" : r.mappingStatus || "MAPPED")
            }
          />
        ),
      },
      {
        key: "mappingStatus",
        label: "Rule",
        minWidth: 100,
        render: (r) => <StatusPill status={r.mappingStatus || "ACTIVE"} />,
      },
      {
        key: "verificationStatus",
        label: "Evidence",
        minWidth: 110,
        render: (r) => <StatusPill status={r.verificationStatus || "UNVERIFIED"} />,
      },
      {
        key: "endpointOrReport",
        label: "Endpoint",
        minWidth: 140,
        defaultHidden: true,
        render: (r) => displayText(r.endpointOrReport),
      },
      {
        key: "lastSyncedAt",
        label: "Synced",
        minWidth: 110,
        defaultHidden: true,
        render: (r) => displayDate(r.lastSyncedAt),
      },
    ],
    [],
  );

  return (
    <PageLayout
      eyebrow="Data Integrity"
      title="Mapping Registry"
      subtitle={
        extras?.engineeringDefects != null
          ? `Versioned network field translation. ${Number(extras.engineeringDefects).toLocaleString()} engineering defects (mapping missing). MBO canonical objects are never collapsed into generic Assets.`
          : "Versioned network field translation. MBO canonical objects are kept separate — never grouped into generic Assets."
      }
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          label="Network"
          value={filters.network}
          onChange={(e) => setFilters((p) => ({ ...p, network: e.target.value }))}
          options={NETWORK_SOURCE_OPTIONS}
        />
        <Select
          label="MBO Object"
          value={filters.mbo_target_object}
          onChange={(e) => setFilters((p) => ({ ...p, mbo_target_object: e.target.value }))}
          options={MBO_CANONICAL_OBJECT_OPTIONS}
        />
        <Select
          label="Rule Status"
          value={filters.mapping_status}
          onChange={(e) => setFilters((p) => ({ ...p, mapping_status: e.target.value }))}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Outcome"
          value={filters.field_mapping_outcome}
          onChange={(e) => setFilters((p) => ({ ...p, field_mapping_outcome: e.target.value }))}
          options={OUTCOME_OPTIONS}
        />
      </div>
      <DataTable
        dense
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={refresh}
        onRefresh={resyncRegistry}
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={setPage}
        emptyTitle="No mapping registry rules"
        emptyDescription="Rules compile from network-mappings JSON and enrich with observed source schema samples."
      />
    </PageLayout>
  );
}
