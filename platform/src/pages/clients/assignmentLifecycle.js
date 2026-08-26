/**
 * Map backend assignment + provisioning facts → admin Client Module lifecycle labels.
 * Single source aligned with P0 assignmentVisibilityTruth — no second state machine.
 */

export function deriveAssignmentLifecycle(row = {}) {
  const status = String(row.status || "").toUpperCase();
  const published = row.published === true;
  const provisioning = row.provisioning || {};
  const commissionStatus = String(
    row.commissionRuleStatus ||
      (provisioning.commercialReady === true ? "EFFECTIVE" : "") ||
      "",
  ).toUpperCase();
  const hasCommission =
    row.commissionRuleStatus != null ||
    provisioning.commercialReady === true ||
    provisioning.hasCommissionRule === true;
  const commissionEffective =
    commissionStatus === "EFFECTIVE" ||
    String(row.commissionRuleStatus || "").toUpperCase() === "EFFECTIVE";
  const trackingReady =
    row.hasTrackingUrl === true ||
    provisioning.trackingReady === true ||
    Boolean(row.trackingLinks?.some?.((t) => t.mboTrackingUrl));
  const couponReady =
    row.couponAssigned === true ||
    Boolean(row.couponAssignments?.length) ||
    row.couponStatus === "ACTIVE" ||
    row.couponStatus === "ASSIGNED";

  if (status === "REVOKED") {
    return { code: "REVOKED", label: "Revoked", clientVisible: false };
  }
  if (status === "PAUSED") {
    return { code: "PAUSED", label: "Paused", clientVisible: false };
  }
  if (published && status === "ACTIVE" && (trackingReady || couponReady)) {
    return { code: "CLIENT_VISIBLE", label: "Client visible", clientVisible: true };
  }
  if (commissionEffective && (trackingReady || couponReady) && !published) {
    return { code: "PROVISIONED", label: "Provisioned (not published)", clientVisible: false };
  }
  if (trackingReady && !commissionEffective) {
    return { code: "TRACKING_READY", label: "Tracking ready", clientVisible: false };
  }
  if (commissionEffective && !trackingReady && !couponReady) {
    return {
      code: "COMMISSION_READY",
      label: "Commission ready",
      clientVisible: false,
      issue: provisioning.issue || "Tracking pending",
    };
  }
  if (status === "ASSIGNED" || status === "ACTIVE") {
    return {
      code: "ASSIGNED",
      label: "Assigned",
      clientVisible: false,
      issue: provisioning.issue || null,
    };
  }
  return { code: status || "UNKNOWN", label: status || "Unknown", clientVisible: false };
}

/** Eligibility / allocation row from catalog — projection only. */
export function deriveEligibilityLifecycle(row = {}) {
  if (row.allocationState === "ASSIGNED" || row.assignmentId || row.assignment) {
    return deriveAssignmentLifecycle({
      status: row.assignment?.status || row.assignmentStatus || "ASSIGNED",
      published: row.assignment?.published === true || row.assignmentPublished === true,
      hasTrackingUrl: row.hasTrackingUrl === true,
      commissionRuleStatus: row.commissionRuleStatus || null,
      couponAssigned: row.couponAssigned === true || Boolean(row.coupon?.code),
      provisioning: row.assignment?.provisioning || row.provisioning,
    });
  }
  if (row.eligibilityOk || row.isAssignable) {
    return { code: "ELIGIBLE", label: "Eligible", clientVisible: false };
  }
  if (row.allocationState === "NEEDS_REVIEW" || row.eligibilityStatus === "NEEDS_REVIEW") {
    return {
      code: "NEEDS_REVIEW",
      label: "Needs review",
      clientVisible: false,
      issue: row.issue || null,
    };
  }
  if (row.allocationState === "UNAVAILABLE" || row.eligibilityStatus === "UNAVAILABLE") {
    return {
      code: "UNAVAILABLE",
      label: "Unavailable",
      clientVisible: false,
      issue: row.issue || null,
    };
  }
  return {
    code: "BLOCKED",
    label: "Blocked",
    clientVisible: false,
    issue: row.issue || row.eligibilityLabel || null,
  };
}

export function commercialDisplayLabel(model, sharePercent) {
  if (model === "OFFERS_ONLY") return "Offers Only — Client 0% (estimate)";
  if (model === "OFFERS_PLUS_COMMISSION") {
    const share = sharePercent != null ? Number(sharePercent) : 70;
    return `Offers + Commission — Client ${share}% share (estimate)`;
  }
  return "Not configured";
}
