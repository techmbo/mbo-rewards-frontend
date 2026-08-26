import { useEffect, useMemo, useState } from "react";
import { fetchApi } from "../../api";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Select } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { displayDate, displayText } from "../../utils/display";
import { NETWORK_SOURCE_OPTIONS } from "./networkFieldCatalog";

/**
 * v13 Mapping Rules — source field/path → MBO canonical field.
 * Backed by filesystem mapping JSON via GET /ops/mapping-review/rules.
 */
export function MappingRulesPage() {
  const [network, setNetwork] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi("/ops/mapping-review/rules", {
        ...(network ? { network } : {}),
      });
      const payload = res.data ?? res;
      const items = Array.isArray(payload)
        ? payload
        : payload.items || payload.rules || [];
      setRows(
        items.map((r) => ({
          networkSource: r.network || r.networkSource || r.networkKey,
          sourceObject: r.entity || r.sourceObject,
          sourceFieldPath: r.rawField || r.sourceFieldPath,
          mboCanonicalField: r.mboField || r.mboCanonicalField,
          transformation: r.transform || r.transformation || "—",
          fallback: r.fallback || "—",
          mappingStatus: r.status || r.mappingStatus || "ACTIVE",
          mappingVersion: r.sourceFile || r.mappingVersion || r.lastUpdated,
          ruleType: r.ruleType,
          lastUpdated: r.lastUpdated,
          qa: r.qa,
        })),
      );
    } catch (err) {
      setError(err.message || "Failed to load mapping rules");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [network]);

  const columns = useMemo(
    () => [
      { key: "networkSource", label: "Network Source", minWidth: 120, render: (r) => displayText(r.networkSource) },
      { key: "sourceObject", label: "Source Object", minWidth: 110, render: (r) => displayText(r.sourceObject) },
      {
        key: "sourceFieldPath",
        label: "Source Field / Path",
        minWidth: 180,
        render: (r) => displayText(r.sourceFieldPath),
      },
      {
        key: "mboCanonicalField",
        label: "MBO Canonical Field",
        minWidth: 160,
        render: (r) => displayText(r.mboCanonicalField),
      },
      {
        key: "transformation",
        label: "Transformation",
        minWidth: 130,
        render: (r) => displayText(r.transformation),
      },
      { key: "fallback", label: "Fallback", minWidth: 100, render: (r) => displayText(r.fallback) },
      {
        key: "mappingStatus",
        label: "Mapping Status",
        minWidth: 130,
        render: (r) => <StatusPill status={r.mappingStatus} />,
      },
      {
        key: "mappingVersion",
        label: "Mapping Version",
        minWidth: 160,
        render: (r) => displayText(r.mappingVersion),
      },
      {
        key: "ruleType",
        label: "Rule Type",
        minWidth: 120,
        defaultHidden: true,
        render: (r) => displayText(r.ruleType),
      },
      {
        key: "lastUpdated",
        label: "Last Updated",
        minWidth: 120,
        defaultHidden: true,
        render: (r) => displayDate(r.lastUpdated),
      },
    ],
    [],
  );

  return (
    <PageLayout
      eyebrow="Data Integrity"
      title="Mapping Rules"
      subtitle="Source field/path → MBO canonical field. Mapping is network + source-object specific and versioned."
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          label="Network Source"
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          options={NETWORK_SOURCE_OPTIONS}
        />
      </div>
      <DataTable
        dense
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={load}
        onRefresh={load}
        emptyTitle="No mapping rules"
        emptyDescription="Rules are loaded from network mapping JSON files under backend/network-mappings."
      />
    </PageLayout>
  );
}
