import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, CLIENT_API, fetchApi } from "../../api";
import { Modal } from "../../components/ui/Modal";
import { StatusPill } from "../../components/ui/StatusPill";
import { exportCsv, formatDate, unwrap } from "./portalUtils";
import {
  PAYMENT_CSV_HEADERS,
  classifyPaymentLoadError,
  commercialModelLabel,
  csvRowsFromPayments,
  currencyLabel,
  formatCountMetric,
  formatMoneyMetric,
  isPaymentsEmpty,
  na,
  paymentItems,
} from "./portalPaymentHelpers";

function Kpi({ label, value, meta }) {
  return (
    <div className="relative overflow-hidden rounded-[17px] border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="relative z-[1]">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <div className="mt-2.5 text-[22px] font-extrabold tracking-tight text-slate-900">{value}</div>
        <div className="mt-1 text-xs text-slate-500">{meta}</div>
      </div>
    </div>
  );
}

/**
 * Client payment STATUS — GET /api/v1/client/payments (05E client-safe).
 * Separate from Withdrawals (/portal/v1/payments).
 */
export function PortalPaymentStatusPage() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [billingMonth, setBillingMonth] = useState("");
  const [billingYear, setBillingYear] = useState("");
  const [brand, setBrand] = useState("");
  const [currency, setCurrency] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [applied, setApplied] = useState({
    billingMonth: "",
    billingYear: "",
    brand: "",
    currency: "",
    paymentStatus: "",
  });
  const [detail, setDetail] = useState(null);

  const load = useCallback(async (filters = applied) => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = { pageSize: 100 };
      if (filters.billingMonth) params.billing_month = filters.billingMonth;
      if (filters.billingYear) params.billing_year = filters.billingYear;
      if (filters.brand.trim()) params.brand = filters.brand.trim();
      if (filters.currency.trim()) params.currency = filters.currency.trim().toUpperCase();
      if (filters.paymentStatus.trim()) params.payment_status = filters.paymentStatus.trim();

      const res = await fetchApi(CLIENT_API.payments, params);
      const data = unwrap(res);
      if (!data || typeof data !== "object") {
        setLoadError({
          kind: "api_error",
          message: "Unable to load payment status. Please try again.",
          status: null,
          path: CLIENT_API.payments,
        });
        setPayload(null);
        return;
      }
      setPayload(data);
    } catch (err) {
      setLoadError(classifyPaymentLoadError(err, ApiError, CLIENT_API.payments));
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [applied]);

  useEffect(() => {
    load();
  }, [load]);

  function applyFilters() {
    const next = { billingMonth, billingYear, brand, currency, paymentStatus };
    setApplied(next);
    load(next);
  }

  const items = useMemo(() => paymentItems(payload), [payload]);
  const empty = isPaymentsEmpty(payload);
  const kpis = payload?.kpis || {};
  const cur = currencyLabel(kpis.currency || payload?.client?.currency);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sky-200 bg-sky-50/60 px-4 py-3 text-sm text-sky-950">
        <strong>Payment Status</strong> shows billing-period client commission readiness (05E). To cash out, use{" "}
        <Link className="font-semibold underline" to="/portal/payments">
          Withdrawals
        </Link>
        . Source: <code className="font-mono text-xs">GET /api/v1/client/payments</code>.
      </div>

      <p className="text-xs text-slate-400">
        Grain: month × brand × campaign source × commercial model × currency × payment status. Amounts are your
        client commission only — never supplier receivable. Link clicks are not available on this grain.
      </p>

      <div className="flex flex-wrap items-end gap-2">
        <input
          className="w-24 rounded-[10px] border border-slate-200 px-3 py-2 text-sm"
          placeholder="Month"
          value={billingMonth}
          onChange={(e) => setBillingMonth(e.target.value)}
        />
        <input
          className="w-28 rounded-[10px] border border-slate-200 px-3 py-2 text-sm"
          placeholder="Year"
          value={billingYear}
          onChange={(e) => setBillingYear(e.target.value)}
        />
        <input
          className="min-w-[120px] rounded-[10px] border border-slate-200 px-3 py-2 text-sm"
          placeholder="Brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
        <input
          className="w-24 rounded-[10px] border border-slate-200 px-3 py-2 text-sm"
          placeholder="Currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        />
        <select
          className="rounded-[10px] border border-slate-200 px-3 py-2 text-sm"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Payable">Payable</option>
          <option value="Paid">Paid</option>
          <option value="On Hold">On Hold</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button
          type="button"
          className="rounded-[10px] border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold"
          onClick={applyFilters}
        >
          Apply
        </button>
        <button
          type="button"
          className="rounded-[10px] border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold"
          disabled={loading || Boolean(loadError) || empty}
          onClick={() => exportCsv("client-payment-status.csv", [PAYMENT_CSV_HEADERS, ...csvRowsFromPayments(items)])}
        >
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Your commission (filter)"
          value={formatMoneyMetric(kpis.payableCommissionTotal, cur)}
          meta={empty ? "No payment data available" : cur ? `Currency ${cur}` : "Currency not available"}
        />
        <Kpi
          label="Pending / open"
          value={formatMoneyMetric(kpis.pendingCommissionTotal, cur)}
          meta={empty ? "No payment data available" : "Backend aggregate"}
        />
        <Kpi
          label="Paid"
          value={formatMoneyMetric(kpis.paidCommissionTotal, cur)}
          meta={empty ? "No payment data available" : "Backend aggregate"}
        />
        <Kpi
          label="Orders in filter"
          value={formatCountMetric(kpis.payableOrdersTotal)}
          meta={empty ? "No payment data available" : "Sum of row order counts"}
        />
      </div>

      <div className="rounded-[17px] border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Payment status</h3>
          <p className="mt-1 text-xs text-slate-500">
            {payload?.client?.name
              ? `Billing-period commission for ${payload.client.name}.`
              : "Billing-period commission for your organisation."}
          </p>
        </div>
        <div className="overflow-x-auto p-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-400">Loading payment status…</p>
          ) : loadError ? (
            <div className="space-y-2 py-10 text-center" role="alert">
              <p className="text-sm font-semibold text-rose-600">{loadError.message}</p>
              <button
                type="button"
                className="rounded-[10px] border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                onClick={() => load()}
              >
                Try again
              </button>
            </div>
          ) : empty ? (
            <p className="py-12 text-center text-sm text-slate-400" data-state="empty">
              No payment data available.
            </p>
          ) : (
            <table
              className="w-full min-w-[1000px] text-left text-xs"
              data-state="ok"
              data-source="client-api-payments"
            >
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  {[
                    "Month",
                    "Year",
                    "Brand",
                    "Campaign",
                    "Commercial model",
                    "Currency",
                    "Status",
                    "Orders",
                    "Your commission",
                    "Confirmed",
                    "",
                  ].map((h) => (
                    <th key={h || "a"} className="border-b border-slate-200 px-3 py-2.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id || `${r.billingYear}-${r.billingMonth}-${r.brandName}-${r.paymentStatus}`} className="border-b border-slate-100">
                    <td className="px-3 py-3">{na(r.billingMonth)}</td>
                    <td className="px-3 py-3">{na(r.billingYear)}</td>
                    <td className="px-3 py-3">{na(r.brandName)}</td>
                    <td className="px-3 py-3">{na(r.campaignName)}</td>
                    <td className="px-3 py-3">{commercialModelLabel(r)}</td>
                    <td className="px-3 py-3">{currencyLabel(r.currency) || "—"}</td>
                    <td className="px-3 py-3">
                      <StatusPill status={r.paymentStatus} />
                    </td>
                    <td className="px-3 py-3 tabular-nums">{formatCountMetric(r.payableOrders)}</td>
                    <td className="px-3 py-3 tabular-nums">
                      {formatMoneyMetric(r.payableCommission, currencyLabel(r.currency) || cur)}
                    </td>
                    <td className="px-3 py-3">{formatDate(r.paymentConfirmedDate)}</td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
                        onClick={() => setDetail(r)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={Boolean(detail)} title="Payment detail" onClose={() => setDetail(null)}>
        {detail ? (
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            {[
              ["Billing month", na(detail.billingMonth)],
              ["Billing year", na(detail.billingYear)],
              ["Brand", na(detail.brandName)],
              ["Campaign", na(detail.campaignName)],
              ["Network", "Not available"],
              ["Commercial model", commercialModelLabel(detail)],
              ["Payment status", na(detail.paymentStatus)],
              ["Currency", currencyLabel(detail.currency) || "Not available"],
              ["Payable orders", formatCountMetric(detail.payableOrders)],
              [
                "Your commission",
                formatMoneyMetric(detail.payableCommission, currencyLabel(detail.currency) || cur),
              ],
              ["Link clicks", "Not available"],
              ["Payment confirmed", formatDate(detail.paymentConfirmedDate)],
              ["Invoice / statement", na(detail.invoiceReference || detail.settlementStatus)],
              ["Commission source", na(detail.commissionSource)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
                <span className="block text-xs text-slate-400">{label}</span>
                <strong className="mt-1 block text-xs text-slate-800">{value}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
