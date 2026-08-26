import { useEffect, useState } from "react";
import { fetchApi, postApi } from "../../api";
import { Modal } from "../../components/ui/Modal";
import { unwrap } from "./portalUtils";

function StatusBadge({ status }) {
  const s = String(status || "").toUpperCase();
  if (s === "APPROVED" || s === "PROCESSING") return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">APPROVED</span>;
  if (s === "UNDER REVIEW" || s === "REQUESTED") return <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">UNDER REVIEW</span>;
  if (s === "PAID") return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">PAID</span>;
  if (s === "REJECTED") return <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">REJECTED</span>;
  if (s === "CANCELLED") return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">CANCELLED</span>;
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{status || "—"}</span>;
}

function fmtMoney(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function KpiCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1.5 text-[22px] font-bold text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

export function PortalWithdrawalRequestsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi("/portal/v1/withdrawal-requests");
      setData(unwrap(res));
    } catch (err) {
      setError(err.message || "Failed to load withdrawal requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  async function submitWithdrawal() {
    setSubmitError("");
    setSubmitting(true);
    try {
      await postApi("/portal/v1/withdrawals", { amount: Number(amount) });
      setToast("Withdrawal request submitted.");
      setWithdrawOpen(false);
      setAmount("");
      await load();
    } catch (err) {
      setSubmitError(err.message || "Failed to submit withdrawal.");
    } finally {
      setSubmitting(false);
    }
  }

  async function openDetail(r) {
    setDetailLoading(true);
    try {
      const res = await fetchApi(`/portal/v1/withdrawal-requests/${encodeURIComponent(r.id)}`);
      setDetail(unwrap(res));
    } catch {
      setDetail({ request: r, timeline: [] });
    } finally {
      setDetailLoading(false);
    }
  }

  const requests = (data?.requests || []).filter((r) => {
    if (statusFilter !== "all") {
      const s = String(r.status || "").toUpperCase();
      const filterMap = { "UNDER_REVIEW": "UNDER REVIEW", "APPROVED": "APPROVED", "PAID": "PAID", "REJECTED": "REJECTED" };
      if (s !== statusFilter && s !== (filterMap[statusFilter] || statusFilter)) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !String(r.requestId || "").toLowerCase().includes(q) &&
        !String(r.invoiceNumber || "").toLowerCase().includes(q) &&
        !String(r.statementId || "").toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Withdrawal Requests</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Request withdrawal of commission that has been made available to your account.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setAmount(String(kpis.availableForWithdrawal || "")); setWithdrawOpen(true); }}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          New Withdrawal Request
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Available for Withdrawal" value={fmtMoney(kpis.availableForWithdrawal)} />
        <KpiCard label="Under Review" value={fmtMoney(kpis.underReview)} />
        <KpiCard label="Approved" value={fmtMoney(kpis.approved)} />
        <KpiCard label="Paid This Month" value={fmtMoney(kpis.paidThisMonth)} />
      </div>

      {/* Requests table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-800">Requests</h2>
            {data?.total != null && (
              <span className="text-sm text-slate-400">{data.total} requests</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="UNDER REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <input
              className="min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-400"
              placeholder="Search request ID or invoice"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading requests…</div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-rose-500">{error}</p>
              <button type="button" onClick={load} className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold">
                Try again
              </button>
            </div>
          ) : (
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Request ID</th>
                  <th className="px-3 py-3">Request Date</th>
                  <th className="px-3 py-3">Settlement Period</th>
                  <th className="px-3 py-3">Statement ID</th>
                  <th className="px-3 py-3 text-right">Requested Amount</th>
                  <th className="px-3 py-3">Currency</th>
                  <th className="px-3 py-3">Invoice Number</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((r, i) => (
                    <tr key={r.id || i} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-700">{r.requestId}</td>
                      <td className="px-3 py-3 text-slate-600">
                        {r.requestDate
                          ? new Date(r.requestDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-3 py-3 text-slate-600">{r.settlementPeriod || "—"}</td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-600">{r.statementId || "—"}</td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums">{Number(r.requestedAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-3 text-slate-600">{r.currency || "—"}</td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-600">{r.invoiceNumber || "—"}</td>
                      <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          onClick={() => openDetail(r)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-sm text-slate-400">
                      No withdrawal requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New Withdrawal Request Modal */}
      <Modal
        open={withdrawOpen}
        title="New Withdrawal Request"
        onClose={() => { setWithdrawOpen(false); setSubmitError(""); }}
      >
        <div className="space-y-4 text-sm">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-slate-500">Available for withdrawal</div>
            <div className="mt-1 text-[20px] font-bold text-slate-900">{fmtMoney(kpis.availableForWithdrawal)}</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600">Withdrawal Amount</label>
            <input
              type="number"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {submitError && <p className="text-xs text-rose-600">{submitError}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={submitWithdrawal}
              disabled={submitting || !amount}
              className="flex-1 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-slate-800"
            >
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={() => { setWithdrawOpen(false); setSubmitError(""); }}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(detail) || detailLoading}
        title="Withdrawal Request Details"
        onClose={() => setDetail(null)}
      >
        {detailLoading || !detail?.request ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs uppercase text-slate-400">Request ID</div>
                <div className="mt-1 font-mono font-semibold">{detail.request.requestId}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs uppercase text-slate-400">Status</div>
                <div className="mt-1">
                  <StatusBadge status={detail.request.status} />
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs uppercase text-slate-400">Amount</div>
                <div className="mt-1 text-[16px] font-bold">{fmtMoney(detail.request.requestedAmount)}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs uppercase text-slate-400">Statement</div>
                <div className="mt-1 font-mono">{detail.request.statementId || "—"}</div>
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Timeline</div>
              <div className="space-y-2">
                {(detail.timeline || []).map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        step.status === "done" ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                    <span className="font-semibold text-slate-800">{step.label}</span>
                    {step.at ? (
                      <span className="ml-auto text-xs text-slate-400">
                        {new Date(step.at).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
            {detail.request.notes ? (
              <p className="rounded-lg bg-slate-50 p-3 text-slate-600">{detail.request.notes}</p>
            ) : null}
          </div>
        )}
      </Modal>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[120] rounded-[10px] bg-slate-900 px-3.5 py-2.5 text-xs text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
