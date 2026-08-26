import { useMemo, useState } from "react";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Select } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { displayDate, displayText } from "../../utils/display";
import { NETWORK_SOURCE_OPTIONS } from "./networkFieldCatalog";

/**
 * v13 Source Schema — observed field/path/type layer from FieldRegistry.
 * Answers: “Is the source data actually present?”
 */
export function SourceSchemaPage() {
  const [filters, setFilters] = useState({ network: "", entity_type: "" });
  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    [filters],
  );
  const { rows, loading, error, refresh, page, setPage, pagination } = usePagedQuery("/fields", queryFilters, {
    pageSize: 50,
  });

  const columns = useMemo(
    () => [
      {
        key: "networkSource",
        label: "Network Source",
        minWidth: 120,
        render: (r) => displayText(r.networkSource || r.source),
      },
      {
        key: "sourceObject",
        label: "Source Object",
        minWidth: 120,
        render: (r) => displayText(r.sourceObject || r.entityType),
      },
      {
        key: "fieldPath",
        label: "Source Field / Path",
        minWidth: 180,
        render: (r) => displayText(r.fieldPath),
      },
      {
        key: "dataType",
        label: "Data Type",
        minWidth: 100,
        render: (r) => displayText(r.dataType),
      },
      {
        key: "observedExample",
        label: "Observed Example",
        minWidth: 140,
        render: (r) => displayText(r.observedExample || r.sampleValue),
      },
      {
        key: "mboTarget",
        label: "MBO Target",
        minWidth: 140,
        render: (r) => displayText(r.mboTarget || "—"),
      },
      {
        key: "mappingStatus",
        label: "Mapping Status",
        minWidth: 130,
        render: (r) => <StatusPill status={r.mappingStatus || (r.fieldPath ? "OBSERVED" : "UNKNOWN")} />,
      },
      {
        key: "evidence",
        label: "Evidence",
        minWidth: 140,
        render: (r) => displayText(r.evidence || (r.firstSeenAt ? `first seen ${String(r.firstSeenAt).slice(0, 10)}` : null)),
      },
      {
        key: "firstSeenAt",
        label: "First Seen",
        minWidth: 120,
        defaultHidden: true,
        render: (r) => displayDate(r.firstSeenAt),
      },
    ],
    [],
  );

  return (
    <PageLayout
      eyebrow="Data Integrity"
      title="Source Schema"
      subtitle="Observed field/path/type layer. This answers: “Is the source data actually present?”"
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          label="Network Source"
          value={filters.network}
          onChange={(e) => setFilters((p) => ({ ...p, network: e.target.value }))}
          options={NETWORK_SOURCE_OPTIONS}
        />
        <Select
          label="Source Object"
          value={filters.entity_type}
          onChange={(e) => setFilters((p) => ({ ...p, entity_type: e.target.value }))}
          options={[
            { value: "", label: "All objects" },
            { value: "campaign", label: "Campaign" },
            { value: "coupon", label: "Coupon" },
            { value: "conversion", label: "Conversion" },
            { value: "performance", label: "Performance" },
            { value: "payment", label: "Payment" },
            { value: "product", label: "Product" },
          ]}
        />
      </div>
      <DataTable
        dense
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={refresh}
        onRefresh={refresh}
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={setPage}
        emptyTitle="No observed source fields"
        emptyDescription="Fields appear after network sync extracts paths into the field registry."
      />
    </PageLayout>
  );
}
