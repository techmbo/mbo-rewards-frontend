/**
 * Client Catalog presentation helpers — project backend allocation facts only.
 * No second eligibility engine. No invented commission / logos / currencies.
 */

import { displayCountry, displayText } from "../../utils/display.js";

/** Parse allocation list API body (supports nested data.items and legacy array). */
export function parseAllocationListResponse(res) {
  if (!res || typeof res !== "object") {
    return { items: [], client: null, summary: null, pagination: null, error: true };
  }
  const nested = res.data && typeof res.data === "object" && !Array.isArray(res.data) ? res.data : null;
  const items = Array.isArray(res.data)
    ? res.data
    : Array.isArray(nested?.items)
      ? nested.items
      : Array.isArray(res.items)
        ? res.items
        : [];
  return {
    items,
    client: nested?.client ?? res.client ?? null,
    summary: nested?.summary ?? res.summary ?? null,
    pagination: res.pagination ?? null,
    error: false,
  };
}

/** Commercial model (CPS/CPA/…) — never channel. */
export function commercialModelLabel(row = {}) {
  const value = row.commercialModel || row.campaignType || null;
  if (value == null || value === "") return "—";
  const upper = String(value).toUpperCase();
  // Guard: channel enums must not appear as commercial model.
  if (["LINK", "COUPON", "COUPON_LINK", "DEEPLINK", "LINK_AND_COUPON"].includes(upper)) {
    return "—";
  }
  return upper;
}

/** Distribution channel label from channelType / channels. */
export function channelLabel(row = {}) {
  if (row.channelType) {
    const t = String(row.channelType).toUpperCase();
    if (t === "COUPON_LINK") return "Link + Coupon";
    if (t === "LINK") return "Link";
    if (t === "COUPON") return "Coupon";
    if (t === "DEEPLINK") return "Deeplink";
    return t.replaceAll("_", " ");
  }
  const ch = row.channels || {};
  const parts = [];
  if (ch.link) parts.push("Link");
  if (ch.coupon) parts.push("Coupon");
  if (ch.deeplink) parts.push("Deeplink");
  return parts.length ? parts.join(" + ") : "—";
}

/**
 * Supplier campaign commission for admin catalog — not client payout.
 * Never invent 0% when backend has no value.
 */
export function supplierCommissionDisplay(row = {}) {
  const text = row.campaignCommission ?? row.commercial?.supplierCommission ?? null;
  const rules =
    row.commissionRuleCount != null
      ? Number(row.commissionRuleCount)
      : row.commercial?.commissionRuleCount != null
        ? Number(row.commercial.commissionRuleCount)
        : null;
  if ((text == null || text === "") && !(Number.isFinite(rules) && rules > 0)) {
    return { label: "Not available", title: "Supplier campaign commission not available from backend." };
  }
  const base = text != null && text !== "" ? String(text) : "Multiple rules";
  if (Number.isFinite(rules) && rules > 0) {
    return {
      label: `${base} · ${rules} rule${rules === 1 ? "" : "s"}`,
      title: "Supplier / network campaign commission (display). Not the client payout.",
    };
  }
  return {
    label: base,
    title: "Supplier / network campaign commission (display). Not the client payout.",
  };
}

/** Offer / discount — never campaign name. */
export function offerDisplay(row = {}) {
  const couponDiscount = row.coupon?.discount ?? null;
  if (couponDiscount != null && String(couponDiscount).trim()) {
    const text = displayText(couponDiscount, "").trim();
    const name = row.campaignName != null ? String(row.campaignName).trim() : "";
    if (name && text === name) return "Not available";
    return text || "Not available";
  }
  if (row.discountPercent != null && Number.isFinite(Number(row.discountPercent))) {
    return `${Number(row.discountPercent)}%`;
  }
  return "Not available";
}

export function relationshipPresentation(row = {}) {
  const raw = row.relationshipDisplayStatus || row.relationshipStatus || null;
  if (raw == null || raw === "") {
    return { code: "NEEDS_REVIEW", label: "Needs review", issue: "Relationship status not available." };
  }
  const upper = String(raw).toUpperCase();
  if (upper === "UNKNOWN" || upper === "NEEDS_REVIEW") {
    return {
      code: "NEEDS_REVIEW",
      label: row.relationshipLabel || "Needs review",
      issue: "Relationship needs review — status not verified.",
    };
  }
  return {
    code: upper,
    label:
      row.relationshipLabel ||
      (upper === "NOT_APPLIED" || upper === "NOT_JOINED"
        ? "Not Joined"
        : upper.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())),
    issue: null,
  };
}

export function eligibilityPresentation(row = {}) {
  if (row.allocationState === "ASSIGNED" || row.assignmentId) {
    return {
      code: "ASSIGNED",
      label: "Already assigned",
      primaryReason: null,
      reasons: [],
    };
  }
  if (row.eligibilityOk || row.isAssignable) {
    return { code: "ELIGIBLE", label: "Eligible", primaryReason: null, reasons: [] };
  }
  const labels = Array.isArray(row.eligibilityLabels) ? row.eligibilityLabels.filter(Boolean) : [];
  const codes = Array.isArray(row.eligibilityReasons) ? row.eligibilityReasons : [];
  const primary = row.issue || labels[0] || null;
  if (row.allocationState === "NEEDS_REVIEW" || row.eligibilityStatus === "NEEDS_REVIEW") {
    return {
      code: "NEEDS_REVIEW",
      label: "Needs review",
      primaryReason: primary,
      reasons: labels,
      codes,
    };
  }
  if (row.allocationState === "UNAVAILABLE" || row.eligibilityStatus === "UNAVAILABLE") {
    return {
      code: "UNAVAILABLE",
      label: "Unavailable",
      primaryReason: primary,
      reasons: labels,
      codes,
    };
  }
  return {
    code: "BLOCKED",
    label: "Blocked",
    primaryReason: primary,
    reasons: labels,
    codes,
  };
}

/**
 * Context-aware primary action for a catalog row.
 * Frontend display only — backend still authorizes allot.
 */
export function catalogPrimaryAction(row = {}, { canManage = false } = {}) {
  if (row.allocationState === "ASSIGNED" || row.assignmentId) {
    return { kind: "assigned", label: "Assigned", disabled: true, allowAssign: false };
  }
  if (row.isAssignable && canManage) {
    return { kind: "assign", label: "Assign", disabled: false, allowAssign: true };
  }
  if (row.allocationState === "NEEDS_REVIEW" || row.eligibilityStatus === "NEEDS_REVIEW") {
    return { kind: "review", label: "Review", disabled: false, allowAssign: false };
  }
  if (row.allocationState === "UNAVAILABLE") {
    return { kind: "details", label: "View details", disabled: false, allowAssign: false };
  }
  if (!row.eligibilityOk) {
    return { kind: "reason", label: "View reason", disabled: false, allowAssign: false };
  }
  return { kind: "details", label: "View", disabled: false, allowAssign: false };
}

export function emptyCatalogMessage(mode, { hasError = false, filtersActive = false } = {}) {
  if (hasError) return "Unable to load catalog. Retry to continue.";
  if (mode === "assigned") return "No campaigns are assigned to this client.";
  if (mode === "review") return "No draft assignments to review. Assign campaigns from Available first.";
  if (mode === "needs_review") return "No campaigns currently need review.";
  if (mode === "blocked") return "No blocked campaigns on this page.";
  if (filtersActive) {
    return "No campaigns match the current filters. Try Network = All networks, or Completeness = All.";
  }
  if (mode === "available") {
    return "No unassigned campaigns returned for this client. Check network filter or Master Catalog sync.";
  }
  return "No campaigns found.";
}

export function countryDisplay(value) {
  return displayCountry(value, "—");
}

export function currencyDisplay(value) {
  return displayText(value, "—");
}

/** Collect distinct filter options from the current page payload only. */
export function optionsFromRows(rows, keyFn) {
  const set = new Set();
  for (const row of rows || []) {
    const v = keyFn(row);
    if (v == null || v === "") continue;
    if (Array.isArray(v)) {
      v.forEach((x) => {
        if (x != null && x !== "") set.add(String(x));
      });
    } else {
      set.add(String(v));
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Build API query from catalog UI state — filters go to backend. */
export function buildAllocationQuery({ page, pageSize = 25, mode, filters }) {
  const f = filters || {};
  const params = {
    page,
    pageSize,
    search: f.search || undefined,
    network: f.network || undefined,
    commercialModel: f.commercialModel || undefined,
    channel: f.channel || undefined,
    country: f.country || undefined,
    currency: f.currency || undefined,
    relationship: f.relationship || undefined,
    eligibility: f.eligibility || undefined,
    offerType: f.offerType || undefined,
    completeness: f.completeness || undefined,
  };

  if (mode === "assigned") params.assignmentStatus = "ASSIGNED";
  else if (mode === "available") {
    params.assignmentStatus = "AVAILABLE";
    // Do not force ELIGIBLE — otherwise networks with relationship NEEDS_REVIEW
    // return an empty page (e.g. Boostiny). User can still filter eligibility.
    if (f.eligibility) params.eligibility = f.eligibility;
  } else if (mode === "needs_review") params.assignmentStatus = "NEEDS_REVIEW";
  else if (mode === "blocked") params.assignmentStatus = "BLOCKED";

  if (f.assignmentState === "ASSIGNED") params.assignmentStatus = "ASSIGNED";
  if (f.assignmentState === "AVAILABLE" || f.assignmentState === "NOT_ASSIGNED") {
    params.assignmentStatus = "AVAILABLE";
  }
  if (f.assignmentState === "PUBLISHED") params.assignmentStatus = "PUBLISHED";
  if (f.assignmentState === "PAUSED") params.assignmentStatus = "PAUSED";

  // Strip undefined
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
}

/** Client Ops v5 Type column. */
export function distributionTypeDisplay(row = {}) {
  if (row.distributionType) return row.distributionType;
  const ch = channelLabel(row);
  return ch !== "—" ? ch : "—";
}

/** Customer offer — never invent campaign name as offer. */
export function customerOfferDisplay(row = {}) {
  if (row.customerOffer != null && String(row.customerOffer).trim()) {
    return String(row.customerOffer).trim();
  }
  const fromOffer = offerDisplay(row);
  if (fromOffer && fromOffer !== "Not available") return fromOffer;
  if (row.channels?.coupon || row.coupon || row.channels?.link || row.channelType) {
    return "No Special Offer";
  }
  return "—";
}

export function couponPoolCell(value, { supportsCoupon = false } = {}) {
  if (!supportsCoupon) return "—";
  if (value == null || value === "") return "—";
  return String(value);
}

export function clientCommissionDisplay(row = {}) {
  if (row.clientCommission != null && String(row.clientCommission).trim()) {
    return String(row.clientCommission);
  }
  const share = row.commercial?.clientSharePercent ?? row.clientSharePercent;
  if (row.commercial?.commercialModel === "OFFERS_ONLY" || row.clientCommercialModel === "OFFERS_ONLY") {
    return "Offers only";
  }
  if (share != null && Number.isFinite(Number(share))) return `${Number(share)}%`;
  return "—";
}

export function formatExpiry(value) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return displayText(value, "—");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
