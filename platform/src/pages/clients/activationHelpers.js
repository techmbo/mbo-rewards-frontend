/**
 * Activation Review presentation — consumes backend onboarding/assignment facts only.
 * No second lifecycle engine. No invented commission/tracking/logos.
 */

import { ledgerLifecycle, trackingPresentation, couponPresentation } from "./assignmentLedgerHelpers.js";
import { commercialModelLabel, channelLabel } from "./assignmentLedgerHelpers.js";
import { deliveryChannelRequirements } from "./deliveryHelpers.js";

export { commercialModelLabel, channelLabel, trackingPresentation, couponPresentation, ledgerLifecycle };

function item(code, label, status, explanation = null, source = null) {
  return { code, label, status, explanation, source };
}

/**
 * Per-assignment activation checklist from existing facts.
 * status: ready | pending | blocked | needs_review | not_required | not_available
 */
export function buildAssignmentActivationChecklist(row = {}, client = {}) {
  const life = ledgerLifecycle(row);
  const tracking = trackingPresentation(row);
  const coupon = couponPresentation(row);
  const rel = String(row.relationshipStatus || "").toUpperCase();
  const campaignStatus = String(row.campaignStatus || row.canonicalCampaign?.status || "").toUpperCase();
  const merchantId = row.merchantId || row.canonicalCampaign?.merchant?.id || null;
  const clientCountry = client.country || null;
  const clientCurrency = client.currency || null;
  const campaignCountries = Array.isArray(row.campaignCountries)
    ? row.campaignCountries
    : Array.isArray(row.canonicalCampaign?.countries)
      ? row.canonicalCampaign.countries
      : [];
  const campaignCurrency = row.campaignCurrency || row.canonicalCampaign?.defaultCurrency || null;

  const countryCompatible =
    !clientCountry ||
    !campaignCountries.length ||
    campaignCountries.map((c) => String(c).toUpperCase()).includes(String(clientCountry).toUpperCase());

  const currencyCompatible =
    !clientCurrency ||
    !campaignCurrency ||
    String(clientCurrency).toUpperCase() === String(campaignCurrency).toUpperCase();

  const commissionEffective = String(row.commissionRuleStatus || "").toUpperCase() === "EFFECTIVE";
  const hasCommissionRule = Boolean(row.commissionRuleStatus || (row.commissionRules || []).length);
  const trackingReady = tracking.code === "READY";
  const couponOk =
    coupon.code === "ASSIGNED" ||
    coupon.code === "NOT_AVAILABLE" ||
    coupon.code === "AVAILABLE";

  const checks = [
    item(
      "CLIENT_ACTIVE",
      "Client active",
      client.status === "ACTIVE" ? "ready" : "pending",
      client.status === "ACTIVE" ? null : `Client status is ${client.status || "not ACTIVE"}.`,
      "client.status",
    ),
    item(
      "CLIENT_COUNTRY",
      "Country configured",
      clientCountry ? "ready" : "not_available",
      clientCountry ? null : "Client country is not set.",
      "client.country",
    ),
    item(
      "CLIENT_CURRENCY",
      "Currency configured",
      clientCurrency ? "ready" : "not_available",
      clientCurrency ? null : "Client currency is not set.",
      "client.currency",
    ),
    item(
      "CLIENT_COMMERCIAL",
      "Commercial model configured",
      client.commercialModel || row.clientCommercialModel ? "ready" : "blocked",
      client.commercialModel || row.clientCommercialModel
        ? null
        : "Commercial model is required before provision/activation.",
      "client.commercialModel",
    ),
    item(
      "CAMPAIGN_ACTIVE",
      "Campaign active",
      campaignStatus === "ACTIVE" || campaignStatus === "PUBLISHED"
        ? "ready"
        : campaignStatus
          ? "needs_review"
          : "not_available",
      campaignStatus ? `Campaign status: ${campaignStatus}` : "Campaign status not available.",
      "supplierCampaign.campaignStatus / canonical.status",
    ),
    item(
      "MERCHANT_LINKED",
      "Merchant linked",
      merchantId ? "ready" : "needs_review",
      merchantId ? null : "Campaign is not linked to a recognized merchant.",
      "canonicalCampaign.merchantId",
    ),
    item(
      "RELATIONSHIP",
      "Publisher relationship",
      rel === "JOINED" || rel === "APPROVED"
        ? "ready"
        : !rel || rel === "UNKNOWN"
          ? "needs_review"
          : "needs_review",
      row.relationshipLabel ||
        (rel ? `Relationship: ${rel}` : "Publisher relationship has not been confirmed."),
      "campaignSource.relationshipStatus",
    ),
    item(
      "COUNTRY_COMPAT",
      "Country compatible",
      !clientCountry || !campaignCountries.length
        ? "not_available"
        : countryCompatible
          ? "ready"
          : "blocked",
      !clientCountry || !campaignCountries.length
        ? "Country compatibility cannot be verified (missing client or campaign country)."
        : countryCompatible
          ? null
          : `Client country ${clientCountry} is not in campaign countries (${campaignCountries.join(", ")}).`,
      "client.country vs campaign.countries",
    ),
    item(
      "CURRENCY_COMPAT",
      "Currency compatible",
      !clientCurrency || !campaignCurrency
        ? "not_available"
        : currencyCompatible
          ? "ready"
          : "blocked",
      !clientCurrency || !campaignCurrency
        ? "Currency compatibility cannot be verified (missing client or campaign currency)."
        : currencyCompatible
          ? null
          : `Client currency: ${clientCurrency}. Campaign currency: ${campaignCurrency}.`,
      "client.currency vs campaign currency",
    ),
    item(
      "COMMISSION_RULE",
      "Client commission rule exists",
      hasCommissionRule ? "ready" : "blocked",
      hasCommissionRule ? null : "No client commission rule on this assignment.",
      "client_commission_rules",
    ),
    item(
      "COMMISSION_EFFECTIVE",
      "Commission rule EFFECTIVE",
      commissionEffective ? "ready" : hasCommissionRule ? "pending" : "blocked",
      commissionEffective
        ? null
        : hasCommissionRule
          ? `Commission rule status: ${row.commissionRuleStatus}`
          : "Commission rule missing.",
      "client_commission_rules.status",
    ),
    item(
      "TRACKING",
      "MBO tracking link",
      trackingReady ? "ready" : tracking.code === "PENDING" ? "pending" : "blocked",
      trackingReady
        ? null
        : tracking.code === "PENDING"
          ? "Tracking destination / link generation is pending."
          : "MBO tracking link is not available.",
      "tracking_links.mbo_tracking_url",
    ),
    item(
      "COUPON",
      "Coupon",
      coupon.code === "ASSIGNED"
        ? "ready"
        : coupon.code === "NOT_AVAILABLE"
          ? "not_required"
          : coupon.code === "AVAILABLE"
            ? "pending"
            : "not_available",
      coupon.code === "ASSIGNED"
        ? null
        : coupon.code === "NOT_AVAILABLE"
          ? "Coupon not required for this channel."
          : "Coupon not assigned yet.",
      "client_coupon_assignments",
    ),
    item(
      "DISTRIBUTION",
      "Distribution ready (tracking or coupon)",
      trackingReady || coupon.code === "ASSIGNED" ? "ready" : "pending",
      trackingReady || coupon.code === "ASSIGNED"
        ? null
        : "Need usable tracking link and/or assigned coupon before publication.",
      "visibility asset gate",
    ),
    item(
      "PUBLISHED",
      "Published",
      row.published === true ? "ready" : "pending",
      row.published === true ? null : "Assignment is not published yet.",
      "client_campaign_assignments.published",
    ),
    item(
      "CLIENT_VISIBLE",
      "Client visible",
      life.clientVisible ? "ready" : "pending",
      life.clientVisible
        ? "Meets published + ACTIVE + asset projection (client must also be ACTIVE for API)."
        : `Current assignment status: ${life.code}.`,
      "assignmentStatus / P0 visibility",
    ),
  ];

  return checks;
}

/** Collect blockers / needs_review items for an assignment. */
export function collectAssignmentBlockers(row = {}, client = {}) {
  return buildAssignmentActivationChecklist(row, client).filter((c) =>
    ["blocked", "needs_review", "pending"].includes(c.status),
  );
}

export function readinessPresentation(row = {}, client = {}) {
  if (String(row.status || "").toUpperCase() === "REVOKED") {
    return { code: "REVOKED", label: "Revoked", blockers: [] };
  }
  if (String(row.status || "").toUpperCase() === "PAUSED") {
    return { code: "PAUSED", label: "Paused", blockers: [] };
  }
  const life = ledgerLifecycle(row);
  if (life.clientVisible) {
    return { code: "CLIENT_VISIBLE", label: "Client visible", blockers: [] };
  }
  const checks = buildAssignmentActivationChecklist(row, client);
  const blocked = checks.filter((c) => c.status === "blocked");
  if (blocked.length) {
    return {
      code: "BLOCKED",
      label: "Blocked",
      blockers: blocked,
      primary: blocked[0],
    };
  }
  const review = checks.filter((c) => c.status === "needs_review");
  if (review.length) {
    return {
      code: "NEEDS_REVIEW",
      label: "Needs review",
      blockers: review,
      primary: review[0],
    };
  }
  if (life.code === "PROVISIONED") {
    return { code: "PROVISIONED", label: "Provisioned", blockers: [], primary: null };
  }
  const pending = checks.filter((c) => c.status === "pending");
  if (pending.length) {
    return {
      code: "PENDING",
      label: "Pending",
      blockers: pending,
      primary: pending[0],
    };
  }
  return { code: life.code, label: life.label, blockers: [], primary: null };
}

/** Client-level activation block details (string or object). */
export function normalizeActivationBlocks(blocks = [], details = []) {
  if (Array.isArray(details) && details.length) {
    return details.map((d) =>
      typeof d === "string"
        ? { code: "ACTIVATION_BLOCKED", message: d, severity: "blocked" }
        : {
            code: d.code || "ACTIVATION_BLOCKED",
            message: d.message || d.label || String(d),
            severity: d.severity || "blocked",
          },
    );
  }
  return (blocks || []).map((b) =>
    typeof b === "string"
      ? { code: "ACTIVATION_BLOCKED", message: b, severity: "blocked" }
      : {
          code: b.code || "ACTIVATION_BLOCKED",
          message: b.message || b.label || String(b),
          severity: b.severity || "blocked",
        },
  );
}

export function activationSummaryCounts(assignments = [], client = {}) {
  const rows = (assignments || []).filter((a) => String(a.status || "").toUpperCase() !== "REVOKED");
  const counts = {
    totalAssigned: rows.length,
    readyForActivation: 0,
    needsReview: 0,
    blocked: 0,
    provisioned: 0,
    clientVisible: 0,
    paused: 0,
  };
  for (const row of rows) {
    const ready = readinessPresentation(row, client);
    if (ready.code === "CLIENT_VISIBLE") counts.clientVisible += 1;
    else if (ready.code === "PROVISIONED") counts.provisioned += 1;
    else if (ready.code === "BLOCKED") counts.blocked += 1;
    else if (ready.code === "NEEDS_REVIEW") counts.needsReview += 1;
    else if (ready.code === "PAUSED") counts.paused += 1;
    else if (ready.code === "PENDING" || ready.code === "ASSIGNED" || ready.code === "COMMISSION_READY" || ready.code === "TRACKING_READY") {
      counts.readyForActivation += 1;
    }
  }
  return counts;
}

export function filterActivationAssignments(rows = [], filters = {}, client = {}) {
  let out = [...rows];
  const f = filters || {};
  const q = String(f.search || "").trim().toLowerCase();
  if (q) {
    out = out.filter((r) => {
      const hay = [
        r.brandName,
        r.canonicalCampaign?.displayName,
        r.networkSource,
        r.campaignName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }
  if (f.network) {
    out = out.filter((r) => String(r.networkSource || "").toUpperCase() === String(f.network).toUpperCase());
  }
  if (f.commercialModel) {
    out = out.filter(
      (r) => String(r.commercialModel || "").toUpperCase() === String(f.commercialModel).toUpperCase(),
    );
  }
  if (f.channel) {
    const ch = String(f.channel).toUpperCase();
    out = out.filter((r) => {
      if (ch === "COUPON_LINK" || ch === "LINK_AND_COUPON") {
        return r.channels?.link && r.channels?.coupon;
      }
      return String(r.channelType || "").toUpperCase() === ch;
    });
  }
  if (f.lifecycle) {
    out = out.filter((r) => ledgerLifecycle(r).code === String(f.lifecycle).toUpperCase());
  }
  if (f.trackingStatus) {
    out = out.filter((r) => trackingPresentation(r).code === String(f.trackingStatus).toUpperCase());
  }
  if (f.couponStatus) {
    out = out.filter((r) => couponPresentation(r).code === String(f.couponStatus).toUpperCase());
  }
  if (f.published === "true") out = out.filter((r) => r.published === true);
  if (f.published === "false") out = out.filter((r) => r.published !== true);
  if (f.relationship) {
    const want = String(f.relationship).toUpperCase();
    out = out.filter((r) => {
      const rel = String(r.relationshipStatus || "").toUpperCase();
      if (want === "NEEDS_REVIEW") return !rel || rel === "UNKNOWN";
      return rel === want;
    });
  }
  if (f.readiness) {
    const want = String(f.readiness).toUpperCase();
    out = out.filter((r) => readinessPresentation(r, client).code === want);
  }
  return out;
}

export function checklistStatusTone(status) {
  if (status === "ready") return "ACTIVE";
  if (status === "pending") return "PENDING";
  if (status === "blocked") return "BLOCKED";
  if (status === "needs_review") return "NEEDS_REVIEW";
  if (status === "not_required") return "NOT_AVAILABLE";
  return "NOT_AVAILABLE";
}

export function checklistStatusLabel(status) {
  if (status === "ready") return "Ready";
  if (status === "pending") return "Pending";
  if (status === "blocked") return "Blocked";
  if (status === "needs_review") return "Needs review";
  if (status === "not_required") return "Not required";
  return "Not available";
}

/**
 * Client Ops v5 — global Activation Review check cards from live onboarding state.
 * Pass/fail and requirements come from GET /clients/:id/onboarding (checklist + facts).
 */
export function buildV5ActivationChecks(onboarding = {}) {
  const client = onboarding.client || {};
  const checklist = onboarding.checklist || {};
  const apiKeys = Array.isArray(onboarding.apiKeys) ? onboarding.apiKeys : [];
  const portalUsers = Array.isArray(onboarding.portalUsers) ? onboarding.portalUsers : [];
  const assignments = Array.isArray(onboarding.assignments)
    ? onboarding.assignments.filter((a) => String(a.status || "").toUpperCase() !== "REVOKED")
    : [];

  const deliveryMethod = client.deliveryMethod || onboarding.deliveryMethod || "API_AND_PORTAL";
  const derived = deliveryChannelRequirements(deliveryMethod);
  // Prefer backend checklist flags when present (they already apply delivery method).
  const needsApi = checklist.needsApi != null ? Boolean(checklist.needsApi) : derived.needsApi;
  const needsPortal = checklist.needsPortal != null ? Boolean(checklist.needsPortal) : derived.needsPortal;
  const deliveryLabel = derived.label;

  const publishedCount = assignments.filter((a) => a.published === true).length;
  const assignedCount = assignments.length;
  const activeSandbox = apiKeys.filter(
    (k) => k.isActive !== false && String(k.environment || "").toUpperCase() === "SANDBOX",
  );
  const activeProduction = apiKeys.filter(
    (k) =>
      k.isActive !== false &&
      (!k.environment || String(k.environment).toUpperCase() === "PRODUCTION"),
  );
  const activePortalAdmins = portalUsers.filter((u) => u.isActive !== false);
  const agreementStatus = String(client.agreementStatus || "").toUpperCase() || "NONE";
  const profilePassed = Boolean(client?.name && client?.country);

  function card(title, required, passed, description) {
    const status = required ? (passed ? "passed" : "pending") : "not_required";
    return {
      title,
      status,
      required,
      passed: !required || passed,
      description,
    };
  }

  const checks = [
    card(
      "Profile",
      true,
      profilePassed,
      profilePassed
        ? `${client.name}${client.country ? ` · ${client.country}` : ""}${client.currency ? ` · ${client.currency}` : ""}`
        : "Required profile fields incomplete (name and country).",
    ),
    card(
      "Agreement",
      true,
      Boolean(checklist.agreementSigned),
      checklist.agreementSigned
        ? `Signed agreement on file${client.agreementEffectiveAt ? ` (effective ${String(client.agreementEffectiveAt).slice(0, 10)})` : ""}.`
        : `Agreement status: ${agreementStatus}. Signed agreement required.`,
    ),
    card(
      "Commercials",
      true,
      Boolean(checklist.commercialConfigured),
      checklist.commercialConfigured
        ? `Commercial model: ${client.commercialModel}${
            client.clientSharePercent != null ? ` · client share ${client.clientSharePercent}%` : ""
          }`
        : "Client commercial rule not configured.",
    ),
    card(
      "Campaigns",
      true,
      Boolean(checklist.assignmentsPublished),
      checklist.assignmentsPublished
        ? `${publishedCount} published of ${assignedCount} assigned campaign(s).`
        : assignedCount
          ? `${assignedCount} assigned, none published yet.`
          : "At least one published campaign required.",
    ),
    card(
      "Sandbox API",
      needsApi,
      Boolean(checklist.sandboxConfigured),
      needsApi
        ? checklist.sandboxConfigured
          ? `${activeSandbox.length} active sandbox key(s).`
          : "Sandbox API key required for API delivery."
        : `Not required by ${deliveryLabel}.`,
    ),
    card(
      "Production API",
      needsApi,
      Boolean(checklist.apiKeyIssued),
      needsApi
        ? checklist.apiKeyIssued
          ? `${activeProduction.length} active production key(s).`
          : "Production must be active for API delivery."
        : `Not required by ${deliveryLabel}.`,
    ),
    card(
      "Portal Admin",
      needsPortal,
      Boolean(checklist.administratorConfigured),
      needsPortal
        ? checklist.administratorConfigured
          ? `${activePortalAdmins.length} active portal user(s).`
          : "Active Client Admin required for portal delivery."
        : `Not required by ${deliveryLabel}.`,
    ),
  ];

  const blocked = checks.some((item) => item.required && !item.passed);

  return {
    checks,
    deliveryMethod,
    deliveryLabel,
    blocked,
    allRequiredPassed: !blocked,
  };
}

export function v5CheckStatusLabel(status) {
  if (status === "passed") return "Passed";
  if (status === "pending") return "Pending";
  return "Not Required";
}

export function v5CheckStatusClass(status) {
  if (status === "passed") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "pending") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-slate-200 bg-slate-100 text-slate-600";
}
