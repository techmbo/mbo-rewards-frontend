import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchApi, patchApi, postApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { ClientModuleShell } from "./ClientModuleShell";
import { ApiKeyReveal } from "./ApiKeyReveal";
import { deliveryChannelRequirements } from "./deliveryHelpers";

function unwrap(res) {
  return res?.data ?? res;
}

const DEFAULT_ENV = {
  status: "ACTIVE",
  campaignEndpoint: true,
  productEndpoint: true,
  reportingEndpoint: true,
};

function envBlock(config, environment) {
  const raw = config?.[environment] || {};
  return {
    status: raw.status === "DISABLED" ? "DISABLED" : "ACTIVE",
    campaignEndpoint: raw.campaignEndpoint !== false,
    productEndpoint: raw.productEndpoint !== false,
    reportingEndpoint: raw.reportingEndpoint !== false,
  };
}

function EnvPanel({
  title,
  description,
  environment,
  keys,
  config,
  canManage,
  busy,
  editing,
  draft,
  onEdit,
  onCancel,
  onSave,
  onDraftChange,
  onIssue,
  onRevoke,
  revealed,
}) {
  const active = keys.find((k) => k.isActive !== false && !k.revokedAt);
  const view = editing ? draft : config;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill
            status={view.status === "ACTIVE" ? "ACTIVE" : "PENDING"}
            label={view.status === "ACTIVE" ? "Active" : "Disabled"}
          />
          {canManage && !editing ? (
            <Button type="button" className="text-xs" onClick={onEdit}>
              Edit
            </Button>
          ) : null}
        </div>
      </div>

      {revealed?.environment === environment && revealed?.apiKey ? (
        <div className="mt-3">
          <ApiKeyReveal apiKey={revealed.apiKey} warning={revealed.warning} />
        </div>
      ) : null}

      <div className="mt-4 space-y-2 text-xs">
        {[
          ["Environment status", "status", "select-status"],
          ["API key", null, "key"],
          ["Campaign endpoint", "campaignEndpoint", "toggle"],
          ["Product endpoint", "productEndpoint", "toggle"],
          ["Reporting endpoint", "reportingEndpoint", "toggle"],
          [
            "Data mode",
            null,
            "text",
            environment === "SANDBOX" ? "Test / sample data" : "Live published assignments",
          ],
        ].map(([label, field, kind, text]) => (
          <div key={label} className="grid grid-cols-[150px_1fr] gap-2 border-b border-slate-100 py-2">
            <span className="text-slate-500">{label}</span>
            {kind === "key" ? (
              <span className="font-mono text-slate-600">
                {active?.keyPrefix ? `${active.keyPrefix}…` : "—"}
              </span>
            ) : kind === "text" ? (
              <span>{text}</span>
            ) : editing && field ? (
              kind === "select-status" ? (
                <Select
                  value={draft.status}
                  onChange={(e) => onDraftChange({ status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DISABLED">Disabled</option>
                </Select>
              ) : (
                <Select
                  value={draft[field] ? "Enabled" : "Disabled"}
                  onChange={(e) => onDraftChange({ [field]: e.target.value === "Enabled" })}
                >
                  <option>Enabled</option>
                  <option>Disabled</option>
                </Select>
              )
            ) : (
              <span className="font-medium">
                {field === "status"
                  ? view.status === "ACTIVE"
                    ? "Active"
                    : "Disabled"
                  : view[field]
                    ? "Enabled"
                    : "Disabled"}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        {editing ? (
          <>
            <Button type="button" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={onSave} disabled={busy}>
              Save {environment === "SANDBOX" ? "Sandbox" : "Production"}
            </Button>
          </>
        ) : canManage ? (
          !active ? (
            <Button type="button" variant="primary" disabled={busy} onClick={() => onIssue(environment)}>
              Generate {environment === "SANDBOX" ? "Sandbox" : "Production"} key
            </Button>
          ) : (
            <Button type="button" disabled={busy} onClick={() => onRevoke(active.id)}>
              Revoke key
            </Button>
          )
        ) : null}
      </div>
    </section>
  );
}

/**
 * Client Workspace → API — Sandbox and Production environments + endpoint toggles.
 */
export function ClientApiPage() {
  const { clientId } = useParams();
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.CLIENTS_MANAGE);

  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [revealed, setRevealed] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(DEFAULT_ENV);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi(`/clients/${clientId}/onboarding`);
      setOnboarding(unwrap(res));
    } catch (err) {
      setError(err?.message || "Unable to load API configuration.");
      setOnboarding(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (clientId) load();
  }, [clientId]);

  const client = onboarding?.client;
  const { needsApi } = deliveryChannelRequirements(client?.deliveryMethod);
  const apiKeys = onboarding?.apiKeys || [];
  const sandboxKeys = apiKeys.filter((k) => k.environment === "SANDBOX");
  const productionKeys = apiKeys.filter((k) => !k.environment || k.environment === "PRODUCTION");
  const sandboxConfig = envBlock(client?.apiEnvironmentConfig, "SANDBOX");
  const productionConfig = envBlock(client?.apiEnvironmentConfig, "PRODUCTION");

  async function issue(environment) {
    if (!canManage) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await postApi(`/clients/${clientId}/api-keys`, {
        name: environment === "SANDBOX" ? "Sandbox" : "Production",
        environment,
      });
      const data = unwrap(res);
      setRevealed({
        environment,
        apiKey: data?.apiKey || null,
        warning: data?.warning,
      });
      setMessage("API key created. Copy it now — it will not be shown again.");
      await load();
    } catch (err) {
      setMessage(err?.message || "API key creation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(credentialId) {
    if (!canManage) return;
    setBusy(true);
    setMessage("");
    try {
      await postApi(`/clients/${clientId}/api-keys/${credentialId}/revoke`, {});
      setRevealed(null);
      setMessage("API key revoked.");
      await load();
    } catch (err) {
      setMessage(err?.message || "Revoke failed.");
    } finally {
      setBusy(false);
    }
  }

  async function saveEnv(environment) {
    if (!canManage) return;
    setBusy(true);
    setMessage("");
    try {
      await patchApi(`/clients/${clientId}`, {
        apiEnvironmentConfig: {
          [environment]: draft,
        },
      });
      setEditing(null);
      setMessage(`${environment === "SANDBOX" ? "Sandbox" : "Production"} configuration saved.`);
      await load();
    } catch (err) {
      setMessage(err?.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <ClientModuleShell client={null} active="api" title="API Configuration" subtitle="Loading…">
        <p className="text-sm text-slate-500">Loading…</p>
      </ClientModuleShell>
    );
  }

  if (error || !client) {
    return (
      <ClientModuleShell client={null} active="api" title="API Configuration" subtitle="Unable to load">
        <p className="text-sm text-rose-600">{error || "Client not found."}</p>
      </ClientModuleShell>
    );
  }

  return (
    <ClientModuleShell
      client={client}
      active="api"
      title="API Configuration"
      subtitle="Sandbox and Production are separate environments with separate credentials and endpoint toggles."
    >
      {message ? (
        <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {message}
        </p>
      ) : null}

      {!needsApi ? (
        <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-xs text-amber-950">
          Delivery mode is Portal Only. API keys are optional and not required for activation.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <EnvPanel
          title="Sandbox environment"
          description="Testing environment. Credentials are never reused in Production."
          environment="SANDBOX"
          keys={sandboxKeys}
          config={sandboxConfig}
          canManage={canManage}
          busy={busy}
          editing={editing === "SANDBOX"}
          draft={draft}
          onEdit={() => {
            setEditing("SANDBOX");
            setDraft(sandboxConfig);
          }}
          onCancel={() => setEditing(null)}
          onSave={() => saveEnv("SANDBOX")}
          onDraftChange={(patch) => setDraft((p) => ({ ...p, ...patch }))}
          onIssue={issue}
          onRevoke={revoke}
          revealed={revealed}
        />
        <EnvPanel
          title="Production environment"
          description="Live environment. Only published client-safe campaign data is delivered."
          environment="PRODUCTION"
          keys={productionKeys}
          config={productionConfig}
          canManage={canManage}
          busy={busy}
          editing={editing === "PRODUCTION"}
          draft={draft}
          onEdit={() => {
            setEditing("PRODUCTION");
            setDraft(productionConfig);
          }}
          onCancel={() => setEditing(null)}
          onSave={() => saveEnv("PRODUCTION")}
          onDraftChange={(patch) => setDraft((p) => ({ ...p, ...patch }))}
          onIssue={issue}
          onRevoke={revoke}
          revealed={revealed}
        />
      </div>
    </ClientModuleShell>
  );
}
