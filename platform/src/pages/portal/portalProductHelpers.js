/**
 * Client portal products presentation — formatting only.
 * No commission math, no FX, no invented prices/images/URLs/currency.
 */

import { displayText } from "../../utils/display.js";

const CHANNEL_ENUMS = new Set(["LINK", "COUPON", "COUPON_LINK", "DEEPLINK", "LINK_AND_COUPON"]);

export function productItems(payload) {
  if (!payload) return [];
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.products)) return payload.products;
  return [];
}

export function isProductsEmpty(payload) {
  if (!payload || typeof payload !== "object") return true;
  if (payload.dataAvailable === false || payload.dataState === "empty") return true;
  return productItems(payload).length === 0;
}

export function productPagination(payload) {
  const p = payload?.pagination;
  if (p && typeof p === "object") {
    return {
      page: Number(p.page) || 1,
      pageSize: Number(p.pageSize) || Number(payload?.limit) || 25,
      total: p.total != null ? Number(p.total) : Number(payload?.total) || 0,
      totalPages: p.totalPages != null ? Number(p.totalPages) : 0,
    };
  }
  const total = Number(payload?.total) || 0;
  const pageSize = Number(payload?.limit) || 25;
  return {
    page: 1,
    pageSize,
    total,
    totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 0,
  };
}

export function brandName(row = {}) {
  return row.brandName || null;
}

export function campaignName(row = {}) {
  return row.campaignName || null;
}

export function productName(row = {}) {
  return row.productName || row.title || null;
}

export function productImageUrl(row = {}) {
  return row.productImageUrl || null;
}

export function displayPrice(row = {}) {
  if (row.salePrice != null && Number.isFinite(Number(row.salePrice))) return Number(row.salePrice);
  if (row.price != null && Number.isFinite(Number(row.price))) return Number(row.price);
  return null;
}

export function currencyLabel(value) {
  if (value == null || value === "") return null;
  return String(value).toUpperCase();
}

/** Never invent INR/USD. Missing currency → amount only or Not available. */
export function formatProductMoney(value, currency = null) {
  if (value == null || value === "") return "Not available";
  const n = Number(value);
  if (!Number.isFinite(n)) return "Not available";
  const cur = currencyLabel(currency);
  if (!cur) return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${cur} ${n.toLocaleString("en-IN")}`;
  }
}

export function commercialModelLabel(row = {}) {
  const value = row.commercialModel ?? null;
  if (value == null || value === "") return "—";
  const upper = String(value).toUpperCase();
  if (CHANNEL_ENUMS.has(upper)) return "—";
  return upper;
}

export function channelLabel(row = {}) {
  const raw = row.channel || row.campaignType || null;
  if (!raw) return "—";
  const t = String(raw).toUpperCase();
  if (["CPS", "CPA", "CPL", "CPI", "CPC"].includes(t)) return "—";
  if (t === "COUPON_LINK" || t === "LINK_AND_COUPON") return "Link + Coupon";
  if (t === "LINK") return "Link";
  if (t === "COUPON") return "Coupon";
  if (t === "DEEPLINK") return "Deeplink";
  return t.replaceAll("_", " ");
}

export function trackingUrl(row = {}) {
  return row.mboProductTrackingUrl || null;
}

export function commissionLabel(row = {}) {
  const v = row.commissionDisplay;
  if (v == null || String(v).trim() === "") return "—";
  return String(v).trim();
}

export function classifyProductLoadError(err, ApiError, defaultPath) {
  const status =
    err instanceof ApiError
      ? err.status
      : Number((String(err?.message || "").match(/\((\d{3})\)/) || [])[1]) || 0;
  let message = "Unable to load products. Please try again.";
  if (status === 401) message = "Your session or API credential is invalid. Please sign in again.";
  else if (status === 403) message = "You are not authorized to view products.";
  return {
    kind: "api_error",
    message,
    status: status || null,
    path: err instanceof ApiError ? err.path : defaultPath,
  };
}

export function na(value) {
  return displayText(value, "—");
}

export const PRODUCT_CSV_HEADERS = [
  "Brand",
  "Campaign",
  "Product",
  "Category",
  "Price",
  "Sale Price",
  "Discount %",
  "Currency",
  "Availability",
  "Commercial Model",
  "Channel",
  "Commission",
  "Tracking Link",
  "Valid From",
  "Valid Until",
];

export function csvRowsFromProducts(items = []) {
  return items.map((row) => [
    brandName(row) || "",
    campaignName(row) || "",
    productName(row) || "",
    row.productCategory || "",
    row.price != null ? String(row.price) : "",
    row.salePrice != null ? String(row.salePrice) : "",
    row.discountPercentage != null ? String(row.discountPercentage) : "",
    currencyLabel(row.currency) || "",
    row.availability || "",
    commercialModelLabel(row) === "—" ? "" : commercialModelLabel(row),
    channelLabel(row) === "—" ? "" : channelLabel(row),
    commissionLabel(row) === "—" ? "" : commissionLabel(row),
    trackingUrl(row) || "",
    row.validFrom || "",
    row.validUntil || "",
  ]);
}
