import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApi, postApi, putApi } from "../../api";
import { Modal } from "../../components/ui/Modal";
import { Icon } from "../../components/ui/Icon";
import {
  badgeClass,
  brandColor,
  brandInitials,
  formatDate,
  formatMoney,
  statusTone,
  unwrap,
} from "./portalUtils";

function Kpi({ label, value, meta, icon }) {
  return (
    <div className="relative overflow-hidden rounded-[17px] border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-blue-50" />
      <div className="relative z-[1] flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-blue-50 text-blue-600">
          <Icon name={icon} size={18} />
        </span>
      </div>
      <div className="relative z-[1] mt-2.5 text-[25px] font-extrabold tracking-tight text-slate-900">{value}</div>
      <div className="relative z-[1] mt-1 text-xs text-slate-500">{meta}</div>
    </div>
  );
}

export function PortalPaymentsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [bankOpen, setBankOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "Current",
  });
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi("/portal/v1/payments");
      const payload = unwrap(res);
      setData(payload);
      setAmount(String(payload?.kpis?.available ?? ""));
    } catch (err) {
      setError(err.message || "Failed to load payments.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const currency = data?.currency || null;
  const kpis = data?.kpis || {};
  const bank = data?.bank;
  const hasKpiData =
    kpis.available != null || kpis.pending != null || kpis.inProgress != null || kpis.paid != null;

  async function saveBank() {
    setSaving(true);
    try {
      await putApi("/portal/v1/bank", bankForm);
      setBankOpen(false);
      setToast("Bank details saved");
      await load();
    } catch (err) {
      setToast(err.message || "Could not save bank details");
    } finally {
      setSaving(false);
    }
  }

  async function confirmWithdraw() {
    setSaving(true);
    try {
      await postApi("/portal/v1/withdrawals", { amount: Number(amount) });
      setWithdrawOpen(false);
      setToast("Withdrawal request submitted");
      await load();
    } catch (err) {
      setToast(err.message || "Withdrawal failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return <p className="text-sm text-slate-500">Loading payments…</p>;
  }
  if (error && !data) {
    return <p className="text-sm text-rose-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Available to withdraw"
          value={
            !hasKpiData
              ? "Not available"
              : currency
                ? formatMoney(kpis.available, currency)
                : kpis.available != null
                  ? Number(kpis.available).toLocaleString("en-IN")
                  : "Not available"
          }
          meta={hasKpiData ? (currency ? "Confirmed and unpaid" : "Currency not configured") : "No withdrawal balance data"}
          icon="check"
        />
        <Kpi
          label="Pending confirmation"
          value={
            !hasKpiData
              ? "Not available"
              : currency
                ? formatMoney(kpis.pending, currency)
                : kpis.pending != null
                  ? Number(kpis.pending).toLocaleString("en-IN")
                  : "Not available"
          }
          meta="Not yet withdrawable"
          icon="schedule"
        />
        <Kpi
          label="Withdrawal in progress"
          value={
            !hasKpiData
              ? "Not available"
              : currency
                ? formatMoney(kpis.inProgress, currency)
                : kpis.inProgress != null
                  ? Number(kpis.inProgress).toLocaleString("en-IN")
                  : "Not available"
          }
          meta="Requested or processing"
          icon="trendingUp"
        />
        <Kpi
          label="Total paid"
          value={
            !hasKpiData
              ? "Not available"
              : currency
                ? formatMoney(kpis.paid, currency)
                : kpis.paid != null
                  ? Number(kpis.paid).toLocaleString("en-IN")
                  : "Not available"
          }
          meta="Completed withdrawals"
          icon="payments"
        />
      </div>

      <div className="rounded-[11px] bg-sky-50 px-3.5 py-3 text-xs leading-relaxed text-sky-900">
        This page is for <strong>bank details and withdrawals</strong> only. For billing-period payable
        commission status, open{" "}
        <a className="font-semibold underline" href="/portal/payment-status">
          Payment Status
        </a>
        .
      </div>

      <div className="rounded-[11px] bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-800">
        Available balance includes only client commission confirmed by the brand or supplier. Pending
        commission cannot be withdrawn until confirmation is received by MBO.
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[17px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Bank details</h3>
              <p className="mt-1 text-xs text-slate-500">Add and verify the account used for client payments.</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-extrabold ${badgeClass(statusTone(bank ? "Verified" : "Pending"))}`}>
              {bank ? "Verified" : "Not added"}
            </span>
          </div>
          {bank ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div>
                <strong className="block text-sm text-slate-900">
                  {bank.bankName} — {bank.accountHolder}
                </strong>
                <span className="mt-1 block text-xs text-slate-500">
                  Account ending {bank.accountLast4} · {bank.accountType}
                </span>
                <span className="mt-1 block text-xs text-slate-500">IFSC {bank.ifscCode}</span>
              </div>
              <button
                type="button"
                className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                onClick={() => {
                  setBankForm({
                    accountHolder: bank.accountHolder || "",
                    bankName: bank.bankName || "",
                    accountNumber: "",
                    ifscCode: bank.ifscCode || "",
                    accountType: bank.accountType || "Current",
                  });
                  setBankOpen(true);
                }}
              >
                Edit
              </button>
            </div>
          ) : (
            <div>
              <p className="py-4 text-center text-sm text-slate-400">No bank account has been added.</p>
              <button
                type="button"
                className="rounded-[10px] bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                onClick={() => {
                  setBankForm({
                    accountHolder: "",
                    bankName: "",
                    accountNumber: "",
                    ifscCode: "",
                    accountType: "Current",
                  });
                  setBankOpen(true);
                }}
              >
                Add bank details
              </button>
            </div>
          )}
        </div>

        <div className="rounded-[17px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Request withdrawal</h3>
          <p className="mt-1 text-xs text-slate-500">Submit a request against your available balance.</p>
          <div className="mt-3 rounded-[10px] border border-slate-200 bg-slate-50 p-3">
            <span className="block text-xs text-slate-400">Available to withdraw</span>
            <strong className="mt-1 block text-[19px] text-slate-900">{formatMoney(kpis.available, currency)}</strong>
          </div>
          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-extrabold text-slate-500">Withdrawal amount</span>
            <input
              type="number"
              min={1000}
              step={1}
              className="w-full rounded-[10px] border border-slate-200 px-3 py-2.5 text-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="mt-3 w-full rounded-[10px] bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white"
            onClick={() => {
              if (!bank) {
                setToast("Add bank details first");
                return;
              }
              const n = Number(amount);
              if (!n || n < 1000 || n > Number(kpis.available || 0)) {
                setToast("Enter a valid withdrawal amount");
                return;
              }
              setWithdrawOpen(true);
            }}
          >
            Request withdrawal
          </button>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Minimum request: ₹1,000. Requests are reviewed before processing.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[17px] border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">Available amount by brand</h3>
            <p className="mt-1 text-xs text-slate-500">Confirmed client commission not yet withdrawn.</p>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full min-w-[400px] text-left text-xs">
              <thead>
                <tr className="text-xs uppercase text-slate-400">
                  <th className="px-2 py-2">Brand</th>
                  <th className="px-2 py-2">Confirmed commission</th>
                  <th className="px-2 py-2">Pending confirmation</th>
                </tr>
              </thead>
              <tbody>
                {(data?.byBrand || []).length ? (
                  data.byBrand.map((row) => (
                    <tr key={row.brand} className="border-t border-slate-100">
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-br text-xs font-bold text-white ${brandColor(row.brand)}`}>
                            {brandInitials(row.brand)}
                          </div>
                          <strong>{row.brand}</strong>
                        </div>
                      </td>
                      <td className="px-2 py-3 tabular-nums">{formatMoney(row.confirmedCommission, currency)}</td>
                      <td className="px-2 py-3 tabular-nums">{formatMoney(row.pendingConfirmation, currency)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-2 py-8 text-center text-slate-400">
                      No brand commission yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[17px] border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">Withdrawal history</h3>
            <p className="mt-1 text-xs text-slate-500">Requests from submission through payment.</p>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full min-w-[360px] text-left text-xs">
              <thead>
                <tr className="text-xs uppercase text-slate-400">
                  <th className="px-2 py-2">Request</th>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {(data?.withdrawals || []).length ? (
                  data.withdrawals.map((w) => (
                    <tr key={w.id} className="border-t border-slate-100">
                      <td className="px-2 py-3">
                        <strong>{w.reference}</strong>
                      </td>
                      <td className="px-2 py-3">{formatDate(w.date)}</td>
                      <td className="px-2 py-3 tabular-nums">{formatMoney(w.amount, currency)}</td>
                      <td className="px-2 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-extrabold ${badgeClass(statusTone(w.status))}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <Link
                          to="/portal/withdrawal-requests"
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-2 py-8 text-center text-slate-400">
                      No withdrawals yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={bankOpen}
        title="Bank details"
        onClose={() => setBankOpen(false)}
        footer={
          <button
            type="button"
            disabled={saving}
            className="rounded-[10px] bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            onClick={saveBank}
          >
            {saving ? "Saving…" : "Save and verify"}
          </button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["accountHolder", "Account holder"],
            ["bankName", "Bank name"],
            ["accountNumber", "Account number"],
            ["ifscCode", "IFSC code"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-xs font-extrabold text-slate-500">{label}</span>
              <input
                className="w-full rounded-[10px] border border-slate-200 px-3 py-2 text-sm"
                value={bankForm[key]}
                onChange={(e) => setBankForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </label>
          ))}
          <label className="block">
            <span className="mb-1.5 block text-xs font-extrabold text-slate-500">Account type</span>
            <select
              className="w-full rounded-[10px] border border-slate-200 px-3 py-2 text-sm"
              value={bankForm.accountType}
              onChange={(e) => setBankForm((f) => ({ ...f, accountType: e.target.value }))}
            >
              <option>Current</option>
              <option>Savings</option>
            </select>
          </label>
        </div>
        <p className="mt-3 rounded-[11px] bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
          Account numbers are encrypted at rest. Only the last 4 digits are shown after save.
        </p>
      </Modal>

      <Modal
        open={withdrawOpen}
        title="Confirm withdrawal"
        onClose={() => setWithdrawOpen(false)}
        footer={
          <button
            type="button"
            disabled={saving}
            className="rounded-[10px] bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            onClick={confirmWithdraw}
          >
            {saving ? "Submitting…" : "Confirm request"}
          </button>
        }
      >
        <div className="space-y-2.5">
          <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
            <span className="block text-xs text-slate-400">Amount</span>
            <strong className="mt-1 block text-[19px]">{formatMoney(amount, currency)}</strong>
          </div>
          <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
            <span className="block text-xs text-slate-400">Destination</span>
            <strong className="mt-1 block text-xs">
              {bank?.bankName} · account ending {bank?.accountLast4}
            </strong>
          </div>
          <p className="rounded-[11px] bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
            MBO will review the request and move it through Requested, Processing and Paid statuses.
          </p>
        </div>
      </Modal>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[120] rounded-[10px] bg-slate-900 px-3.5 py-2.5 text-xs text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
