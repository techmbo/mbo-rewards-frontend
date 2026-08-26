import { useEffect, useState } from "react";
import { fetchApi } from "../../api";
import { Modal } from "../../components/ui/Modal";
import { unwrap } from "./portalUtils";

function StatusBadge({ status }) {
  const s = String(status || "").toUpperCase();
  if (s === "AVAILABLE") return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">AVAILABLE</span>;
  if (s === "REQUESTED") return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">REQUESTED</span>;
  if (s === "PAID") return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">PAID</span>;
  if (s === "CANCELLED" || s === "SUPERSEDED") return <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">CANCELLED</span>;
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

export function PortalPayableStatementsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi("/portal/v1/payable-statements");
      setData(unwrap(res));
    } catch (err) {
      setError(err.message || "Failed to load payable statements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openDetail(s) {
    setDetailLoading(true);
    try {
      const res = await fetchApi(`/portal/v1/payable-statements/${encodeURIComponent(s.id)}`);
      setDetail(unwrap(res));
    } catch (err) {
      setDetail({
        statement: s,
        document: { ...s, title: "PAYABLE STATEMENT", note: err.message },
      });
    } finally {
      setDetailLoading(false);
    }
  }

  function printStatement() {
    window.print();
  }

  const statements = (data?.statements || []).filter((s) => {
    if (statusFilter === "all") return true;
    return String(s.status || "").toUpperCase() === statusFilter;
  });

  const kpis = data?.kpis || {};
  const doc = detail?.document || detail?.statement || null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payable Statements</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          View your commission statements by period. Statements become available once supplier confirms orders.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <KpiCard label="Total Statements" value={kpis.totalStatements ?? "—"} />
        <KpiCard label="Available Amount" value={fmtMoney(kpis.availableAmount)} />
        <KpiCard label="Paid Amount" value={fmtMoney(kpis.paidAmount)} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-slate-800">Statements</h2>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="REQUESTED">Requested</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading statements…</div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-rose-500">{error}</p>
              <button type="button" onClick={load} className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold">
                Try again
              </button>
            </div>
          ) : (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Statement</th>
                  <th className="px-3 py-3">Period</th>
                  <th className="px-3 py-3">Period Range</th>
                  <th className="px-3 py-3 text-right">Amount</th>
                  <th className="px-3 py-3">Currency</th>
                  <th className="px-3 py-3">Invoice Number</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {statements.length > 0 ? (
                  statements.map((s, i) => (
                    <tr key={s.id || i} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-700">{s.statementId}</td>
                      <td className="px-3 py-3 text-slate-700">{s.periodLabel || s.period}</td>
                      <td className="px-3 py-3 text-slate-500">
                        {s.periodStart} → {s.periodEnd}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums">{fmtMoney(s.amount)}</td>
                      <td className="px-3 py-3 text-slate-600">{s.currency}</td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-600">{s.invoiceNumber || "—"}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => openDetail(s)}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                      No payable statements found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={Boolean(detail) || detailLoading} title="Payable Statement" onClose={() => setDetail(null)}>
        {detailLoading || !doc ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{doc.title || "PAYABLE STATEMENT"}</div>
              <div className="mt-2 font-mono text-base font-semibold text-slate-800">{doc.statementId}</div>
              <div className="mt-1 text-slate-600">
                {doc.periodLabel || doc.period} · {doc.periodStart} → {doc.periodEnd}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs uppercase text-slate-400">Amount</div>
                <div className="mt-1 text-[16px] font-bold">{fmtMoney(doc.amount)}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs uppercase text-slate-400">Status</div>
                <div className="mt-1">
                  <StatusBadge status={doc.status} />
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs uppercase text-slate-400">Opening</div>
                <div className="mt-1 font-semibold">{fmtMoney(doc.openingBalance)}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs uppercase text-slate-400">Closing</div>
                <div className="mt-1 font-semibold">{fmtMoney(doc.closingBalance)}</div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-xs uppercase text-slate-400">Invoice</div>
              <div className="mt-1 font-mono font-semibold">{doc.invoiceNumber || "—"}</div>
            </div>
            {(doc.lineItems || []).map((li, idx) => (
              <div key={idx} className="flex justify-between border-b border-slate-100 py-2">
                <span>{li.description}</span>
                <span className="font-semibold">{fmtMoney(li.amount)}</span>
              </div>
            ))}
            {doc.note ? <p className="text-xs text-slate-400">{doc.note}</p> : null}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={printStatement}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
