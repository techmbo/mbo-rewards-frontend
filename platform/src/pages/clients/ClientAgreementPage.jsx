import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchApi, patchApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/FormControls";
import { ClientModuleShell } from "./ClientModuleShell";

const AGREEMENT_STATUS_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PENDING", label: "Pending" },
  { value: "SIGNED", label: "Signed" },
];

const PAYMENT_CYCLE_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
];

const PAYMENT_TRIGGER_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "AFTER_NETWORK_PAYMENT", label: "After MBO receives network payment" },
  { value: "CONTRACT_SPECIFIC", label: "Contract-specific" },
];

function unwrap(res) {
  return res?.data ?? res;
}

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/**
 * Client Workspace → Agreement + commercials payment terms.
 */
export function ClientAgreementPage() {
  const { clientId } = useParams();
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.CLIENTS_MANAGE);

  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    legalName: "",
    agreementStatus: "NONE",
    agreementEffectiveAt: "",
    agreementRenewalAt: "",
    agreementDocumentUrl: "",
    paymentCycle: "",
    paymentTrigger: "",
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi(`/clients/${clientId}/onboarding`);
      const data = unwrap(res);
      setOnboarding(data);
      const c = data?.client || {};
      setForm({
        legalName: c.legalName || "",
        agreementStatus: c.agreementStatus || "NONE",
        agreementEffectiveAt: toDateInput(c.agreementEffectiveAt),
        agreementRenewalAt: toDateInput(c.agreementRenewalAt),
        agreementDocumentUrl: c.agreementDocumentUrl || "",
        paymentCycle: c.paymentCycle || "",
        paymentTrigger: c.paymentTrigger || "",
      });
    } catch (err) {
      setError(err?.message || "Unable to load agreement.");
      setOnboarding(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (clientId) load();
  }, [clientId]);

  async function save(e) {
    e.preventDefault();
    if (!canManage) return;
    setBusy(true);
    setMessage("");
    try {
      await patchApi(`/clients/${clientId}`, {
        legalName: form.legalName.trim() || null,
        agreementStatus: form.agreementStatus,
        agreementEffectiveAt: form.agreementEffectiveAt || null,
        agreementRenewalAt: form.agreementRenewalAt || null,
        agreementDocumentUrl: form.agreementDocumentUrl.trim() || null,
        paymentCycle: form.paymentCycle || null,
        paymentTrigger: form.paymentTrigger || null,
      });
      setMessage("Agreement and payment terms saved.");
      await load();
    } catch (err) {
      setMessage(err?.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  const client = onboarding?.client;

  if (loading) {
    return (
      <ClientModuleShell client={null} active="agreement" title="Agreement" subtitle="Loading…">
        <p className="text-sm text-slate-500">Loading…</p>
      </ClientModuleShell>
    );
  }

  if (error || !client) {
    return (
      <ClientModuleShell client={null} active="agreement" title="Agreement" subtitle="Unable to load">
        <p className="text-sm text-rose-600">{error || "Client not found."}</p>
      </ClientModuleShell>
    );
  }

  return (
    <ClientModuleShell
      client={client}
      active="agreement"
      title="Agreement"
      subtitle="Signed agreement is required before client activation."
    >
      {message ? (
        <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {message}
        </p>
      ) : null}

      <form onSubmit={save} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Agreement</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs sm:col-span-2">
            <span className="font-semibold text-slate-500">Legal entity name</span>
            <Input
              className="mt-1"
              value={form.legalName}
              onChange={(e) => setForm((p) => ({ ...p, legalName: e.target.value }))}
              disabled={!canManage}
              placeholder="Legal company name"
            />
          </label>
          <label className="block text-xs">
            <span className="font-semibold text-slate-500">Agreement status</span>
            <Select
              className="mt-1"
              value={form.agreementStatus}
              onChange={(e) => setForm((p) => ({ ...p, agreementStatus: e.target.value }))}
              disabled={!canManage}
              options={AGREEMENT_STATUS_OPTIONS}
            />
          </label>
          <label className="block text-xs">
            <span className="font-semibold text-slate-500">Effective date</span>
            <Input
              className="mt-1"
              type="date"
              value={form.agreementEffectiveAt}
              onChange={(e) => setForm((p) => ({ ...p, agreementEffectiveAt: e.target.value }))}
              disabled={!canManage}
            />
          </label>
          <label className="block text-xs">
            <span className="font-semibold text-slate-500">Renewal date</span>
            <Input
              className="mt-1"
              type="date"
              value={form.agreementRenewalAt}
              onChange={(e) => setForm((p) => ({ ...p, agreementRenewalAt: e.target.value }))}
              disabled={!canManage}
            />
          </label>
          <label className="block text-xs sm:col-span-2">
            <span className="font-semibold text-slate-500">Document URL</span>
            <Input
              className="mt-1"
              type="url"
              value={form.agreementDocumentUrl}
              onChange={(e) => setForm((p) => ({ ...p, agreementDocumentUrl: e.target.value }))}
              disabled={!canManage}
              placeholder="https://…"
            />
          </label>
        </div>

        <h2 className="pt-2 text-sm font-semibold text-slate-900">Payment terms</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs">
            <span className="font-semibold text-slate-500">Payment cycle</span>
            <Select
              className="mt-1"
              value={form.paymentCycle}
              onChange={(e) => setForm((p) => ({ ...p, paymentCycle: e.target.value }))}
              disabled={!canManage}
              options={PAYMENT_CYCLE_OPTIONS}
            />
          </label>
          <label className="block text-xs">
            <span className="font-semibold text-slate-500">Payment trigger</span>
            <Select
              className="mt-1"
              value={form.paymentTrigger}
              onChange={(e) => setForm((p) => ({ ...p, paymentTrigger: e.target.value }))}
              disabled={!canManage}
              options={PAYMENT_TRIGGER_OPTIONS}
            />
          </label>
        </div>

        {canManage ? (
          <Button type="submit" variant="primary" disabled={busy}>
            Save agreement
          </Button>
        ) : null}
      </form>
    </ClientModuleShell>
  );
}
