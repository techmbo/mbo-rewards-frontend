import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApi } from "../../api";
import { DataTable } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { StatusPill } from "../../components/ui/StatusPill";
import { displayMoney, displayText } from "../../utils/display";
import { formatDate, unwrap } from "./portalUtils";

/**
 * Client orders — client-safe fields only.
 */
export function PortalOrdersPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (status) params.status = status;
      if (from) params.date_from = from;
      if (to) params.date_to = to;
      const res = await fetchApi("/portal/v1/orders", params);
      setData(unwrap(res));
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const orders = data?.orders || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs font-medium text-slate-600">
          Status
          <select
            className="mt-1 block rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {["Pending", "Confirmed", "Rejected", "Payable", "Paid", "On Hold"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          From
          <input
            type="date"
            className="mt-1 block rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          To
          <input
            type="date"
            className="mt-1 block rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="rounded-lg bg-brand-800 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-900"
          onClick={load}
        >
          Apply
        </button>
        <Link to="/portal/payment-status" className="ml-auto text-sm font-medium text-brand-700 hover:underline">
          Payment Status →
        </Link>
      </div>

      {loading ? <LoadingState table rows={5} cols={6} /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && !error && orders.length === 0 ? (
        <EmptyState title="No orders" description="No orders for your account in this range." />
      ) : null}
      {!loading && !error && orders.length > 0 ? (
        <DataTable
          dense
          showColumnPicker={false}
          columns={[
            { key: "brandName", label: "Brand", render: (r) => displayText(r.brandName) },
            { key: "orderDate", label: "Order date", render: (r) => formatDate(r.orderDate) },
            {
              key: "orderStatus",
              label: "Status",
              render: (r) => <StatusPill status={r.orderStatus} />,
            },
            {
              key: "paymentStatus",
              label: "Payment",
              render: (r) => <StatusPill status={r.paymentStatus} />,
            },
            {
              key: "orderValue",
              label: "Order value",
              className: "tabular-nums",
              render: (r) => displayMoney(r.orderValue, r.currency),
            },
            {
              key: "clientCommission",
              label: "Your commission",
              className: "tabular-nums",
              render: (r) => displayMoney(r.clientCommission, r.currency),
            },
            { key: "currency", label: "Currency", render: (r) => displayText(r.currency) },
          ]}
          rows={orders}
        />
      ) : null}
    </div>
  );
}
