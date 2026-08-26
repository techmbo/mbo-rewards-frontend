/**
 * Client portal performance presentation — formatting only.
 * No business KPI math. No invented zeros/currency.
 */

import { displayText } from "../../utils/display.js";

export function channelLabel(value) {
  if (value == null || value === "") return "—";
  const v = String(value).toUpperCase();
  if (v === "LINK") return "Link";
  if (v === "COUPON") return "Coupon";
  if (v === "LINK_AND_COUPON" || v === "COUPON_LINK") return "Link + Coupon";
  if (v === "DEEPLINK") return "Deeplink";
  // Reject commercial models mistaken as channel
  if (["CPS", "CPA", "CPL", "CPI", "CPC"].includes(v)) return "—";
  return "—";
}

export function formatMetric(value, { kind = "number", currency = null } = {}) {
  if (value == null || value === "") return "Not available";
  if (kind === "money") {
    if (!currency) {
      const n = Number(value);
      return Number.isFinite(n) ? n.toLocaleString("en-IN") : "Not available";
    }
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(Number(value));
    } catch {
      return `${currency} ${Number(value).toLocaleString("en-IN")}`;
    }
  }
  const n = Number(value);
  if (!Number.isFinite(n)) return "Not available";
  return n.toLocaleString("en-IN");
}

export function currencyLabel(value) {
  if (value == null || value === "") return null;
  return String(value).toUpperCase();
}

export function classifyPerformanceLoadError(err, ApiError, defaultPath) {
  const status =
    err instanceof ApiError
      ? err.status
      : Number((String(err?.message || "").match(/\((\d{3})\)/) || [])[1]) || 0;
  const path = err instanceof ApiError ? err.path : defaultPath;
  let message = "Unable to load performance. Please try again.";
  if (status === 401) {
    message = "Your session or API credential is invalid. Please sign in again.";
  } else if (status === 403) {
    message = "You are not authorized to view this performance data.";
  } else if (status >= 500) {
    message = "Unable to load performance. Please try again.";
  }
  return {
    kind: "api_error",
    message,
    status: status || null,
    path,
  };
}

/** True when backend reports no DailyReport population (not the same as real zeros). */
export function isPerformanceEmpty(payload) {
  if (!payload || typeof payload !== "object") return true;
  if (payload.dataAvailable === false || payload.dataState === "empty") return true;
  const items = payload.items || payload.rows || [];
  return !Array.isArray(items) || items.length === 0;
}

export function performanceItems(payload) {
  if (!payload) return [];
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.rows)) return payload.rows;
  return [];
}

export function kpiValue(kpis, key) {
  if (!kpis || typeof kpis !== "object") return null;
  return kpis[key] ?? null;
}

export function na(value) {
  return displayText(value, "—");
}

export function csvRowsFromItems(items = []) {
  return items.map((r) => [
    r.date || "",
    r.brandName || r.brand || "",
    r.campaignName || r.campaign || "",
    channelLabel(r.channelType || r.campaignType),
    r.couponCode || "",
    r.linkClicks ?? r.clicks ?? "",
    r.grossOrders ?? "",
    r.netOrders ?? "",
    r.cancelOrders ?? "",
    r.confirmedOrders ?? "",
    r.grossOrderValue ?? "",
    r.netOrderValue ?? r.orderValue ?? "",
    r.clientCommission ?? r.approvedCommission ?? "",
    r.pendingClientCommission ?? r.pendingCommission ?? "",
    r.country || "",
    r.currency || "",
  ]);
}

export const PERFORMANCE_CSV_HEADERS = [
  "Date",
  "Brand",
  "Campaign",
  "Channel",
  "Coupon",
  "Link Clicks",
  "Gross Orders",
  "Net Orders",
  "Cancel Orders",
  "Confirmed Orders",
  "Gross Order Value",
  "Net Order Value",
  "Client Commission",
  "Pending Client Commission",
  "Country",
  "Currency",
];
