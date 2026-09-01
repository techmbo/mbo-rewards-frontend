import { useCallback, useMemo, useState } from "react";
import { fetchApi, postApi } from "../../api";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { Drawer } from "../../components/ui/Drawer";
import { StatusPill } from "../../components/ui/StatusPill";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { displayDate, displayText, na } from "../../utils/display";
import { PERMISSIONS, hasAnyPermission } from "../../auth/permissions";

function DetailField({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800">{children ?? "—"}</dd>
    </div>
  );
}

function capTone(state) {
  if (state === "AVAILABLE") return "success";
  if (state === "PARTIAL") return "warning";
  if (state === "NOT_CONFIGURED") return "default";
  return "default";
}

function capLabel(state) {
  if (state === "AVAILABLE") return "Available";
  if (state === "PARTIAL") return "Partial";
  if (state === "NOT_CONFIGURED") return "Not configured";
  if (state === "UNAVAILABLE") return "Unavailable";
  return "—";
}

function CapabilityBadges({ capabilities }) {
  if (!capabilities) return "—";
  const entries = [
    ["campaigns", "Campaigns"],
    ["coupons", "Coupons"],
    ["tracking", "Tracking"],
    ["performance", "Performance"],
    ["conversions", "Conversions"],
    ["payments", "Payments"],
  ];
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([key, label]) => {
        const state = capabilities[key]?.state;
        if (!state || state === "UNAVAILABLE") {
          return (
            <span
              key={key}
              className="rounded bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400 line-through"
              title="Unavailable"
            >
              {label}
            </span>
          );
        }
        return (
          <Badge key={key} variant={capTone(state)} className="!rounded px-1.5 py-0.5 !text-[10px]">
            {label}
          </Badge>
        );
      })}
    </div>
  );
}

function relativeTime(iso) {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return displayDate(iso);
}

const EMPTY_FILTERS = {
  q: "",
  integrationStatus: "",
  connectionStatus: "",
  dataHealth: "",
  mappingStatus: "",
  capability: "",
};

/**
 * Networks — operational supplier integration control surface.
 */
export function SuppliersPage() {
  const { user } = useAuth();
  const canSync = hasAnyPermission(user, [PERMISSIONS.SYNC_TRIGGER]);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [tab, setTab] = useState("overview");
  const [syncState, setSyncState] = useState({ busy: false, message: "", error: "" });

  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v != null)),
    [filters],
  );

  const { data, loading, error, reload } = useApi("/suppliers", queryFilters);

  const refreshNetworksList = useCallback(
    () => reload({ skipCache: true, extraParams: { refresh: 1 }, forceLoading: true }),
    [reload],
  );
  const rows = useMemo(() => data?.data ?? [], [data]);
  const scheduler = data?.scheduler;
  const liveSync = data?.liveSync;

  const openDetail = useCallback(async (key) => {
    setDetailError("");
    setDetailLoading(true);
    setTab("overview");
    setSyncState({ busy: false, message: "", error: "" });
    try {
      const json = await fetchApi(`/suppliers/${encodeURIComponent(key)}`);
      setDetail(json.data ?? json);
    } catch (err) {
      setDetailError(err.message || "Failed to load network");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  async function triggerSync(platforms) {
    if (!canSync || !platforms?.length) return;
    setSyncState({ busy: true, message: "Starting sync…", error: "" });
    try {
      // Sync first configured platform for this network (e.g. optimise_sea).
      const platform = platforms[0];
      const res = await postApi(`/sync/${platform}`);
      setSyncState({
        busy: false,
        message: res.message || "Sync started. Refresh shortly for updated status.",
        error: "",
      });
      reload();
      refreshNetworksList().catch(() => {});
      if (detail?.key) openDetail(detail.key);
    } catch (err) {
      setSyncState({ busy: false, message: "", error: err.message || "Sync failed to start" });
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Network",
        minWidth: 160,
        render: (r) => (
          <div>
            <div className="font-medium text-slate-900">{displayText(r.name)}</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">{r.key}</div>
          </div>
        ),
      },
      {
        key: "integrationStatus",
        label: "Integration",
        minWidth: 110,
        render: (r) => <StatusPill status={r.integrationStatus} />,
      },
      {
        key: "campaigns",
        label: "Campaigns",
        minWidth: 90,
        render: (r) => (
          <div className="leading-tight">
            <div className="text-xs">{capLabel(r.capabilities?.campaigns?.state)}</div>
            <div className="tabular-nums text-[10px] text-slate-500">
              {r.metrics?.importedCampaigns != null ? `${r.metrics.importedCampaigns} imported` : "—"}
            </div>
          </div>
        ),
      },
      {
        key: "performance",
        label: "Performance",
        minWidth: 90,
        render: (r) => capLabel(r.capabilities?.performance?.state),
      },
      {
        key: "conversions",
        label: "Conversions",
        minWidth: 90,
        render: (r) => capLabel(r.capabilities?.conversions?.state),
        defaultHidden: true,
      },
      {
        key: "tracking",
        label: "Tracking",
        minWidth: 90,
        render: (r) => capLabel(r.capabilities?.tracking?.state),
      },
      {
        key: "coupons",
        label: "Coupons",
        minWidth: 80,
        render: (r) => capLabel(r.capabilities?.coupons?.state),
      },
      {
        key: "lastSuccessfulSync",
        label: "Last sync",
        minWidth: 110,
        render: (r) => (
          <div className="leading-tight">
            <div>{relativeTime(r.lastSuccessfulSync)}</div>
            <div className="text-[10px] text-slate-400">{displayDate(r.lastSuccessfulSync)}</div>
          </div>
        ),
      },
      {
        key: "orderPaymentSync",
        label: "Order / Payment sync",
        minWidth: 130,
        render: (r) => (
          <div className="text-[11px] leading-tight text-slate-600">
            <div>O: {displayDate(r.lastOrderSyncAt)}</div>
            <div>P: {displayDate(r.lastPaymentSyncAt)}</div>
          </div>
        ),
      },
      {
        key: "syncFrequency",
        label: "Frequency",
        minWidth: 80,
        render: (r) =>
          r.syncFrequencyMinutes != null ? `${r.syncFrequencyMinutes}m` : "—",
      },
      {
        key: "openErrors",
        label: "Errors",
        minWidth: 70,
        render: (r) => displayText(r.openErrors ?? r.metrics?.openMapperErrors),
      },
      {
        key: "dataHealth",
        label: "Data health",
        minWidth: 110,
        render: (r) => <StatusPill status={r.dataHealth} />,
      },
      {
        key: "capabilities",
        label: "Capabilities",
        minWidth: 200,
        defaultHidden: true,
        render: (r) => <CapabilityBadges capabilities={r.capabilities} />,
      },
      {
        key: "mapping",
        label: "Mapping",
        minWidth: 110,
        defaultHidden: true,
        render: (r) =>
          r.mapping?.status === "NEEDS_REVIEW" ? (
            <StatusPill status="NEEDS_REVIEW" label="Needs review" />
          ) : r.mapping?.status === "ERROR" ? (
            <StatusPill status="ERROR" />
          ) : (
            displayText(r.mapping?.status === "UNAVAILABLE" ? "Unavailable" : r.mapping?.status)
          ),
      },
      {
        key: "linked",
        label: "Linked",
        minWidth: 80,
        defaultHidden: true,
        render: (r) => na(r.metrics?.linkedCampaigns),
      },
      {
        key: "actions",
        label: "",
        minWidth: 70,
        render: (r) => (
          <button
            type="button"
            className="text-sm font-semibold text-brand-700 hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              openDetail(r.key);
            }}
          >
            View
          </button>
        ),
      },
    ],
    [openDetail],
  );

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "coverage", label: "Data coverage" },
    { id: "sync", label: "Sync health" },
    { id: "objects", label: "Source objects" },
    { id: "pipeline", label: "Pipeline" },
    { id: "mapping", label: "Mapping" },
  ];

  return (
    <PageLayout
      eyebrow="Integrations"
      title="Networks"
      subtitle="Affiliate network connections, sync health, and data coverage. Statuses reflect actual credentials and imported data — not seed rows alone."
    >
      {(liveSync?.status === "running" || scheduler?.enabled) && (
        <div className="mb-3 flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          {liveSync?.status === "running" ? (
            <span>
              Sync running{liveSync.jobName ? `: ${liveSync.jobName}` : ""}
              {liveSync.percentComplete != null ? ` (${liveSync.percentComplete}%)` : ""}
            </span>
          ) : (
            <span>Live sync: {liveSync?.status || "idle"}</span>
          )}
          {scheduler?.enabled ? (
            <span>
              Automatic sync every {scheduler.intervalMinutes ?? "—"} min
              {scheduler.lastAttemptAt ? ` · last attempt ${relativeTime(scheduler.lastAttemptAt)}` : ""}
            </span>
          ) : null}
        </div>
      )}

      <div className="sticky top-14 z-10 -mx-1 space-y-2 rounded-panel bg-surface-page/90 px-1 py-2 backdrop-blur">
        <FilterBar
          compact
          filters={[
            { type: "search", key: "q", label: "Search", placeholder: "Search networks…" },
            {
              key: "integrationStatus",
              label: "Status",
              options: [
                { value: "CONNECTED", label: "Connected" },
                { value: "SYNCED", label: "Synced" },
                { value: "PARTIAL", label: "Partial" },
                { value: "ERROR", label: "Error" },
                { value: "NOT_CONFIGURED", label: "Not configured" },
                { value: "PLANNED", label: "Planned" },
                { value: "SYNCING", label: "Syncing" },
              ],
            },
            {
              key: "connectionStatus",
              label: "Connection",
              options: [
                { value: "CONNECTED", label: "Connected" },
                { value: "NOT_CONFIGURED", label: "Not configured" },
                { value: "PLANNED", label: "Planned" },
              ],
            },
            {
              key: "dataHealth",
              label: "Data health",
              options: [
                { value: "HEALTHY", label: "Healthy" },
                { value: "PARTIAL", label: "Partial" },
                { value: "NEEDS_REVIEW", label: "Needs review" },
                { value: "ERROR", label: "Error" },
                { value: "NO_RECENT_DATA", label: "No recent data" },
                { value: "NOT_CONFIGURED", label: "Not configured" },
              ],
            },
            {
              key: "mappingStatus",
              label: "Mapping",
              options: [
                { value: "NEEDS_REVIEW", label: "Needs review" },
                { value: "ERROR", label: "Error" },
                { value: "UNAVAILABLE", label: "Unavailable" },
              ],
            },
            {
              key: "capability",
              label: "Capability",
              options: [
                { value: "campaigns", label: "Campaigns" },
                { value: "coupons", label: "Coupons" },
                { value: "tracking", label: "Tracking" },
                { value: "performance", label: "Performance" },
                { value: "conversions", label: "Conversions" },
                { value: "payments", label: "Payments" },
              ],
            },
          ]}
          values={filters}
          onChange={(key, value) => setFilters((p) => ({ ...p, [key]: value }))}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
      </div>

      <DataTable
        dense
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={refreshNetworksList}
        onRefresh={refreshNetworksList}
        onRowClick={(r) => openDetail(r.key)}
        emptyTitle="No networks found"
        emptyDescription="Registered affiliate networks appear here once the platform is seeded."
      />

      <Drawer
        open={Boolean(detail) || detailLoading || Boolean(detailError)}
        title={detail?.name || "Network"}
        width="max-w-2xl"
        onClose={() => {
          setDetail(null);
          setDetailError("");
        }}
      >
        {detailLoading ? <p className="text-sm text-slate-500">Loading network…</p> : null}
        {detailError ? <p className="text-sm text-rose-600">{detailError}</p> : null}
        {detail ? (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{detail.key}</p>
              <h3 className="text-lg font-semibold text-slate-900">{detail.name}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusPill status={detail.integrationStatus} />
                <StatusPill status={detail.connectionStatus} />
                <StatusPill status={detail.syncStatus} />
                <StatusPill status={detail.dataHealth} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {canSync && detail.manualSyncSupported && detail.credentialsConfigured ? (
                  <Button
                    size="sm"
                    disabled={syncState.busy}
                    onClick={() => {
                      if (window.confirm(`Start sync for ${detail.name}?`)) {
                        triggerSync(detail.syncPlatforms);
                      }
                    }}
                  >
                    {syncState.busy ? "Starting…" : "Sync now"}
                  </Button>
                ) : null}
                {!detail.credentialsConfigured ? (
                  <span className="text-xs text-slate-500">Connect credentials on Integrations to enable sync.</span>
                ) : null}
                {detail.credentialsConfigured && scheduler?.enabled ? (
                  <span className="text-xs text-slate-500">
                    Automatic sync every {scheduler.intervalMinutes ?? "—"} min
                  </span>
                ) : null}
              </div>
              {syncState.message ? <p className="mt-2 text-xs text-emerald-700">{syncState.message}</p> : null}
              {syncState.error ? <p className="mt-2 text-xs text-rose-600">{syncState.error}</p> : null}
            </div>

            <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    tab === t.id ? "bg-brand-50 text-brand-800" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "overview" ? (
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailField label="Integration">{displayText(detail.integrationStatus)}</DetailField>
                <DetailField label="Connection">{displayText(detail.connectionStatus)}</DetailField>
                <DetailField label="Sync">{displayText(detail.syncStatus)}</DetailField>
                <DetailField label="Data health">{displayText(detail.dataHealth)}</DetailField>
                <DetailField label="Last successful sync">
                  {detail.lastSuccessfulSync ? relativeTime(detail.lastSuccessfulSync) : "—"}
                </DetailField>
                <DetailField label="Last attempted sync">
                  {detail.lastAttemptedSync ? relativeTime(detail.lastAttemptedSync) : "—"}
                </DetailField>
                <DetailField label="Credentials">
                  {detail.credentialsConfigured ? "Configured" : "Not configured"}
                </DetailField>
                <DetailField label="Accounts">{na(detail.accountCount)}</DetailField>
                <div className="sm:col-span-2">
                  <DetailField label="Capabilities">
                    <CapabilityBadges capabilities={detail.capabilities} />
                  </DetailField>
                </div>
              </dl>
            ) : null}

            {tab === "coverage" ? (
              <div className="space-y-3">
                {[
                  ["campaigns", "Campaigns"],
                  ["brands", "Brands"],
                  ["coupons", "Coupons"],
                  ["tracking", "Tracking"],
                  ["conversions", "Conversions"],
                  ["performance", "Performance"],
                  ["orders", "Orders"],
                  ["payments", "Payments"],
                ].map(([key, label]) => {
                  const c = detail.coverage?.[key];
                  if (!c) return null;
                  return (
                    <div key={key} className="rounded-lg border border-slate-200 px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-800">{label}</span>
                        <StatusPill status={c.health || c.capabilityState} label={capLabel(c.capabilityState)} />
                      </div>
                      <div className="mt-1 grid gap-1 text-xs text-slate-600 sm:grid-cols-3">
                        <span>
                          Imported: {c.importedCount == null ? "—" : c.importedCount}
                        </span>
                        {key === "campaigns" ? (
                          <>
                            <span>Promoted: {c.promotedCount == null ? "—" : c.promotedCount}</span>
                            <span>Linked: {c.linkedCount == null ? "—" : c.linkedCount}</span>
                          </>
                        ) : (
                          <span>Last sync: {c.lastSyncedAt ? relativeTime(c.lastSyncedAt) : "—"}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <dl className="grid gap-3 sm:grid-cols-3">
                  <DetailField label="Imported campaigns">{na(detail.metrics?.importedCampaigns)}</DetailField>
                  <DetailField label="Linked campaigns">{na(detail.metrics?.linkedCampaigns)}</DetailField>
                  <DetailField label="Assignable">{na(detail.metrics?.assignableCampaigns)}</DetailField>
                </dl>
              </div>
            ) : null}

            {tab === "sync" ? (
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailField label="Last successful">
                  {displayDate(detail.syncHealth?.lastSuccessfulSync)}
                </DetailField>
                <DetailField label="Last failed">
                  {detail.syncHealth?.lastFailedSync
                    ? displayDate(detail.syncHealth.lastFailedSync)
                    : "—"}
                </DetailField>
                <DetailField label="Last job status">
                  {displayText(detail.syncHealth?.lastSyncJobStatus)}
                </DetailField>
                <DetailField label="Duration">
                  {detail.syncHealth?.durationMs != null
                    ? `${Math.round(detail.syncHealth.durationMs / 1000)}s`
                    : "Not available"}
                </DetailField>
                <DetailField label="Records processed">
                  {detail.syncHealth?.recordsProcessed == null
                    ? "Not available"
                    : detail.syncHealth.recordsProcessed}
                </DetailField>
                <DetailField label="Records created">
                  {detail.syncHealth?.recordsCreated == null
                    ? "Not available"
                    : detail.syncHealth.recordsCreated}
                </DetailField>
                <DetailField label="Records updated">
                  {detail.syncHealth?.recordsUpdated == null
                    ? "Not available"
                    : detail.syncHealth.recordsUpdated}
                </DetailField>
                <DetailField label="Error count">
                  {detail.syncHealth?.errorCount == null ? "—" : detail.syncHealth.errorCount}
                </DetailField>
                <div className="sm:col-span-2">
                  <DetailField label="Message">
                    {displayText(detail.syncHealth?.lastSyncMessage)}
                  </DetailField>
                </div>
                {(detail.accounts || []).length > 0 ? (
                  <div className="sm:col-span-2">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Connected accounts
                    </p>
                    <div className="space-y-2">
                      {detail.accounts.map((a) => (
                        <div
                          key={`${a.platform}-${a.accountLabel}`}
                          className="rounded border border-slate-100 px-3 py-2 text-xs text-slate-600"
                        >
                          <div className="font-medium text-slate-800">
                            {a.platform} · {a.accountLabel}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <StatusPill status={a.environment} />
                            <StatusPill status={a.credentialHealth} />
                          </div>
                          <div>
                            Catalog sync: {a.syncEnabled === false ? "Off" : "On"}
                            {" · "}
                            Finance sync: {a.financeSyncEnabled === false ? "Off" : "On"}
                          </div>
                          <div>
                            Credentials: {a.credentialsConfigured ? "Configured" : "Missing"}
                            {a.maskedApiKey ? ` (${a.maskedApiKey})` : ""}
                          </div>
                          <div>Last success: {relativeTime(a.lastSuccessfulSync)}</div>
                          {a.lastSyncError ? (
                            <div className="mt-1 text-red-600">{a.lastSyncError}</div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </dl>
            ) : null}

            {tab === "objects" ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Each source object is its own sync unit. Last run is for that object only — a conversions failure does not fail campaigns.
                </p>
                {(detail.sourceObjects || []).length === 0 ? (
                  <p className="text-sm text-slate-500">No source objects catalogued for this network.</p>
                ) : (
                  (detail.sourceObjects || []).map((obj) => (
                    <div key={`${obj.sourceObject}-${obj.endpoint}`} className="rounded-lg border border-slate-200 px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{obj.label}</div>
                          <div className="text-[11px] text-slate-500">{obj.endpoint}</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusPill
                            status={obj.live ? "LIVE" : "DECLARED"}
                            label={obj.live ? "Live fetch" : "Declared"}
                          />
                          {obj.lastRun ? (
                            <StatusPill status={obj.lastRun.status} />
                          ) : (
                            <span className="text-[11px] text-slate-400">No run yet</span>
                          )}
                        </div>
                      </div>
                      {obj.notes ? <p className="mt-1 text-xs text-slate-500">{obj.notes}</p> : null}
                      {obj.lastRun ? (
                        <div className="mt-1 grid gap-1 text-xs text-slate-600 sm:grid-cols-3">
                          <span>Run: {obj.lastRun.syncRunId ? `${obj.lastRun.syncRunId.slice(0, 8)}…` : "—"}</span>
                          <span>
                            Records: {obj.lastRun.recordCount == null ? "—" : obj.lastRun.recordCount}
                          </span>
                          <span>
                            {obj.lastRun.finishedAt
                              ? relativeTime(obj.lastRun.finishedAt)
                              : obj.lastRun.startedAt
                                ? relativeTime(obj.lastRun.startedAt)
                                : "—"}
                          </span>
                        </div>
                      ) : null}
                      {obj.lastRun?.errorMessage ? (
                        <div className="mt-1 text-xs text-red-600">{obj.lastRun.errorMessage}</div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {tab === "pipeline" ? (
              <ol className="space-y-2">
                {(detail.pipeline || []).map((step, idx) => (
                  <li key={step.stage} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 text-xs font-bold text-slate-400">{idx + 1}</span>
                    <div className="flex-1 rounded-lg border border-slate-200 px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium capitalize text-slate-800">
                          {String(step.stage).replaceAll("_", " ")}
                        </span>
                        <StatusPill status={step.status} />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : null}

            {tab === "mapping" ? (
              <div className="space-y-3">
                <DetailField label="Mapping status">
                  {detail.mapping?.status === "NEEDS_REVIEW"
                    ? "Needs review"
                    : detail.mapping?.status === "UNAVAILABLE"
                      ? "Mapping status unavailable"
                      : displayText(detail.mapping?.status)}
                </DetailField>
                {(detail.mapping?.issues || []).length > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {detail.mapping.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No mapping issues recorded.</p>
                )}
                {(detail.catalogNotes || []).length > 0 ? (
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Adapter notes
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-xs text-slate-600">
                      {detail.catalogNotes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </PageLayout>
  );
}
