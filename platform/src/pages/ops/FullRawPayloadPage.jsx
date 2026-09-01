import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchApi } from "../../api";
import { PageLayout } from "../../components/layout/PageLayout";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/FormControls";
import { LoadingState } from "../../components/ui/LoadingState";
import { displayText } from "../../utils/display";
import { NETWORK_SOURCE_OPTIONS } from "./networkFieldCatalog";

const SAMPLE_TEMPLATES = {
  "Impact Action": {
    Id: "ACT-8892",
    CampaignId: "CMP-44",
    State: "APPROVED",
    Amount: "7500.00",
    Currency: "INR",
    Payout: "600.00",
    EventDate: "2026-08-18T10:30:00+05:30",
    SubId1: "mbo_click_203",
  },
  "Partnerize Campaign": {
    campaign_id: "101116400",
    title: "Sample Partnerize Campaign",
    status: "a",
    destination_url: "https://example.com",
    allow_deep_linking: "y",
    default_commission_rate: 7,
    default_currency: "EUR",
    conversion_type: "sale",
  },
  "Optimise Campaign": {
    productId: "12345",
    name: "Sample Optimise Campaign",
    status: "live",
    commissionCost: 8,
    currencyCode: "USD",
    publishers: [{ campaignSubStatus: "live" }],
  },
};

/**
 * Network Operations — Full Raw Payload (immutable source evidence viewer).
 */
export function FullRawPayloadPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payloads, setPayloads] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get("id") || "");
  const [detail, setDetail] = useState(null);
  const [template, setTemplate] = useState("Impact Action");
  const [jsonText, setJsonText] = useState(JSON.stringify(SAMPLE_TEMPLATES["Impact Action"], null, 2));
  const [parseError, setParseError] = useState("");
  const [detectedKeys, setDetectedKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [network, setNetwork] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi("/ops/raw-payloads", {
          pageSize: 50,
          ...(network ? { supplier: network } : {}),
        });
        const rows = res.data?.rows || res.rows || res.data || [];
        setPayloads(Array.isArray(rows) ? rows : []);
      } catch (err) {
        setError(err.message || "Failed to load raw payloads");
      } finally {
        setLoading(false);
      }
    })();
  }, [network]);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) setSelectedId(id);
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    (async () => {
      try {
        const json = await fetchApi(`/ops/raw-payloads/${selectedId}`);
        setDetail(json.data ?? json);
        const body = json.data?.payload ?? json.data?.rawPayload ?? json.data?.body ?? json.data;
        if (body && typeof body === "object") {
          setJsonText(JSON.stringify(body, null, 2));
          setDetectedKeys(Object.keys(body));
          setParseError("");
        }
      } catch (err) {
        setError(err.message || "Failed to load payload");
      }
    })();
  }, [selectedId]);

  const payloadOptions = useMemo(
    () => [
      { value: "", label: "Imported payloads…" },
      ...payloads.map((p) => ({
        value: p.id,
        label: `${p.supplier || "?"} · ${p.resourceKey || "payload"} · ${p.externalId || p.id}`,
      })),
    ],
    [payloads],
  );

  function applyTemplate(name) {
    setTemplate(name);
    const sample = SAMPLE_TEMPLATES[name];
    setJsonText(JSON.stringify(sample, null, 2));
    setDetectedKeys(Object.keys(sample));
    setParseError("");
    setSelectedId("");
    setSearchParams({});
  }

  function importTestJson() {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        setParseError("JSON must be a single object payload.");
        return;
      }
      setDetectedKeys(Object.keys(parsed));
      setParseError("");
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch (err) {
      setParseError(err.message || "Invalid JSON");
    }
  }

  return (
    <PageLayout
      title="Full Raw Payload"
      subtitle="Immutable source evidence. Import a JSON payload to test schema detection without changing the MBO standard."
      actions={
        <Badge variant="info" className="font-mono text-[10px] tracking-wide">
          v13 · CAMPAIGN ACTUAL DATA + CUSTOM VIEWS
        </Badge>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          className="min-w-[180px]"
          value={template}
          options={Object.keys(SAMPLE_TEMPLATES).map((k) => ({ value: k, label: k }))}
          onChange={(e) => applyTemplate(e.target.value)}
        />
        <Select
          className="min-w-[160px]"
          value={network}
          options={NETWORK_SOURCE_OPTIONS}
          onChange={(e) => setNetwork(e.target.value)}
        />
        <Select
          className="min-w-[260px]"
          value={selectedId}
          options={payloadOptions}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedId(id);
            if (id) setSearchParams({ id });
            else setSearchParams({});
          }}
        />
        <Button variant="secondary" onClick={importTestJson}>
          Import Test JSON
        </Button>
      </div>

      {loading ? <LoadingState label="Loading raw payloads…" /> : null}
      {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
      {parseError ? <p className="mb-3 text-sm text-rose-600">{parseError}</p> : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3 text-xs text-slate-500">
          {detail ? (
            <div className="space-y-1">
              <div>
                Network: {displayText(detail.network || detail.networkSource)} · Account:{" "}
                {displayText(detail.networkAccountId)} · Object: {displayText(detail.sourceObject)} ·
                Endpoint: {displayText(detail.endpointOrReport)}
              </div>
              <div>
                Raw payload: {displayText(detail.rawPayloadId || detail.id)} · Sync run:{" "}
                {displayText(detail.syncRunId)} · Fetched: {displayText(detail.fetchedAt)} · HTTP:{" "}
                {detail.httpStatus ?? "—"} · Hash: {displayText(detail.payloadHash)?.slice?.(0, 12) || displayText(detail.payloadHash)}
              </div>
              <div>
                Body: {displayText(detail.bodyKind)}
                {detail.bodyRef ? ` · Ref: ${detail.bodyRef}` : ""} · API version:{" "}
                {displayText(detail.apiVersion)} · Immutable source evidence
              </div>
            </div>
          ) : (
            "Local test / template payload — not written to the database"
          )}
        </div>
        <div className="bg-slate-950 p-4">
          <textarea
            value={jsonText}
            onChange={(e) => {
              if (selectedId) return;
              setJsonText(e.target.value);
            }}
            readOnly={Boolean(selectedId)}
            spellCheck={false}
            className="h-[420px] w-full resize-y bg-transparent font-mono text-sm leading-relaxed text-emerald-300 outline-none"
          />
        </div>
        {detectedKeys.length ? (
          <div className="border-t border-slate-100 px-4 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Detected source fields ({detectedKeys.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {detectedKeys.map((k) => (
                <Badge key={k} variant="default" className="font-mono text-[10px]">
                  {k}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
}
