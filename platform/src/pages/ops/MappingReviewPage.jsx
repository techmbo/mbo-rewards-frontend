import { useEffect, useMemo, useState } from "react";
import { fetchApi, postApi } from "../../api";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Input, Select } from "../../components/ui/FormControls";
import { LoadingState } from "../../components/ui/LoadingState";
import { formatDate } from "../helpers";
import { displayText } from "../../utils/display";

/**
 * Sync Review — mapping exceptions, raw payloads, reprocessing, and mapping rules.
 */
export function MappingReviewPage() {
  const [tab, setTab] = useState("exceptions");
  const [rows, setRows] = useState([]);
  const [payloads, setPayloads] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [mappingVersion, setMappingVersion] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [reprocessResult, setReprocessResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const versionOptions = useMemo(() => {
    const versions = new Set();
    for (const rule of rules) {
      if (rule.mappingVersion) versions.add(String(rule.mappingVersion));
    }
    return [{ value: "", label: "Latest / row default" }, ...Array.from(versions).map((v) => ({ value: v, label: v }))];
  }, [rules]);

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
    setReprocessResult(null);
  }

  async function replay(id, mode = "MAP_ONLY") {
    setBusy(true);
    try {
      const result = await postApi(`/ops/raw-payloads/${id}/replay`, {
        mappingVersion: mappingVersion || undefined,
        mode,
      });
      setReprocessResult(result.data);
      await load();
      await inspect(id);
    } catch (err) {
      setError(err.message || "Replay failed");
    } finally {
      setBusy(false);
    }
  }

  async function reprocessSelected() {
    if (!selectedIds.length) return;
    setBusy(true);
    setError(null);
    try {
      const result = await postApi("/ops/reprocess", {
        rawPayloadIds: selectedIds,
        mappingVersion: mappingVersion || undefined,
        rerunReconciliation: true,
        closeExceptions: true,
      });
      setReprocessResult(result.data);
      setSelectedIds([]);
      await load();
    } catch (err) {
      setError(err.message || "Reprocess failed");
    } finally {
      setBusy(false);
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <PageLayout
      title="Sync Review"
      subtitle="Fix mapping → new version → preserved raw → reprocess → compare → reconcile → close exception"
    >
      <div className="mb-4 flex flex-wrap gap-2">
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

      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Mapping version</label>
          <Select
            value={mappingVersion}
            onChange={(e) => setMappingVersion(e.target.value)}
            options={versionOptions}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Or version id</label>
          <Input
            placeholder="e.g. OPT-CONV-2"
            value={mappingVersion}
            onChange={(e) => setMappingVersion(e.target.value)}
          />
        </div>
        <button
          type="button"
          disabled={busy || selectedIds.length === 0}
          className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
          onClick={reprocessSelected}
        >
          {busy ? "Working…" : `Reprocess selected (${selectedIds.length})`}
        </button>
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
          <p className="mb-2 text-sm text-slate-600">
            Raw payloads are immutable. Reprocess replays preserved JSON through a mapping version without rewriting source evidence.
          </p>
          <DataTable
            columns={[
              {
                key: "select",
                label: "",
                render: (r) => (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(r.id)}
                    onChange={() => toggleSelect(r.id)}
                    aria-label={`Select ${r.externalId}`}
                  />
                ),
              },
              { key: "network", label: "Network", render: (r) => displayText(r.network || r.supplier) },
              { key: "sourceObject", label: "Source object", render: (r) => displayText(r.sourceObject || r.resourceKey) },
              { key: "externalId", label: "External ID" },
              { key: "mapperVersion", label: "Mapper version", render: (r) => displayText(r.mapperVersion) },
              { key: "payloadHash", label: "Hash", render: (r) => displayText(r.payloadHash).slice(0, 10) },
              { key: "processingStatus", label: "Status" },
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="text-blue-700 underline" onClick={() => inspect(r.id)}>
                      Inspect
                    </button>
                    <button type="button" className="text-blue-700 underline" onClick={() => replay(r.id, "MAP_ONLY")}>
                      Map only
                    </button>
                    <button type="button" className="text-blue-700 underline" onClick={() => replay(r.id, "FULL")}>
                      Full reprocess
                    </button>
                  </div>
                ),
              },
            ]}
            rows={payloads}
            emptyTitle="No raw payloads"
          />
          {detail ? (
            <div className="mt-4 space-y-3">
              <pre className="max-h-72 overflow-auto rounded border bg-white p-3 text-xs">
                {JSON.stringify(detail, null, 2)}
              </pre>
              {reprocessResult ? (
                <div className="rounded border border-slate-200 bg-white p-3 text-sm">
                  <p className="font-medium text-slate-900">Reprocess result</p>
                  {reprocessResult.items ? (
                    <pre className="mt-2 text-xs">{JSON.stringify(reprocessResult, null, 2)}</pre>
                  ) : (
                    <>
                      <p className={reprocessResult.ok ? "text-emerald-700" : "text-red-700"}>
                        {reprocessResult.ok ? "Success" : "Failed"} — {displayText(reprocessResult.mappingVersion)}
                      </p>
                      {reprocessResult.diff?.changes?.length ? (
                        <ul className="mt-2 list-disc pl-5 text-xs text-slate-700">
                          {reprocessResult.diff.changes.map((c) => (
                            <li key={c.field}>
                              {c.field}: {displayText(c.before)} → {displayText(c.after)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-xs text-slate-500">No canonical field changes detected.</p>
                      )}
                      {reprocessResult.closedExceptions?.length ? (
                        <p className="mt-2 text-xs text-emerald-700">
                          Closed {reprocessResult.closedExceptions.length} linked exception(s)
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}

      {tab === "rules" && !loading ? (
        <DataTable
          columns={[
            { key: "network", label: "Network", render: (r) => displayText(r.network) },
            { key: "entity", label: "Entity", render: (r) => displayText(r.entity || r.resource) },
            { key: "mappingVersion", label: "Version", render: (r) => displayText(r.mappingVersion) },
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
