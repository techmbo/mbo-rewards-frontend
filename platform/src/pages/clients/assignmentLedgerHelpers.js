/**
 * Assignment ledger presentation — projection only (P1.7 Wave 3).
 * Reuses assignmentLifecycle.js; does not invent states or eligibility.
 */

import { deriveAssignmentLifecycle } from "./assignmentLifecycle.js";
import { publishReadinessOfAssignment } from "../master/masterCampaignHelpers.js";

export function ledgerLifecycle(row = {}) {
  // Prefer backend assignmentStatus when present; fall back to local projection.
  const fromBackend = row.assignmentStatus ? String(row.assignmentStatus).toUpperCase() : null;
  const projected = deriveAssignmentLifecycle(row);
  if (
    fromBackend &&
    [
      "ASSIGNED",
      "COMMISSION_READY",
      "TRACKING_READY",
      "PROVISIONED",
      "CLIENT_VISIBLE",
      "PAUSED",
      "REVOKED",
    ].includes(fromBackend)
  ) {
    return {
      code: fromBackend,
      label: projected.code === fromBackend ? projected.label : humanize(fromBackend),
      clientVisible: fromBackend === "CLIENT_VISIBLE",
      issue: projected.issue || row.blocker || null,
    };
  }
  return projected;
}

function humanize(code) {
  return String(code)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Tracking dimension — independent of assignmentStatus. */
export function trackingPresentation(row = {}) {
  if (String(row.trackingStatus || "").toUpperCase() === "REVOKED") {
    return { code: "REVOKED", label: "Revoked" };
  }
  if (row.hasTrackingUrl === true || row.trackingUrl) {
    return { code: "READY", label: "Ready" };
  }
  if (
    row.provisioning?.code === "TRACKING_PENDING" ||
    row.provisioning?.code === "PROVISIONING" ||
    row.blocker
  ) {
    return { code: "PENDING", label: "Pending" };
  }
  return { code: "MISSING", label: "Missing" };
}

/** Coupon dimension — independent of assignmentStatus. */
export function couponPresentation(row = {}) {
  if (row.couponAssigned === true || row.couponCode) {
    const status = String(row.couponStatus || "ASSIGNED").toUpperCase();
    if (status === "PENDING") return { code: "PENDING", label: "Pending" };
    return { code: "ASSIGNED", label: "Assigned" };
  }
  if (row.channels?.coupon === true) {
    return { code: "AVAILABLE", label: "Available" };
  }
  return { code: "NOT_AVAILABLE", label: "Not available" };
}

export function commercialModelLabel(row = {}) {
  const value = row.commercialModel || null;
  if (!value) return "—";
  const upper = String(value).toUpperCase();
  if (["LINK", "COUPON", "COUPON_LINK", "DEEPLINK"].includes(upper)) return "—";
  return upper;
}

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

export function commissionLedgerDisplay(row = {}) {
  if (row.commissionRuleStatus) {
    return {
      label: String(row.commissionRuleStatus),
      title: "Client commission rule status (not supplier payout).",
    };
  }
  return { label: "Not available", title: "No client commission rule on this assignment." };
}

function assignmentCanPublish(row = {}) {
  if (row.published === true) return false;
  if (String(row.status || "").toUpperCase() === "REVOKED") return false;
  const life = String(row.assignmentStatus || ledgerLifecycle(row).code || "").toUpperCase();
  if (life === "PROVISIONED") return true;
  return publishReadinessOfAssignment(row).ready;
}

/**
 * Context actions — only existing backend PATCH lifecycle + navigation.
 * Do not invent actions.
 */
export function ledgerPrimaryAction(row = {}, { canManage = false } = {}) {
  const life = ledgerLifecycle(row);
  if (life.code === "REVOKED") {
    return { kind: "view", label: "View" };
  }
  if (life.code === "PAUSED") {
    return canManage
      ? { kind: "resume", label: "Resume", mutate: { lifecycle: "published" } }
      : { kind: "view", label: "View" };
  }
  if (life.code === "CLIENT_VISIBLE") {
    return { kind: "view", label: "View" };
  }
  if (canManage && assignmentCanPublish(row)) {
    return { kind: "publish", label: "Publish", mutate: { lifecycle: "published" } };
  }
  if (life.code === "PROVISIONED") {
    return { kind: "activate", label: "Review / Activate", href: true };
  }
  if (life.code === "COMMISSION_READY" || life.code === "TRACKING_READY" || life.code === "ASSIGNED") {
    if (life.issue || row.blocker) {
      return { kind: "issue", label: "View issue" };
    }
    return { kind: "activate", label: "Provision", href: true };
  }
  return { kind: "view", label: "View" };
}

export function emptyAssignmentsMessage({ hasError, filtersActive, publishedOnly } = {}) {
  if (hasError) return "Unable to load assignments. Retry to continue.";
  if (publishedOnly) return "No published assignments match the current filters.";
  if (filtersActive) return "No assignments match the current filters.";
  return "No assignments yet.";
}

/** Page-scoped counts only — never present as global. */
export function pageScopedLifecycleCounts(rows = []) {
  const counts = {
    total: rows.length,
    ASSIGNED: 0,
    COMMISSION_READY: 0,
    TRACKING_READY: 0,
    PROVISIONED: 0,
    CLIENT_VISIBLE: 0,
    PAUSED: 0,
    REVOKED: 0,
  };
  for (const row of rows) {
    const code = ledgerLifecycle(row).code;
    if (counts[code] != null) counts[code] += 1;
  }
  return counts;
}

export function buildAssignmentListQuery(filters = {}) {
  const params = {
    search: filters.search || undefined,
    clientId: filters.clientId || undefined,
    network: filters.network || undefined,
    commercialModel: filters.commercialModel || undefined,
    channel: filters.channel || undefined,
    status: filters.status || undefined,
    lifecycle: filters.lifecycle || undefined,
    trackingStatus: filters.trackingStatus || undefined,
    couponStatus: filters.couponStatus || undefined,
    published: filters.published || undefined,
  };
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
}
