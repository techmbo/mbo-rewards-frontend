import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchApi } from "../../api";
import { StatusPill } from "../../components/ui/StatusPill";
import { ClientModuleShell } from "./ClientModuleShell";
import { commercialDisplayLabel } from "./assignmentLifecycle";
import { deliveryMethodLabel } from "./deliveryHelpers";

function unwrap(res) {
  return res?.data ?? res;
}

/**
 * Client Workspace Overview — account summary and readiness shortcuts.
 */
export function ClientOverviewPage() {
  const { clientId } = useParams();
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchApi(`/clients/${clientId}/onboarding`);
        if (!cancelled) setOnboarding(unwrap(res));
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Unable to load client.");
          setOnboarding(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const client = onboarding?.client;
  const checklist = onboarding?.checklist || {};
  const assignments = onboarding?.assignments || [];
  const published = assignments.filter((a) => a.published).length;
  const portalUsers = onboarding?.portalUsers || [];
  const apiKeys = (onboarding?.apiKeys || []).filter((k) => k.isActive !== false && !k.revokedAt);
  const sandboxKey = apiKeys.find((k) => k.environment === "SANDBOX");
  const productionKey = apiKeys.find((k) => !k.environment || k.environment === "PRODUCTION");

  if (loading) {
    return (
      <ClientModuleShell client={null} active="overview" title="Client Workspace" subtitle="Loading…">
        <p className="text-sm text-slate-500">Loading workspace…</p>
      </ClientModuleShell>
    );
  }

  if (error || !client) {
    return (
      <ClientModuleShell client={null} active="overview" title="Client Workspace" subtitle="Unable to load">
        <p className="text-sm text-rose-600">{error || "Client not found."}</p>
      </ClientModuleShell>
    );
  }

  return (
    <ClientModuleShell
      client={client}
      active="overview"
      title="Client Workspace"
      subtitle="Admin-side view of one client. This is not the client portal."
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Assigned campaigns", String(assignments.length)],
          ["Published / active", String(published)],
          ["Portal users", String(portalUsers.length)],
          ["Sandbox API", sandboxKey ? "Active" : "Not created"],
          ["Production API", productionKey ? "Active" : "Not created"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
            <strong className="mt-1 block text-xl text-slate-900">{value}</strong>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Account summary</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">Client ID</dt>
              <dd className="font-mono text-xs text-slate-700">{client.id}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">Status</dt>
              <dd>
                <StatusPill
                  status={client.status === "ACTIVE" ? "ACTIVE" : "PENDING"}
                  label={client.status}
                />
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">Delivery</dt>
              <dd>{deliveryMethodLabel(client.deliveryMethod)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">Commercial</dt>
              <dd>{commercialDisplayLabel(client.commercialModel, client.clientSharePercent)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">Country</dt>
              <dd>{client.country || "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">Currency</dt>
              <dd>{client.currency || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Readiness</h2>
          <ul className="mt-3 space-y-2 text-xs">
            {[
              ["Profile", Boolean(client.name && client.country)],
              ["Agreement", checklist.agreementSigned],
              ["Commercials", checklist.commercialConfigured],
              ["Campaigns published", checklist.assignmentsPublished],
              ["Production API", !checklist.needsApi || checklist.apiKeyIssued],
              ["Portal admin", !checklist.needsPortal || checklist.administratorConfigured],
              ["Activated", checklist.activated],
            ].map(([label, ok]) => (
              <li key={label} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                <span>{label}</span>
                <StatusPill status={ok ? "ACTIVE" : "PENDING"} label={ok ? "Passed" : "Pending"} />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/clients/${clientId}/setup`}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Edit setup
            </Link>
            <Link
              to={`/clients/${clientId}/catalog`}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Manage campaigns
            </Link>
            <Link
              to={`/clients/${clientId}/activation`}
              className="rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            >
              Activation review
            </Link>
          </div>
        </section>
      </div>
    </ClientModuleShell>
  );
}
