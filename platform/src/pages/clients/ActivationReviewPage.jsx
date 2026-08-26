import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchApi, patchApi, postApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { PageLayout } from "../../components/layout/PageLayout";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import {
  buildV5ActivationChecks,
  normalizeActivationBlocks,
  v5CheckStatusClass,
  v5CheckStatusLabel,
} from "./activationHelpers";
import { DELIVERY_METHOD_OPTIONS } from "./deliveryHelpers";
import { NetworkFilter, useClientOpsNetworkFilter } from "./NetworkFilter";

function unwrap(res) {
  return res?.data ?? res;
}

function CheckCard({ title, status, description }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <strong className="text-sm font-semibold text-slate-900">{title}</strong>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${v5CheckStatusClass(status)}`}
        >
          {v5CheckStatusLabel(status)}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

/**
 * Client Ops v5 — Activation Review driven by live onboarding APIs.
 * Clients: GET /clients · Checks: GET /clients/:id/onboarding · Activate: POST .../activate
 */
export function ActivationReviewPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.CLIENTS_MANAGE);
  const [searchParams, setSearchParams] = useSearchParams();
  const [network, setNetwork] = useClientOpsNetworkFilter();

  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(() => searchParams.get("clientId") || "");
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [blockDetails, setBlockDetails] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingClients(true);
      try {
        const res = await fetchApi("/clients", { page: 1, pageSize: 200 }, { skipCache: true });
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
            ? res.items
            : Array.isArray(res?.data?.items)
              ? res.data.items
              : [];
        if (!cancelled) {
          setClients(items);
          setClientId((prev) => prev || items[0]?.id || "");
        }
      } catch (err) {
        if (!cancelled) {
          setClients([]);
          setError(err?.message || "Unable to load clients.");
        }
      } finally {
        if (!cancelled) setLoadingClients(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    if (clientId) next.set("clientId", clientId);
    setSearchParams(next, { replace: true });
  }, [clientId, setSearchParams]);

  const load = useCallback(async () => {
    if (!clientId) {
      setOnboarding(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    setBlockDetails([]);
    try {
      const res = await fetchApi(`/clients/${clientId}/onboarding`, {}, { skipCache: true });
      setOnboarding(unwrap(res));
    } catch (err) {
      setError(err?.message || "Unable to load activation state.");
      setOnboarding(null);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const client = onboarding?.client;
  const checklist = onboarding?.checklist || {};
  const activated = Boolean(checklist.activated);
  const deliveryMethod = client?.deliveryMethod || onboarding?.deliveryMethod || "API_AND_PORTAL";

  const { checks, deliveryLabel, blocked, allRequiredPassed } = useMemo(
    () => buildV5ActivationChecks(onboarding || {}),
    [onboarding],
  );

  const serverBlocks = useMemo(
    () =>
      normalizeActivationBlocks(
        onboarding?.activationBlocks,
        onboarding?.activationBlockDetails,
      ).filter((b) => b.severity !== "needs_review"),
    [onboarding],
  );

  async function changeDeliveryMethod(nextMethod) {
    if (!canManage || !clientId || nextMethod === deliveryMethod) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await patchApi(`/clients/${clientId}`, { deliveryMethod: nextMethod });
      await load();
      setMessage(`Delivery mode updated to ${DELIVERY_METHOD_OPTIONS.find((o) => o.value === nextMethod)?.label || nextMethod}.`);
    } catch (err) {
      setError(err?.message || "Unable to update delivery mode.");
    } finally {
      setBusy(false);
    }
  }

  async function runActivate() {
    if (!canManage || !clientId || activated) return;
    setBusy(true);
    setMessage("");
    setBlockDetails([]);
    try {
      await postApi(`/clients/${clientId}/onboarding/activate`);
      setConfirmOpen(false);
      setMessage("Client activated successfully.");
      await load();
    } catch (err) {
      const structured = normalizeActivationBlocks(
        err?.details?.activationBlocks,
        err?.details?.activationBlockDetails,
      );
      setMessage("Activation blocked");
      setBlockDetails(
        structured.length
          ? structured
          : [{ code: "ACTIVATION_BLOCKED", message: err?.message || "Activation blocked.", severity: "blocked" }],
      );
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  }

  const activateDisabled = !canManage || busy || activated || blocked || loading;

  return (
    <PageLayout
      title="Activation Review"
      subtitle="Final go-live checks. Requirements change automatically based on Delivery Method."
      actions={
        <NetworkFilter id="activation-review-network" value={network} onChange={setNetwork} className="min-w-[180px]" />
      }
    >
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-4 border-b border-slate-100 p-4 sm:grid-cols-2 lg:max-w-3xl">
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Client</span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
              value={clientId}
              disabled={loadingClients || busy}
              onChange={(e) => setClientId(e.target.value)}
            >
              {!clients.length ? <option value="">No clients</option> : null}
              {clients.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name || row.id}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Delivery Mode</span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
              value={deliveryMethod}
              disabled={!clientId || loading || busy || !canManage || activated}
              onChange={(e) => changeDeliveryMethod(e.target.value)}
            >
              {DELIVERY_METHOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading || loadingClients ? (
          <div className="p-6 text-sm text-slate-500">Loading activation checks from onboarding…</div>
        ) : error && !onboarding ? (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-rose-700">{error}</p>
            <Button type="button" onClick={load}>
              Retry
            </Button>
          </div>
        ) : !clientId ? (
          <div className="p-6 text-sm text-slate-500">Select a client to review activation readiness.</div>
        ) : (
          <>
            {error ? (
              <div className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            ) : null}

            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {checks.map((check) => (
                <CheckCard key={check.title} title={check.title} status={check.status} description={check.description} />
              ))}
            </div>

            {message ? (
              <div
                className={`mx-4 mb-4 rounded-xl border px-4 py-3 text-sm ${
                  blockDetails.length || /blocked/i.test(message)
                    ? "border-rose-200 bg-rose-50 text-rose-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900"
                }`}
              >
                <p className="font-semibold">{message}</p>
                {blockDetails.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                    {blockDetails.map((item) => (
                      <li key={`${item.code}-${item.message}`}>
                        <span className="font-semibold">{item.code}</span> — {item.message}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {(blocked || serverBlocks.length > 0) && !activated ? (
              <div className="mx-4 mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <p>
                  <strong>Activation blocked:</strong> Complete all required checks for {deliveryLabel}.
                </p>
                {serverBlocks.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                    {serverBlocks.map((item) => (
                      <li key={`${item.code}-${item.message}`}>
                        {item.code !== "ACTIVATION_BLOCKED" ? (
                          <span className="font-mono text-[10px]">{item.code}</span>
                        ) : null}
                        {item.code !== "ACTIVATION_BLOCKED" ? " — " : null}
                        {item.message}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {activated ? (
              <div className="mx-4 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                This client is already active{client?.status ? ` (${client.status})` : ""}.
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500">All required checks must pass before account activation.</p>
                {clientId ? (
                  <Link
                    to={`/clients/${clientId}/activation`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Open detailed assignment review →
                  </Link>
                ) : null}
              </div>
              <Button
                type="button"
                variant="primary"
                disabled={activateDisabled}
                onClick={() => setConfirmOpen(true)}
                className={activateDisabled && !activated ? "opacity-60" : ""}
              >
                {activated ? "Client already active" : "Activate Client"}
              </Button>
            </div>
          </>
        )}
      </div>

      <Modal
        open={confirmOpen}
        title="Activate client"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <Button type="button" disabled={busy} onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" disabled={busy || !allRequiredPassed} onClick={runActivate}>
              {busy ? "Activating…" : "Confirm activation"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Activate <strong>{client?.name || "this client"}</strong> for {deliveryLabel} delivery? This sets the client
          account to ACTIVE when all backend gates pass.
        </p>
      </Modal>
    </PageLayout>
  );
}
