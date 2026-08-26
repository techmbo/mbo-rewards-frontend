import { useEffect, useState } from "react";
import { fetchApi, patchApi, postApi } from "../../api";
import { badgeClass, statusTone, unwrap } from "./portalUtils";

const TABS = [
  { id: "company", label: "Company" },
  { id: "billing", label: "Billing & Payment" },
  { id: "commercials", label: "Commercials" },
  { id: "api", label: "API & Integration" },
  { id: "users", label: "Users & Access" },
  { id: "notifications", label: "Notifications" },
];

function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function ReadRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-semibold text-slate-800">{value ?? "—"}</span>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          on ? "left-4" : "left-0.5"
        }`}
      />
    </button>
  );
}

function inputClass() {
  return "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-400";
}

export function PortalSettingsPage() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("company");
  const [apiEnv, setApiEnv] = useState("production");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [revealedKey, setRevealedKey] = useState(null);

  const [company, setCompany] = useState({});
  const [billing, setBilling] = useState({});
  const [payment, setPayment] = useState({});
  const [notifications, setNotifications] = useState({});
  const [security, setSecurity] = useState({ newLoginAlerts: true });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi("/portal/v1/settings");
      const payload = unwrap(res);
      setData(payload);
      setCompany({ ...(payload?.organisation || {}) });
      setBilling({ ...(payload?.billing || {}) });
      setPayment({ ...(payload?.payment || {}) });
      setNotifications({ ...(payload?.notifications || {}) });
      setSecurity({ newLoginAlerts: payload?.security?.newLoginAlerts !== false });
    } catch (err) {
      setError(err.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  async function save(partial) {
    setSaving(true);
    try {
      const res = await patchApi("/portal/v1/settings", partial);
      const payload = unwrap(res);
      setData(payload);
      setCompany({ ...(payload?.organisation || {}) });
      setBilling({ ...(payload?.billing || {}) });
      setPayment({ ...(payload?.payment || {}) });
      setNotifications({ ...(payload?.notifications || {}) });
      setToast("Changes saved");
    } catch (err) {
      setToast(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function rotateKey() {
    setRotating(true);
    setRevealedKey(null);
    try {
      const res = await postApi("/portal/v1/api-keys/rotate", {
        name: apiEnv === "sandbox" ? "Sandbox" : "Production",
        environment: apiEnv === "sandbox" ? "SANDBOX" : "PRODUCTION",
      });
      const payload = unwrap(res);
      setRevealedKey(payload?.apiKey || null);
      setToast("API key regenerated — copy it now");
      await load();
    } catch (err) {
      setToast(err.message || "Failed to rotate API key");
    } finally {
      setRotating(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading profile…</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  const org = data?.organisation || {};
  const commercials = data?.commercials || {};
  const api = data?.api || {};
  const team = data?.team || [];
  const keys = (api.keys || []).filter((k) => {
    const env = String(k.environment || "PRODUCTION").toUpperCase();
    return apiEnv === "sandbox" ? env === "SANDBOX" : env !== "SANDBOX";
  });
  const activeKey = keys[0];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Company, billing, commercials, API credentials, users, and notification preferences.
        </p>
      </div>

      {toast ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          {toast}
        </div>
      ) : null}

      <div className="rounded-[17px] border border-slate-200/80 bg-white shadow-sm">
        <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200 px-3.5 py-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ${
                tab === t.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "company" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Company Details</h2>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    save({
                      organisation: {
                        name: company.name,
                        legalName: company.legalName,
                        primaryContactName: company.primaryContactName,
                        primaryContactEmail: company.primaryContactEmail,
                        financeContactEmail: company.financeContactEmail,
                        phone: company.phone,
                        registeredAddress: company.registeredAddress,
                        taxRegistrationId: company.taxRegistrationId,
                      },
                    })
                  }
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Company Name">
                  <input className={inputClass()} value={company.name || ""} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                </Field>
                <Field label="Legal Name">
                  <input className={inputClass()} value={company.legalName || ""} onChange={(e) => setCompany({ ...company, legalName: e.target.value })} />
                </Field>
                <Field label="Client Code">
                  <input className={inputClass()} value={org.clientCode || ""} disabled />
                </Field>
                <Field label="Country / Currency">
                  <input className={inputClass()} value={`${org.country || "—"} · ${org.currency || "—"}`} disabled />
                </Field>
                <Field label="Primary Contact">
                  <input className={inputClass()} value={company.primaryContactName || ""} onChange={(e) => setCompany({ ...company, primaryContactName: e.target.value })} />
                </Field>
                <Field label="Primary Email">
                  <input className={inputClass()} value={company.primaryContactEmail || ""} onChange={(e) => setCompany({ ...company, primaryContactEmail: e.target.value })} />
                </Field>
                <Field label="Finance Email">
                  <input className={inputClass()} value={company.financeContactEmail || ""} onChange={(e) => setCompany({ ...company, financeContactEmail: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <input className={inputClass()} value={company.phone || ""} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
                </Field>
                <Field label="Registered Address">
                  <textarea className={inputClass()} rows={2} value={company.registeredAddress || ""} onChange={(e) => setCompany({ ...company, registeredAddress: e.target.value })} />
                </Field>
                <Field label="Tax / Registration ID">
                  <input className={inputClass()} value={company.taxRegistrationId || ""} onChange={(e) => setCompany({ ...company, taxRegistrationId: e.target.value })} />
                </Field>
              </div>
            </div>
          )}

          {tab === "billing" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">Billing</h2>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      save({
                        billing: {
                          billingContact: billing.billingContact,
                          billingAddress: billing.billingAddress,
                          taxId: billing.taxId,
                        },
                        organisation: {
                          financeContactEmail: billing.billingContact,
                          taxRegistrationId: billing.taxId,
                          registeredAddress: billing.billingAddress,
                        },
                      })
                    }
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Save Billing
                  </button>
                </div>
                <Field label="Billing Contact Email">
                  <input className={inputClass()} value={billing.billingContact || ""} onChange={(e) => setBilling({ ...billing, billingContact: e.target.value })} />
                </Field>
                <Field label="Billing Address">
                  <textarea className={inputClass()} rows={2} value={billing.billingAddress || ""} onChange={(e) => setBilling({ ...billing, billingAddress: e.target.value })} />
                </Field>
                <Field label="Tax ID">
                  <input className={inputClass()} value={billing.taxId || ""} onChange={(e) => setBilling({ ...billing, taxId: e.target.value })} />
                </Field>
                <ReadRow label="Billing Method" value={billing.billingMethod} />
                <ReadRow label="Billing Currency" value={billing.billingCurrency} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">Payment / Bank</h2>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      save({
                        payment: {
                          accountHolder: payment.accountHolder,
                          bankName: payment.bankName,
                          accountNumber: payment.accountNumber,
                          ifscCode: payment.ifscCode,
                          accountType: payment.accountType || "Current",
                          bankCountry: payment.bankCountry,
                        },
                      })
                    }
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Save Bank
                  </button>
                </div>
                <Field label="Account Holder">
                  <input className={inputClass()} value={payment.accountHolder || ""} onChange={(e) => setPayment({ ...payment, accountHolder: e.target.value })} />
                </Field>
                <Field label="Bank Name">
                  <input className={inputClass()} value={payment.bankName || ""} onChange={(e) => setPayment({ ...payment, bankName: e.target.value })} />
                </Field>
                <Field label="Account Number (enter to update)">
                  <input
                    className={inputClass()}
                    placeholder={payment.accountLast4 ? `••••${payment.accountLast4}` : "Account number"}
                    value={payment.accountNumber || ""}
                    onChange={(e) => setPayment({ ...payment, accountNumber: e.target.value })}
                  />
                </Field>
                <Field label="IFSC / SWIFT">
                  <input className={inputClass()} value={payment.ifscCode || ""} onChange={(e) => setPayment({ ...payment, ifscCode: e.target.value })} />
                </Field>
                <ReadRow label="Bank Status" value={payment.status} />
              </div>
            </div>
          )}

          {tab === "commercials" && (
            <div className="max-w-xl space-y-1 rounded-xl border border-slate-200 p-4">
              <h2 className="mb-2 text-sm font-semibold text-slate-800">Commercial Terms</h2>
              <ReadRow label="Commercial Model" value={commercials.commercialModel} />
              <ReadRow
                label="Client Share"
                value={
                  commercials.clientSharePercent != null ? `${commercials.clientSharePercent}%` : "—"
                }
              />
              <ReadRow label="Settlement Currency" value={commercials.settlementCurrency} />
              <ReadRow label="Settlement Frequency" value={commercials.settlementFrequency} />
              <ReadRow label="Minimum Withdrawal" value={commercials.minimumWithdrawal} />
              <ReadRow label="Billing Method" value={commercials.billingMethod} />
              <ReadRow label="Payment Trigger" value={commercials.paymentTrigger} />
              <ReadRow label="Agreement Status" value={commercials.agreementStatus} />
              <ReadRow label="Account Status" value={commercials.accountStatus} />
              <p className="pt-3 text-xs text-slate-400">
                Commercial terms are managed by MBO. Contact support to request changes.
              </p>
            </div>
          )}

          {tab === "api" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setApiEnv("production")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                    apiEnv === "production" ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600"
                  }`}
                >
                  Production
                </button>
                <button
                  type="button"
                  onClick={() => setApiEnv("sandbox")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                    apiEnv === "sandbox" ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600"
                  }`}
                >
                  Sandbox
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs uppercase text-slate-400">Environment</div>
                  <div className="mt-1 text-base font-bold text-slate-800">
                    {apiEnv === "sandbox" ? "Sandbox" : "Production"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs uppercase text-slate-400">Base URL</div>
                  <div className="mt-1 break-all font-mono text-sm font-semibold text-slate-800">
                    {apiEnv === "sandbox" ? api.sandboxBaseUrl : api.productionBaseUrl}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-xs uppercase text-slate-400">API Key</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <code className="rounded bg-slate-50 px-2 py-1 font-mono text-base text-slate-800">
                    {revealedKey ||
                      (activeKey?.keyPrefix ? `${activeKey.keyPrefix}••••••••` : "No key configured")}
                  </code>
                  <button
                    type="button"
                    disabled={rotating}
                    onClick={rotateKey}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {rotating ? "Regenerating…" : "Regenerate"}
                  </button>
                  {revealedKey ? (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(revealedKey);
                        setToast("API key copied");
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold"
                    >
                      Copy
                    </button>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Full key is shown only once after regenerate. Store it securely.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-800">Security & Access</h3>
                <ReadRow label="Client ID" value={api.clientId} />
                <ReadRow label="API Status" value={api.apiStatus} />
                <ReadRow label="Authentication" value={api.authentication} />
                <ReadRow
                  label="Last Successful Request"
                  value={
                    api.lastApiActivity
                      ? new Date(api.lastApiActivity).toLocaleString()
                      : activeKey?.lastUsedAt
                        ? new Date(activeKey.lastUsedAt).toLocaleString()
                        : "—"
                  }
                />
                <ReadRow
                  label="Key Created"
                  value={activeKey?.createdAt ? new Date(activeKey.createdAt).toLocaleDateString() : "—"}
                />
              </div>
            </div>
          )}

          {tab === "users" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Users & Access</h2>
                <span className="text-xs text-slate-400">Invite flow managed by MBO ops</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-2 py-2">Name</th>
                      <th className="px-2 py-2">Email</th>
                      <th className="px-2 py-2">Role</th>
                      <th className="px-2 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.length ? (
                      team.map((u) => (
                        <tr key={u.id} className="border-b border-slate-50">
                          <td className="px-2 py-2.5 font-semibold text-slate-800">{u.name}</td>
                          <td className="px-2 py-2.5 text-slate-600">{u.email}</td>
                          <td className="px-2 py-2.5 text-slate-600">{u.role}</td>
                          <td className="px-2 py-2.5">
                            <span className={badgeClass(statusTone(u.status))}>{u.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-400">
                          No portal users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="max-w-xl space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Notification Preferences</h2>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => save({ notifications, security })}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Save Preferences
                </button>
              </div>
              {[
                ["campaignUpdates", "New Campaigns", "Notify when a new campaign becomes available."],
                ["campaignExpiry", "Campaign Expiry", "Notify before an active campaign expires."],
                ["statementReleased", "Payable Statement Released", "Notify when commission becomes available."],
                ["withdrawalUpdates", "Withdrawal Request Updates", "Notify on approve / reject / update."],
                ["paymentUpdates", "Payment Updates", "Notify when a payment is scheduled or paid."],
                ["securityAlerts", "Security Alerts", "Notify on security-related account events."],
              ].map(([key, title, desc]) => (
                <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <div>
                    <div className="text-base font-semibold text-slate-800">{title}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{desc}</div>
                  </div>
                  <Toggle
                    on={notifications[key] !== false}
                    onChange={(v) => setNotifications({ ...notifications, [key]: v })}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <div>
                  <div className="text-base font-semibold text-slate-800">New Login Alerts</div>
                  <div className="mt-0.5 text-xs text-slate-500">Email when a new device signs in.</div>
                </div>
                <Toggle
                  on={security.newLoginAlerts !== false}
                  onChange={(v) => setSecurity({ ...security, newLoginAlerts: v })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
