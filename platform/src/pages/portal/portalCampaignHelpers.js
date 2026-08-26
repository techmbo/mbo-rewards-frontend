/**
 * Client portal campaign presentation — maps client-safe DTO fields only.
 * No eligibility / visibility / commission engines. No invented offers or URLs.
 */

import { displayCountry, displayText } from "../../utils/display.js";

const CHANNEL_ENUMS = new Set(["LINK", "COUPON", "COUPON_LINK", "DEEPLINK", "LINK_AND_COUPON"]);

/** Human labels for derived assignmentStatus (Wave 1). */
export const ASSIGNMENT_STATUS_LABELS = {
  CLIENT_VISIBLE: "Live",
  PROVISIONED: "Ready to publish",
  TRACKING_READY: "Tracking ready",
  COMMISSION_READY: "Commission ready",
  ASSIGNED: "Assigned",
  PAUSED: "Paused",
  REVOKED: "Revoked",
  ACTIVE: "Active",
};

export function brandName(c = {}) {
  if (c.brand && typeof c.brand === "object") {
    return c.brand.name || c.brandName || null;
  }
  return c.brandName || (typeof c.brand === "string" ? c.brand : null) || null;
}

export function brandLogoUrl(c = {}) {
  if (c.brand && typeof c.brand === "object") {
    return c.brand.logoUrl || c.brandLogoUrl || null;
  }
  return c.brandLogoUrl || null;
}

export function brandWebsiteUrl(c = {}) {
  if (c.brand && typeof c.brand === "object") {
    return c.brand.websiteUrl || c.brandWebsiteUrl || null;
  }
  return c.brandWebsiteUrl || null;
}

export function campaignName(c = {}) {
  return c.campaignName || c.name || null;
}

/** Commercial model (CPS/CPA/…) — never channel enums. */
export function commercialModelLabel(c = {}) {
  const value = c.commercialModel ?? null;
  if (value == null || value === "") return "—";
  const upper = String(value).toUpperCase();
  if (CHANNEL_ENUMS.has(upper)) return "—";
  return upper;
}

/** Distribution channel — never CPS/CPA. */
export function channelLabel(c = {}) {
  const raw = c.channelType || c.campaignType || null;
  if (raw) {
    const t = String(raw).toUpperCase();
    if (t === "CPS" || t === "CPA" || t === "CPL" || t === "CPI" || t === "CPC") {
      // Misplaced commercial model — do not show as channel.
      return "—";
    }
    if (t === "COUPON_LINK" || t === "LINK_AND_COUPON") return "Link + Coupon";
    if (t === "LINK") return "Link";
    if (t === "COUPON") return "Coupon";
    if (t === "DEEPLINK") return "Deeplink";
    return t.replaceAll("_", " ");
  }
  const ch = c.channels || {};
  const parts = [];
  if (ch.link) parts.push("Link");
  if (ch.coupon) parts.push("Coupon");
  if (ch.deeplink) parts.push("Deeplink");
  return parts.length ? parts.join(" + ") : "—";
}

export function campaignCountries(c = {}) {
  if (Array.isArray(c.countries) && c.countries.length) return c.countries.filter(Boolean);
  const primary = c.primaryCountry;
  const secondary = Array.isArray(c.secondaryCountries) ? c.secondaryCountries : [];
  return [primary, ...secondary].filter(Boolean);
}

export function countryLabel(c = {}) {
  return displayCountry(campaignCountries(c), "—");
}

/** Offer / discount — never campaign name. */
export function offerLabel(c = {}) {
  const name = campaignName(c);
  const display = c.discountDisplay ?? c.offer ?? null;
  if (display != null && String(display).trim()) {
    const text = String(display).trim();
    if (name && text === String(name).trim()) return null;
    return text;
  }
  if (c.discountPercent != null && Number.isFinite(Number(c.discountPercent))) {
    return `${Number(c.discountPercent)}% off`;
  }
  return null;
}

export function offerDisplay(c = {}) {
  return offerLabel(c) || "—";
}

/** Client-safe commission string only. */
export function commissionLabel(c = {}) {
  const commission = c.commission;
  if (commission == null) return "—";
  if (typeof commission === "string") {
    return commission.trim() || "—";
  }
  const text =
    commission.commissionDisplay ||
    commission.commissionDisplayEstimate ||
    commission.value ||
    null;
  if (text != null && String(text).trim()) return String(text).trim();
  if (commission.clientSharePercent != null && Number.isFinite(Number(commission.clientSharePercent))) {
    return `${commission.clientSharePercent}% share`;
  }
  return "—";
}

export function trackingUrl(c = {}) {
  return c.link || c.trackingUrl || c.tracking?.url || null;
}

/**
 * Tracking readiness for portal copy.
 * @returns {{ code: 'ready'|'pending'|'unavailable', label: string, url: string|null }}
 */
export function trackingState(c = {}) {
  const url = trackingUrl(c);
  const status = String(c.tracking?.status || "").toUpperCase();
  if (url) {
    return { code: "ready", label: "Available", url };
  }
  if (status === "PENDING" || status === "GENERATING" || status === "DRAFT") {
    return { code: "pending", label: "Tracking pending", url: null };
  }
  return { code: "unavailable", label: "Tracking not available", url: null };
}

export function couponCode(c = {}) {
  return c.couponCode || c.coupon?.code || null;
}

function channelToken(c = {}) {
  return String(c.channelType || c.campaignType || "").toUpperCase();
}

/** Distribution channel is coupon-first (excludes link-only). */
export function isCouponChannel(c = {}) {
  const t = channelToken(c);
  if (t.includes("COUPON") && !t.includes("LINK") && !t.includes("DEEP")) return true;
  const ch = c.channels || {};
  return ch.coupon === true && ch.link !== true && ch.deeplink !== true;
}

/** Distribution channel includes link/deeplink/affiliate. */
export function isLinkChannel(c = {}) {
  const t = channelToken(c);
  if (t.includes("COUPON") && !t.includes("LINK") && !t.includes("DEEP")) return false;
  if (t.includes("LINK") || t.includes("DEEP") || t.includes("AFFILIATE")) return true;
  const ch = c.channels || {};
  return ch.link === true || ch.deeplink === true || Boolean(trackingUrl(c));
}

/**
 * Type-aware coupon/link lines for portal tables and detail.
 * @returns {Array<{ kind: 'coupon'|'link', value: string|null, label?: string }>}
 */
export function couponLinkPresentation(c = {}) {
  const coupon = couponCode(c);
  const link = trackingUrl(c);
  const showCoupon = isCouponChannel(c) || Boolean(coupon);
  const showLink = isLinkChannel(c) || Boolean(link);
  const parts = [];

  if (showCoupon) {
    parts.push({
      kind: "coupon",
      value: coupon,
      label: coupon ? null : couponState(c).label,
    });
  }
  if (showLink) {
    parts.push({
      kind: "link",
      value: link,
      label: link ? null : trackingState(c).label,
    });
  }
  if (!parts.length) {
    if (coupon) parts.push({ kind: "coupon", value: coupon });
    else if (link) parts.push({ kind: "link", value: link });
  }
  return parts;
}

/** Primary coupon/link value for compact table cells. */
export function couponLinkPrimary(c = {}) {
  const parts = couponLinkPresentation(c);
  const couponPart = parts.find((p) => p.kind === "coupon" && p.value);
  const linkPart = parts.find((p) => p.kind === "link" && p.value);
  if (isCouponChannel(c) && !isLinkChannel(c)) {
    return couponPart || parts.find((p) => p.kind === "coupon") || null;
  }
  if (isLinkChannel(c) && !isCouponChannel(c)) {
    return linkPart || parts.find((p) => p.kind === "link") || null;
  }
  return couponPart || linkPart || parts[0] || null;
}

/**
 * @returns {{ code: string, label: string, codeValue: string|null }}
 */
export function couponState(c = {}) {
  const code = couponCode(c);
  const availability = String(c.couponAvailability || "").toUpperCase();
  if (code) {
    return { code: "assigned", label: "Assigned", codeValue: code };
  }
  if (availability === "AVAILABLE_NOT_ASSIGNED") {
    return { code: "not_assigned", label: "Not assigned", codeValue: null };
  }
  if (availability === "NOT_SUPPORTED") {
    return { code: "not_supported", label: "Not required", codeValue: null };
  }
  return { code: "unavailable", label: "Not available", codeValue: null };
}

/**
 * Prefer derived assignmentStatus; fall back to displayStatus / raw.
 * Does not infer CLIENT_VISIBLE from published alone.
 */
export function assignmentStatusCode(c = {}) {
  if (c.assignmentStatus) return String(c.assignmentStatus).toUpperCase();
  return null;
}

export function assignmentStatusLabel(c = {}) {
  const code = assignmentStatusCode(c);
  if (code && ASSIGNMENT_STATUS_LABELS[code]) return ASSIGNMENT_STATUS_LABELS[code];
  if (c.displayStatus) return String(c.displayStatus);
  if (c.campaignStatus) return String(c.campaignStatus);
  return "—";
}

export function assignmentStatusTone(c = {}) {
  const code = assignmentStatusCode(c);
  if (code === "CLIENT_VISIBLE") return "green";
  if (code === "PAUSED" || code === "COMMISSION_READY" || code === "TRACKING_READY" || code === "PROVISIONED") {
    return "amber";
  }
  if (code === "REVOKED") return "red";
  if (c.displayStatus === "Live" || c.displayStatus === "Active") return "green";
  if (c.displayStatus === "Paused" || c.displayStatus === "Expired") {
    return c.displayStatus === "Expired" ? "red" : "amber";
  }
  return "blue";
}

export function campaignStatusLabel(c = {}) {
  const s = c.campaignStatus;
  if (s == null || s === "") return "—";
  return String(s);
}

export function currencyLabel(c = {}) {
  if (c.currency == null || c.currency === "") return "—";
  return String(c.currency).toUpperCase();
}

export function categoryLabel(c = {}) {
  const primary = c.primaryCategory || c.category || null;
  const secondary = c.secondaryCategory || null;
  const parts = [primary, secondary].filter((x) => x != null && String(x).trim());
  return parts.length ? parts.join(" · ") : "—";
}

export function na(value) {
  return displayText(value, "—");
}

/**
 * Classify list load errors — never treat as empty catalog.
 */
export function classifyCampaignLoadError(err, ApiError, defaultPath) {
  const status =
    err instanceof ApiError
      ? err.status
      : Number((String(err?.message || "").match(/\((\d{3})\)/) || [])[1]) || 0;
  const path = err instanceof ApiError ? err.path : defaultPath;
  const correlationId = err instanceof ApiError ? err.correlationId : null;

  let message = "Unable to load campaigns. Please try again.";
  if (status === 401) {
    message = "Your session or API credential is invalid. Please sign in again.";
  } else if (status === 403) {
    message = "You are not authorized to view these campaigns.";
  } else if (status === 404) {
    message = "Unable to load campaigns. Please try again later.";
  } else if (status >= 500) {
    message = "Unable to load campaigns. Please try again.";
  }

  return {
    kind: "api_error",
    message,
    status: status || null,
    path,
    correlationId,
  };
}

/** Distribution capability labels from channels object. */
export function distributionFlags(c = {}) {
  const ch = c.channels || {};
  return {
    link: ch.link === true,
    coupon: ch.coupon === true,
    deeplink: ch.deeplink === true,
  };
}

export function flagLabel(ok) {
  if (ok === true) return "Available";
  if (ok === false) return "Not available";
  return "—";
}
