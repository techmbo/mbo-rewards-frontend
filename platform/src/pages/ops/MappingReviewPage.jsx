import { useEffect, useState } from "react";
import { fetchApi, postApi } from "../../api";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { LoadingState } from "../../components/ui/LoadingState";
import { formatDate } from "../helpers";
import { displayText } from "../../utils/display";

/**
 * Sync Review — mapping exceptions, raw payloads, and mapping rules (one page).
 * Does not create /network-ops/raw-payloads or /network-ops/mapping-rules.
 */
export function MappingReviewPage() {
  const [tab, setTab] = useState("exceptions");
  const [rows, setRows] = useState([]);
  const [payloads, setPayloads] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [ex, raw, rulesRes] = await Promise.all([
        fetchApi("/ops/mapping-review"),
        fetchApi("/ops/raw-payloads", { pageSize: 30 }),
        fetchApi("/ops/mapping-review/rules").catch(() => ({ data: [] })),
      ]);
      setRows(ex.data?.rows || []);
      setPayloads(raw.data?.rows || []);
      const rulesPayload = rulesRes.data ?? rulesRes;
      setRules(
        Array.isArray(rulesPayload)
          ? rulesPayload
          : rulesPayload.items || rulesPayload.rules || [],
      );
    } catch (err) {
      setError(err.message || "Failed to load mapping review");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function inspect(id) {
    const json = await fetchApi(`/ops/raw-payloads/${id}`);
    setDetail(json.data);
  }

  async function replay(id) {
    await postApi(`/ops/raw-payloads/${id}/replay`, {});
    await load();
    await inspect(id);
  }

  return (
    <PageLayout title="Sync Review" subtitle="Mapping exceptions, raw payloads, and mapping rules">
      <div className="mb-4 flex gap-2">
        {["exceptions", "payloads", "rules"].map((id) => (
          <button
            key={id}
            type="button"
            className={`rounded-lg px-3 py-2 text-sm capitalize ${tab === id ? "bg-slate-900 text-white" : "border border-slate-300 bg-white"}`}
            onClick={() => setTab(id)}
          >
            {id === "exceptions" ? "Exceptions" : id === "payloads" ? "Raw payloads" : "Mapping rules"}
          </button>
        ))}
      </div>
      {loading ? <LoadingState label="Loading..." /> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {tab === "exceptions" && !loading ? (
        <DataTable
          columns={[
            { key: "type", label: "Type" },
            { key: "supplier", label: "Supplier" },
            { key: "status", label: "Status" },
            { key: "detectedAt", label: "Detected", render: (r) => formatDate(r.detectedAt) },
          ]}
          rows={rows}
          emptyTitle="No mapping exceptions"
        />
      ) : null}

      {tab === "payloads" && !loading ? (
        <>
          <DataTable
            columns={[
              { key: "supplier", label: "Supplier" },
              { key: "resourceKey", label: "Resource" },
              { key: "externalId", label: "External ID" },
              { key: "mapperVersion", label: "Mapper" },
              { key: "processingStatus", label: "Status" },
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <div className="flex gap-2">
                    <button type="button" className="text-blue-700 underline" onClick={() => inspect(r.id)}>
                      Inspect
                    </button>
                    <button type="button" className="text-blue-700 underline" onClick={() => replay(r.id)}>
                      Replay
                    </button>
                  </div>
                ),
              },
            ]}
            rows={payloads}
            emptyTitle="No raw payloads"
          />
          {detail ? (
            <pre className="mt-4 max-h-96 overflow-auto rounded border bg-white p-3 text-xs">
              {JSON.stringify(detail, null, 2)}
            </pre>
          ) : null}
        </>
      ) : null}

      {tab === "rules" && !loading ? (
        <DataTable
          columns={[
            { key: "network", label: "Network", render: (r) => displayText(r.network) },
            { key: "entity", label: "Entity", render: (r) => displayText(r.entity || r.resource) },
            { key: "rawField", label: "Raw field", render: (r) => displayText(r.rawField) },
            { key: "mboField", label: "MBO field", render: (r) => displayText(r.mboField) },
            { key: "status", label: "Status", render: (r) => displayText(r.status) },
            { key: "sourceFile", label: "Source", render: (r) => displayText(r.sourceFile || r.path) },
          ]}
          rows={rules}
          emptyTitle="No mapping rules discovered"
        />
      ) : null}
    </PageLayout>
  );
}
