import {
  assignmentAsCampaignRow,
  assignmentHasMboTracking,
  isLinkRequired,
  publishReadinessOfAssignment,
} from "../master/masterCampaignHelpers.js";

/**
 * Shared publish path for assignment ledger, review, and activation surfaces.
 * Backend publish() activates DRAFT commission rules and sets status ACTIVE.
 */
export async function ensureAssignmentTracking(row, postApi) {
  if (assignmentHasMboTracking(row)) return true;
  if (!isLinkRequired(assignmentAsCampaignRow(row))) return true;
  try {
    await postApi("/tracking-links", {
      assignmentId: row.id,
      ...(row.campaignSourceId ? { campaignSourceId: row.campaignSourceId } : {}),
      isPrimary: true,
    });
    return true;
  } catch {
    return false;
  }
}

export async function ensureAssignmentCoupon(row, postApi) {
  const code = row.clientFacing?.couponCode || row.couponCode;
  if (!code) return;
  try {
    await postApi("/coupon-assignments", {
      assignmentId: row.id,
      clientCouponCode: code,
    });
  } catch {
    /* already linked */
  }
}

export function assignmentPublishReadiness(row = {}) {
  return publishReadinessOfAssignment(row);
}

export async function publishAssignmentRow(row, { patchApi, postApi }) {
  const readiness = publishReadinessOfAssignment(row);
  if (!readiness.ready) {
    const missing = readiness.missing.map((f) => f.label).join(", ");
    throw new Error(`Cannot publish yet — missing: ${missing}`);
  }

  if (isLinkRequired(assignmentAsCampaignRow(row)) && !assignmentHasMboTracking(row)) {
    const created = await ensureAssignmentTracking(row, postApi);
    if (!created) {
      throw new Error(
        "Could not create MBO tracking link from the network URL. Confirm the supplier campaign still has a tracking URL, then try again.",
      );
    }
  }

  await ensureAssignmentCoupon(row, postApi);
  await patchApi(`/client-assignments/${row.id}`, { lifecycle: "published" });
}
