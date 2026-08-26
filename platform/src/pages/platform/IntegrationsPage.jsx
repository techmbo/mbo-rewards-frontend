import { useEffect, useState } from "react";
import { deleteApi, fetchApi, postApi } from "../../api";
import { PageLayout } from "../../components/layout/PageLayout";

const OPTIMISE_AGENCY_IDS = {
  optimise_sea: "118",
  optimise_mena: "172",
  optimise_uk: "1",
};

function resolveOptimiseAgencyId(platformKey, optimiseAgencyIds) {
  const entered = optimiseAgencyIds[platformKey]?.trim();
  return entered || OPTIMISE_AGENCY_IDS[platformKey] || "";
}

const INTEGRATION_CONFIG = [
  {
    key: "boostiny",
    title: "Boostiny",
    subtitle: "Connect with your publisher API credentials.",
    placeholder: "Enter Boostiny API key",
  },
  {
    key: "optimise_sea",
    title: "Optimise SEA",
    subtitle: "Agency ID 118. Use the SEA service-account API key and your publisher Contact ID.",
    placeholder: "Enter Optimise SEA API key",
    agencyPlaceholder: "118",
  },
  {
    key: "optimise_mena",
    title: "Optimise MENA",
    subtitle: "Agency ID 172. Use the MENA service-account API key and your publisher Contact ID.",
    placeholder: "Enter Optimise MENA API key",
    agencyPlaceholder: "172",
  },
  {
    key: "optimise_uk",
    title: "Optimise UK",
    subtitle: "Agency ID 1. Use the UK service-account API key and your publisher Contact ID.",
    placeholder: "Enter Optimise UK API key",
    agencyPlaceholder: "1",
  },
  {
    key: "trackier",
    title: "Trackier / vCommission",
    subtitle: "Connect with your Trackier Publisher API key (X-Api-Key).",
    placeholder: "Enter Trackier Publisher API key",
  },
  {
    key: "partnerize",
    title: "Partnerize",
    subtitle:
      "HTTP Basic Auth needs both keys, plus your Publisher ID from Partnerize Partner settings (console URL /publisher/{id}).",
    placeholder: "Enter Partnerize User API Key",
    applicationKeyPlaceholder: "Enter Partnerize User Application Key",
  },
  {
    key: "impact",
    title: "Impact",
    subtitle: "Connect with Impact MediaPartner Account SID + Auth Token (stored encrypted).",
    placeholder: "Enter Impact Auth Token",
  },
];

function formatSyncCounts(result) {
  if (!result || typeof result !== "object") return "";

  const parts = [];
  const add = (label, value) => {
    if (typeof value === "number" && value > 0) parts.push(`${value} ${label}`);
  };

  add("campaigns", result.campaigns);
  add("performance rows", result.reporting ?? result.performanceRows);
  add("conversions", result.conversions);
  add("payments", result.payments);
  add("invoices", result.invoices);
  add("coupons", result.vouchers ?? result.coupons);
  add("deals", result.deals);
  add("links", result.linkPerformance);

  if (parts.length === 0) return "No new records were imported.";
  return `Imported ${parts.join(", ")}.`;
}

function findSyncResultNode(result, accountLabel) {
  const cleanLabel = accountLabel?.replace(/^\[|\]$/g, "").trim();
  if (!result || typeof result !== "object") return null;

  if (
    typeof result.campaigns === "number" ||
    result.skipped === true ||
    result.partialSuccess !== undefined
  ) {
    return result;
  }

  if (cleanLabel && result[cleanLabel]) {
    return findSyncResultNode(result[cleanLabel], null);
  }

  for (const value of Object.values(result)) {
    const found = findSyncResultNode(value, cleanLabel);
    if (found) return found;
  }

  return null;
}

function describeSyncOutcome(statusResponse, label) {
  const result = statusResponse?.result || {};
  const regionResult = findSyncResultNode(result, label) || result;
  const summary = formatSyncCounts(regionResult);
  const prefix = label ? `Sync finished for ${label}.` : "Sync finished.";
  const warning = regionResult?.warning || regionResult?.reason || "";
  const base = summary ? `${prefix} ${summary}` : prefix;
  return warning ? `${base} ${warning}` : base;
}

export function IntegrationsPage() {
  const [credentials, setCredentials] = useState({});
  const [partnerizeApplicationKeys, setPartnerizeApplicationKeys] = useState({});
  const [partnerizeUserApiKeys, setPartnerizeUserApiKeys] = useState({});
  const [partnerizePublisherIds, setPartnerizePublisherIds] = useState({});
  const [optimiseAgencyIds, setOptimiseAgencyIds] = useState({});
  const [optimiseContactIds, setOptimiseContactIds] = useState({});
  const [accountLabels, setAccountLabels] = useState({});
  const [connections, setConnections] = useState({});
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingAccountKey, setSyncingAccountKey] = useState(null);
  const [disconnectingAccountKey, setDisconnectingAccountKey] = useState(null);
  const [connectingPlatformKey, setConnectingPlatformKey] = useState(null);

  async function loadConnections() {
    const response = await fetchApi("/marketplace/accounts");
    setConnections(response?.result || {});
  }

  useEffect(() => {
    let active = true;
    async function initConnections() {
      try {
        await loadConnections();
      } catch {
        if (!active) return;
        setConnections({});
      }
    }
    initConnections();
    return () => {
      active = false;
    };
  }, []);

  function accountActionKey(platformKey, accountLabel) {
    return `${platformKey}:${accountLabel}`;
  }

  async function connectPlatform(platformKey) {
    const isOptimise = platformKey.startsWith("optimise_");
    const isPartnerize = platformKey === "partnerize";
    const apiKey = credentials[platformKey]?.trim();
    const applicationKey = partnerizeApplicationKeys[platformKey]?.trim() || "";
    const userApiKey = partnerizeUserApiKeys[platformKey]?.trim() || "";
    const publisherId = partnerizePublisherIds[platformKey]?.trim() || "";

    if (isPartnerize && (!applicationKey || !userApiKey)) {
      setSyncError("Please enter both the Partnerize User Application Key and User API Key.");
      return;
    }
    if (isPartnerize && !publisherId) {
      setSyncError(
        "Please enter your Partnerize Publisher ID from Partner settings (console URL contains /publisher/{id}).",
      );
      return;
    }

    if (!isPartnerize && !apiKey) {
      setSyncError("Please enter an API key.");
      return;
    }

    const agencyId = isOptimise ? resolveOptimiseAgencyId(platformKey, optimiseAgencyIds) : "";
    const contactId = isOptimise ? optimiseContactIds[platformKey]?.trim() : "";
    const accountLabel = accountLabels[platformKey]?.trim() || "default";

    if (isOptimise && !contactId) {
      setSyncError("Please enter your Optimise Contact ID.");
      return;
    }

    if (isOptimise && !agencyId) {
      setSyncError("Please enter the Optimise Agency ID for this region.");
      return;
    }

    setConnectingPlatformKey(platformKey);
    setSyncError("");
    setSyncMessage("");

    try {
      await postApi(`/marketplace/accounts/${platformKey}/connect`, {
        accountLabel,
        ...(isPartnerize
          ? { applicationKey, userApiKey, publisherId: publisherId || undefined }
          : { apiKey }),
        ...(isOptimise ? { agencyId, contactId } : {}),
      });
      setSyncMessage(
        `Connected ${platformKey} as [${accountLabel}]. You can now run Sync for this account.`,
      );
      setSyncError("");
      await loadConnections();
      setCredentials((prev) => ({ ...prev, [platformKey]: "" }));
      setAccountLabels((prev) => ({ ...prev, [platformKey]: "" }));
      if (isPartnerize) {
        setPartnerizeApplicationKeys((prev) => ({ ...prev, [platformKey]: "" }));
        setPartnerizeUserApiKeys((prev) => ({ ...prev, [platformKey]: "" }));
        setPartnerizePublisherIds((prev) => ({ ...prev, [platformKey]: "" }));
      }
      if (isOptimise) {
        setOptimiseAgencyIds((prev) => ({ ...prev, [platformKey]: "" }));
        setOptimiseContactIds((prev) => ({ ...prev, [platformKey]: "" }));
      }
    } catch (error) {
      setSyncError(error.message || "Connection failed. Please check your details and try again.");
    } finally {
      setConnectingPlatformKey(null);
    }
  }

  async function waitForSyncCompletion(label) {
    const maxAttempts = 200;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const statusResponse = await fetchApi("/sync/status");
      const status = statusResponse?.status;

      if (status === "running") {
        const pct = statusResponse?.percentComplete;
        const stage = statusResponse?.currentStage;
        const progressBits = [];
        if (typeof pct === "number") progressBits.push(`${pct}%`);
        if (stage) progressBits.push(stage);
        const progressSuffix = progressBits.length ? ` (${progressBits.join(" · ")})` : "";
        setSyncMessage(
          label
            ? `Syncing ${label}...${progressSuffix}`
            : `Sync in progress...${progressSuffix}`,
        );
        continue;
      }

      if (status === "success") {
        setSyncMessage(describeSyncOutcome(statusResponse, label));
        setSyncError("");
        return;
      }

      if (status === "partial") {
        setSyncMessage(describeSyncOutcome(statusResponse, label));
        setSyncError(statusResponse?.warning || "Some data could not be imported.");
        return;
      }

      if (status === "failed") {
        throw new Error(statusResponse?.error || "Sync failed. Please check your connection details.");
      }

      if (status === "idle") {
        return;
      }
    }

    throw new Error("Sync timed out while waiting for completion. Check backend logs for details.");
  }

  async function runSync() {
    setIsSyncing(true);
    setSyncError("");
    setSyncMessage("Starting full sync...");
    try {
      const response = await postApi("/sync/all");
      if (response?.status === "running") {
        if (response?.message && /already in progress/i.test(response.message)) {
          setSyncMessage("A sync is already running — waiting for it to finish...");
        }
        await waitForSyncCompletion();
        return;
      }
      setSyncMessage(describeSyncOutcome(response, null));
    } catch (error) {
      setSyncError(error.message || "Sync failed");
    } finally {
      setIsSyncing(false);
    }
  }

  async function syncAccount(platformKey, accountLabel) {
    const actionKey = accountActionKey(platformKey, accountLabel);
    setSyncingAccountKey(actionKey);
    setSyncError("");
    setSyncMessage("");
    try {
      const response = await postApi(`/sync/${platformKey}/${encodeURIComponent(accountLabel)}`);
      if (response?.status === "running") {
        if (response?.message && /already in progress/i.test(response.message)) {
          setSyncMessage("A sync is already running — waiting for it to finish...");
        }
        await waitForSyncCompletion(`[${accountLabel}]`);
        return;
      }
      setSyncMessage(describeSyncOutcome(response, `[${accountLabel}]`));
    } catch (error) {
      setSyncError(error.message || "Sync failed");
    } finally {
      setSyncingAccountKey(null);
    }
  }

  async function disconnectAccount(platformKey, accountLabel) {
    const actionKey = accountActionKey(platformKey, accountLabel);
    setDisconnectingAccountKey(actionKey);
    setSyncError("");
    setSyncMessage("");
    try {
      await deleteApi(`/marketplace/accounts/${platformKey}/${encodeURIComponent(accountLabel)}`);
      await loadConnections();
      setSyncMessage(`Disconnected [${accountLabel}] from ${platformKey}.`);
    } catch (error) {
      setSyncError(error.message || "Disconnect failed");
    } finally {
      setDisconnectingAccountKey(null);
    }
  }

  const syncAction = (
    <button
      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      disabled={isSyncing}
      onClick={runSync}
      type="button"
    >
      {isSyncing ? "Syncing..." : "Run Full Sync"}
    </button>
  );

  return (
    <PageLayout
      title="Integrations"
      subtitle="Connect and sync affiliate network accounts. Auto-fetch runs on a schedule; manual sync refreshes campaigns/coupons."
      actions={syncAction}
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          {INTEGRATION_CONFIG.map((platform) => {
            const statusList = connections[platform.key] || [];
            const latestStatus = statusList[0];
            const isOptimise = platform.key.startsWith("optimise_");
            const isPartnerize = platform.key === "partnerize";
            const apiKey = credentials[platform.key] || "";
            const applicationKey = partnerizeApplicationKeys[platform.key] || "";
            const userApiKey = partnerizeUserApiKeys[platform.key] || "";
            const publisherId = partnerizePublisherIds[platform.key] || "";
            const agencyId = isOptimise ? resolveOptimiseAgencyId(platform.key, optimiseAgencyIds) : "";
            const contactId = optimiseContactIds[platform.key] || "";
            const canConnect = isPartnerize
              ? Boolean(applicationKey.trim() && userApiKey.trim() && publisherId.trim())
              : Boolean(apiKey.trim()) && (!isOptimise || (agencyId && contactId.trim()));
            const isConnecting = connectingPlatformKey === platform.key;

            return (
              <article key={platform.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{platform.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{platform.subtitle}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      latestStatus?.connected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {latestStatus?.connected ? `${statusList.length} connected` : "Not connected"}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Account Label</span>
                    <input
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="default / client_a / client_b"
                      value={accountLabels[platform.key] || ""}
                      onChange={(e) =>
                        setAccountLabels((prev) => ({
                          ...prev,
                          [platform.key]: e.target.value,
                        }))
                      }
                    />
                  </label>
                  {isPartnerize ? (
                    <>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">
                          User Application Key
                        </span>
                        <input
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder={platform.applicationKeyPlaceholder}
                          type="password"
                          autoComplete="off"
                          value={applicationKey}
                          onChange={(e) =>
                            setPartnerizeApplicationKeys((prev) => ({
                              ...prev,
                              [platform.key]: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">
                          User API Key
                        </span>
                        <input
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder={platform.placeholder}
                          type="password"
                          autoComplete="off"
                          value={userApiKey}
                          onChange={(e) =>
                            setPartnerizeUserApiKeys((prev) => ({
                              ...prev,
                              [platform.key]: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">
                          Publisher ID
                        </span>
                        <input
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="e.g. 1l1007802 from Partner settings"
                          autoComplete="off"
                          value={publisherId}
                          onChange={(e) =>
                            setPartnerizePublisherIds((prev) => ({
                              ...prev,
                              [platform.key]: e.target.value,
                            }))
                          }
                        />
                      </label>
                    </>
                  ) : (
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-slate-700">API Key</span>
                      <input
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder={platform.placeholder}
                        type="password"
                        value={credentials[platform.key] || ""}
                        onChange={(e) =>
                          setCredentials((prev) => ({
                            ...prev,
                            [platform.key]: e.target.value,
                          }))
                        }
                      />
                    </label>
                  )}

                  {isOptimise && (
                    <>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Agency ID</span>
                        <input
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder={platform.agencyPlaceholder || "Enter Optimise agency ID"}
                          value={resolveOptimiseAgencyId(platform.key, optimiseAgencyIds)}
                          onChange={(e) =>
                            setOptimiseAgencyIds((prev) => ({
                              ...prev,
                              [platform.key]: e.target.value,
                            }))
                          }
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Contact ID</span>
                        <input
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Enter Optimise contact ID"
                          value={optimiseContactIds[platform.key] || ""}
                          onChange={(e) =>
                            setOptimiseContactIds((prev) => ({
                              ...prev,
                              [platform.key]: e.target.value,
                            }))
                          }
                        />
                      </label>
                    </>
                  )}

                  <button
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
                    disabled={!canConnect || isConnecting}
                    onClick={() => connectPlatform(platform.key)}
                  >
                    {isConnecting ? "Connecting..." : "Connect Account"}
                  </button>

                  {statusList.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">Connected accounts</p>
                      {statusList.map((status) => {
                        const actionKey = accountActionKey(platform.key, status.accountLabel);
                        const isAccountSyncing = syncingAccountKey === actionKey;
                        const isDisconnecting = disconnectingAccountKey === actionKey;

                        return (
                          <div
                            key={`${platform.key}-${status.accountLabel}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                          >
                            <p className="text-xs text-slate-600">
                              [{status.accountLabel}] key: {status.maskedKey || "oauth"} on{" "}
                              {new Date(status.connectedAt).toLocaleString()}
                            </p>
                            <div className="flex gap-2">
                              <button
                                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                                disabled={isAccountSyncing || isDisconnecting || isSyncing}
                                onClick={() => syncAccount(platform.key, status.accountLabel)}
                              >
                                {isAccountSyncing ? "Syncing..." : "Sync"}
                              </button>
                              <button
                                className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                                disabled={isAccountSyncing || isDisconnecting || isSyncing}
                                onClick={() => disconnectAccount(platform.key, status.accountLabel)}
                              >
                                {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {syncMessage && (
          <p className="whitespace-pre-line rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
            {syncMessage}
          </p>
        )}
        {syncError && (
          <p className="whitespace-pre-line rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            {syncError}
          </p>
        )}
      </div>
    </PageLayout>
  );
}
