import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchApi, patchApi, postApi, putApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { PageLayout } from "../../components/layout/PageLayout";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/FormControls";
import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";
import { COUNTRY_OPTIONS } from "../../utils/countries";
import { DELIVERY_METHOD_OPTIONS, deliveryChannelRequirements } from "./deliveryHelpers";
import { NetworkFilter, useClientOpsNetworkFilter } from "./NetworkFilter";

const STEPS = [
  { id: "profile", label: "1 Profile" },
  { id: "agreement", label: "2 Agreement" },
  { id: "commercials", label: "3 Commercials" },
  { id: "delivery", label: "4 Delivery Method" },
  { id: "credentials", label: "5 API / Portal Setup" },
  { id: "save", label: "6 Save Setup" },
];

const CLIENT_TYPE_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "Bank / Rewards", label: "Bank / Rewards" },
  { value: "Fintech", label: "Fintech" },
  { value: "Corporate Rewards", label: "Corporate Rewards" },
];

const AGREEMENT_STATUS_OPTIONS = [
  { value: "NONE", label: "Select…" },
  { value: "SIGNED", label: "Signed" },
  { value: "PENDING", label: "Pending" },
  { value: "SENT", label: "Sent" },
  { value: "DRAFT", label: "Draft" },
];

const COMMERCIAL_MODEL_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "OFFERS_PLUS_COMMISSION", label: "% of confirmed commission" },
  { value: "OFFERS_ONLY", label: "Offers only (0% share)" },
];

const PAYMENT_CYCLE_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
];

const PAYMENT_TRIGGER_OPTIONS = [
  { value: "", label: "Select…" },
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

function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-xs font-semibold text-slate-600">
      {label}
      <div className="mt-1.5 font-normal">{children}</div>
    </label>
  );
}

const EMPTY_FORM = {
  name: "",
  legalName: "",
  country: "",
  industry: "",
  agreementStatus: "NONE",
  agreementEffectiveAt: "",
  commercialModel: "",
  clientSharePercent: "",
  paymentCycle: "",
  paymentTrigger: "",
  deliveryMethod: "",
  sandboxReady: "",
  productionReady: "",
  portalAdminName: "",
  portalAdminEmail: "",
};

/**
 * Client Setup (v5) — create/complete client before activation.
 * Route: /clients/setup (new) or /clients/:clientId/setup (existing).
 */
export function ClientSetupPage() {
  // New-client setup uses /clients/setup with no id param.
  const { clientId: paramId } = useParams();
  const isNew = !paramId;
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.CLIENTS_MANAGE);
  const [network, setNetwork] = useClientOpsNetworkFilter();

  const [clientId, setClientId] = useState(isNew ? null : paramId);
  const [activeStep, setActiveStep] = useState("profile");
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const channels = useMemo(
    () => deliveryChannelRequirements(form.deliveryMethod || "API_AND_PORTAL"),
    [form.deliveryMethod],
  );

  useEffect(() => {
    if (isNew || !paramId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchApi(`/clients/${paramId}/onboarding`);
        if (cancelled) return;
        const data = unwrap(res);
        const c = data?.client || {};
        setClientId(c.id || paramId);
        setForm({
          name: c.name || "",
          legalName: c.legalName || "",
          country: c.country || "IN",
          industry: c.industry || c.category || "Bank / Rewards",
          agreementStatus: c.agreementStatus || "NONE",
          agreementEffectiveAt: toDateInput(c.agreementEffectiveAt),
          commercialModel: c.commercialModel || "OFFERS_PLUS_COMMISSION",
          clientSharePercent:
            c.clientSharePercent != null ? String(Number(c.clientSharePercent)) : "80",
          paymentCycle: c.paymentCycle || "MONTHLY",
          paymentTrigger: c.paymentTrigger || "AFTER_NETWORK_PAYMENT",
          deliveryMethod: c.deliveryMethod || data?.deliveryMethod || "API_AND_PORTAL",
          sandboxReady: "Enable",
          productionReady: "Pending Until Activation",
          portalAdminName: "",
          portalAdminEmail: "",
        });
      } catch (err) {
        if (!cancelled) setError(err?.message || "Unable to load client setup.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNew, paramId]);

  function patchField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveSetup() {
    if (!canManage) return;
    if (!form.name.trim()) {
      setError("Client name is required.");
      setActiveStep("profile");
      return;
    }
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const deliveryMethod = form.deliveryMethod || "API_AND_PORTAL";
      const agreementStatus = form.agreementStatus && form.agreementStatus !== "NONE"
        ? form.agreementStatus
        : "NONE";
      let id = clientId;
      if (!id) {
        const created = unwrap(
          await postApi("/clients", {
            name: form.name.trim(),
            legalName: form.legalName.trim() || null,
            industry: form.industry.trim() || null,
            country: form.country.trim().toUpperCase() || null,
            status: "PROSPECT",
            deliveryMethod,
            agreementStatus,
            agreementEffectiveAt: form.agreementEffectiveAt || null,
            paymentCycle: form.paymentCycle || null,
            paymentTrigger: form.paymentTrigger || null,
          }),
        );
        id = created?.id;
        if (!id) throw new Error("Client created but no id returned.");
        setClientId(id);
      } else {
        await patchApi(`/clients/${id}`, {
          name: form.name.trim(),
          legalName: form.legalName.trim() || null,
          industry: form.industry.trim() || null,
          country: form.country.trim().toUpperCase() || null,
          deliveryMethod,
          agreementStatus,
          agreementEffectiveAt: form.agreementEffectiveAt || null,
          paymentCycle: form.paymentCycle || null,
          paymentTrigger: form.paymentTrigger || null,
        });
      }

      if (form.commercialModel) {
        await putApi(`/clients/${id}/onboarding/commercial-model`, {
          commercialModel: form.commercialModel,
          ...(form.commercialModel === "OFFERS_PLUS_COMMISSION"
            ? { clientSharePercent: Number(form.clientSharePercent || 0) }
            : {}),
        });
      }

      setMessage(
        channels.needsPortal && form.portalAdminEmail.trim()
          ? "Setup saved. Create the portal admin under Portal Users (password required) when ready."
          : "Setup saved. Continue with campaigns and activation when ready.",
      );
      setActiveStep("save");
      if (isNew) navigate(`/clients/${id}/setup`, { replace: true });
    } catch (err) {
      setError(err?.message || "Save setup failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <PageLayout eyebrow="Client Operations" title="Client Setup" subtitle="Loading…">
        <LoadingState label="Loading client setup" />
      </PageLayout>
    );
  }

  if (error && !form.name) {
    return (
      <PageLayout
        eyebrow="Client Operations"
        title="Client Setup"
        actions={
          <Link
            to="/clients"
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Back to Clients
          </Link>
        }
      >
        <ErrorState message={error} onRetry={() => navigate(0)} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      eyebrow="Client Operations"
      title="Client Setup"
      subtitle="Create the client account and configure the information required before activation."
      actions={
        <div className="flex flex-wrap items-end gap-3">
          <NetworkFilter
            id="client-setup-network"
            value={network}
            onChange={setNetwork}
            className="min-w-[180px]"
          />
          <Link
            to="/clients"
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Clients
          </Link>
          {canManage ? (
            <Button variant="primary" disabled={busy} onClick={saveSetup}>
              {busy ? "Saving…" : "Save Setup"}
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        {STEPS.map((step) => {
          const active = activeStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {step.label}
            </button>
          );
        })}
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      ) : null}

      <Section
        title="Profile"
        subtitle="Client ID is generated internally after save and is not shown in the main Clients directory."
      >
        <Field label="Client Name">
          <Input
            value={form.name}
            onChange={(e) => patchField("name", e.target.value)}
            disabled={!canManage}
            required
          />
        </Field>
        <Field label="Legal Name">
          <Input
            value={form.legalName}
            onChange={(e) => patchField("legalName", e.target.value)}
            disabled={!canManage}
            placeholder="Legal entity name"
          />
        </Field>
        <Field label="Country">
          <Select
            value={form.country}
            onChange={(e) => patchField("country", e.target.value)}
            disabled={!canManage}
            options={[{ value: "", label: "Select…" }, ...COUNTRY_OPTIONS.filter((o) => o.value)]}
          />
        </Field>
        <Field label="Client Type">
          <Select
            value={form.industry}
            onChange={(e) => patchField("industry", e.target.value)}
            disabled={!canManage}
            options={CLIENT_TYPE_OPTIONS}
          />
        </Field>
      </Section>

      <Section title="Agreement">
        <Field label="Agreement Status">
          <Select
            value={form.agreementStatus}
            onChange={(e) => patchField("agreementStatus", e.target.value)}
            disabled={!canManage}
            options={AGREEMENT_STATUS_OPTIONS}
          />
        </Field>
        <Field label="Effective Date">
          <Input
            type="date"
            value={form.agreementEffectiveAt}
            onChange={(e) => patchField("agreementEffectiveAt", e.target.value)}
            disabled={!canManage}
          />
        </Field>
      </Section>

      <Section title="Commercials">
        <Field label="Commercial Model">
          <Select
            value={form.commercialModel}
            onChange={(e) => patchField("commercialModel", e.target.value)}
            disabled={!canManage}
            options={COMMERCIAL_MODEL_OPTIONS}
          />
        </Field>
        <Field label="Client Share">
          <Input
            value={form.clientSharePercent}
            onChange={(e) => patchField("clientSharePercent", e.target.value)}
            disabled={!canManage || form.commercialModel !== "OFFERS_PLUS_COMMISSION"}
            placeholder="80"
          />
          <p className="mt-1 text-[10px] font-normal text-slate-400">Percent of confirmed commission (estimate until order actuals).</p>
        </Field>
        <Field label="Payment Cycle">
          <Select
            value={form.paymentCycle}
            onChange={(e) => patchField("paymentCycle", e.target.value)}
            disabled={!canManage}
            options={PAYMENT_CYCLE_OPTIONS}
          />
        </Field>
        <Field label="Payment Trigger">
          <Select
            value={form.paymentTrigger}
            onChange={(e) => patchField("paymentTrigger", e.target.value)}
            disabled={!canManage}
            options={PAYMENT_TRIGGER_OPTIONS}
          />
        </Field>
      </Section>

      <Section title="Delivery Method">
        <Field label="Delivery Mode">
          <Select
            value={form.deliveryMethod}
            onChange={(e) => patchField("deliveryMethod", e.target.value)}
            disabled={!canManage}
            options={[
              { value: "", label: "Select…" },
              ...DELIVERY_METHOD_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
            ]}
          />
        </Field>
        <Field label="Initial Account Status">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
            Setup In Progress
          </div>
        </Field>
      </Section>

      {channels.needsApi ? (
        <Section
          title="Initial API Setup"
          subtitle="Detailed ongoing maintenance moves to Client Workspace → API after the client is created."
        >
          <Field label="Sandbox">
            <Select
              value={form.sandboxReady}
              onChange={(e) => patchField("sandboxReady", e.target.value)}
              disabled={!canManage}
              options={[
                { value: "", label: "Select…" },
                { value: "Enable", label: "Enable" },
                { value: "Not Yet", label: "Not Yet" },
              ]}
            />
          </Field>
          <Field label="Production">
            <Select
              value={form.productionReady}
              onChange={(e) => patchField("productionReady", e.target.value)}
              disabled={!canManage}
              options={[
                { value: "", label: "Select…" },
                { value: "Pending Until Activation", label: "Pending Until Activation" },
                { value: "Prepare", label: "Prepare" },
              ]}
            />
          </Field>
        </Section>
      ) : null}

      {channels.needsPortal ? (
        <Section
          title="Initial Portal Setup"
          subtitle="Create the first portal administrator when Portal delivery is required."
        >
          <Field label="Admin Name">
            <Input
              value={form.portalAdminName}
              onChange={(e) => patchField("portalAdminName", e.target.value)}
              disabled={!canManage}
              placeholder="Portal admin name"
            />
          </Field>
          <Field label="Admin Email">
            <Input
              type="email"
              value={form.portalAdminEmail}
              onChange={(e) => patchField("portalAdminEmail", e.target.value)}
              disabled={!canManage}
              placeholder="admin@client.com"
            />
          </Field>
        </Section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Save Setup</h2>
        <p className="mt-1 text-sm text-slate-500">
          Saves profile, agreement, commercials, and delivery method. Campaign assignment and go-live checks happen next.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {canManage ? (
            <Button variant="primary" disabled={busy || !form.name.trim()} onClick={saveSetup}>
              {busy ? "Saving…" : "Save Setup"}
            </Button>
          ) : null}
          {clientId ? (
            <>
              <Link
                to={`/assignments?clientId=${encodeURIComponent(clientId)}`}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Client Campaigns
              </Link>
              <Link
                to={`/activation-review?clientId=${clientId}`}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Activation Review
              </Link>
            </>
          ) : null}
        </div>
      </section>
    </PageLayout>
  );
}
