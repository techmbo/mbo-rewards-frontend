/**
 * Client portal payment-status presentation — formatting only.
 * No finance math. No INR invent. Withdrawals are a separate page/domain.
 */

import { displayText } from "../../utils/display.js";

const CHANNEL_ENUMS = new Set(["LINK", "COUPON", "COUPON_LINK", "DEEPLINK", "LINK_AND_COUPON"]);

export function commercialModelLabel(row = {}) {
  const value = row.commercialModel || row.campaignType || null;
  if (value == null || value === "") return "—";
  const upper = String(value).toUpperCase();
  if (CHANNEL_ENUMS.has(upper)) return "—";
  return upper;
}

export function currencyLabel(value) {
  if (value == null || value === "") return null;
  return String(value).toUpperCase();
}

export function formatMoneyMetric(value, currency = null) {
  if (value == null || value === "") return "Not available";
  const n = Number(value);
  if (!Number.isFinite(n)) return "Not available";
  if (!currency) return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString("en-IN")}`;
  }
}

export function formatCountMetric(value) {
  if (value == null || value === "") return "Not available";
  const n = Number(value);
  if (!Number.isFinite(n)) return "Not available";
  return n.toLocaleString("en-IN");
}

export function isPaymentsEmpty(payload) {
  if (!payload || typeof payload !== "object") return true;
  if (payload.dataAvailable === false || payload.dataState === "empty") return true;
  const items = payload.items || payload.payments || payload.rows || [];
  return !Array.isArray(items) || items.length === 0;
}

export function paymentItems(payload) {
  if (!payload) return [];
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.payments)) return payload.payments;
  if (Array.isArray(payload.rows)) return payload.rows;
  return [];
}

export function classifyPaymentLoadError(err, ApiError, defaultPath) {
  const status =
    err instanceof ApiError
      ? err.status
      : Number((String(err?.message || "").match(/\((\d{3})\)/) || [])[1]) || 0;
  let message = "Unable to load payment status. Please try again.";
  if (status === 401) message = "Your session or API credential is invalid. Please sign in again.";
  else if (status === 403) message = "You are not authorized to view payment status.";
  return {
    kind: "api_error",
    message,
    status: status || null,
    path: err instanceof ApiError ? err.path : defaultPath,
  };
}

export function paymentStatusLabel(status) {
  if (status == null || status === "") return "—";
  return String(status);
}

export function na(value) {
  return displayText(value, "—");
}

export const PAYMENT_CSV_HEADERS = [
  "Billing Month",
  "Billing Year",
  "Brand",
  "Campaign",
  "Commercial Model",
  "Currency",
  "Payment Status",
  "Payable Orders",
  "Your Commission",
  "Payment Confirmed",
  "Invoice / Statement",
];

export function csvRowsFromPayments(items = []) {
  return items.map((r) => [
    r.billingMonth ?? "",
    r.billingYear ?? "",
    r.brandName || "",
    r.campaignName || "",
    commercialModelLabel(r),
    r.currency || "",
    r.paymentStatus || "",
    r.payableOrders ?? "",
    r.payableCommission ?? "",
    r.paymentConfirmedDate || "",
    r.invoiceReference || r.statementId || r.settlementStatus || "",
  ]);
}
