import { Badge } from "./Badge";

/**
 * Compact status pill for affiliate ops vocabulary.
 */
const TONE = {
  ACTIVE: "success",
  JOINED: "success",
  APPROVED: "success",
  PAID: "success",
  PAYABLE: "info",
  ADVERTISER_INVOICED: "info",
  INVOICED: "info",
  CONNECTED: "success",
  SYNCED: "success",
  HEALTHY: "success",
  AVAILABLE: "success",
  PENDING: "warning",
  PAUSED: "warning",
  NOT_PAYABLE: "warning",
  ON_HOLD: "warning",
  PARTIAL: "warning",
  SYNCING: "info",
  NEEDS_REVIEW: "warning",
  NO_RECENT_DATA: "warning",
  UNVERIFIED: "warning",
  NOT_JOINED: "default",
  NOT_APPLIED: "default",
  NOTAPPLIED: "default",
  UNKNOWN: "default",
  INACTIVE: "default",
  DRAFT: "default",
  PRODUCTION: "info",
  SANDBOX: "warning",
  NOT_CONFIGURED: "default",
  PLANNED: "default",
  NEVER: "default",
  IDLE: "default",
  UNAVAILABLE: "default",
  NOT_AVAILABLE: "default",
  NOT_ASSIGNED: "default",
  MAPPED: "success",
  SOURCE_ONLY: "default",
  SOURCE_PRESENT_MAPPING_MISSING: "danger",
  TRANSFORM_FAILED: "danger",
  VALIDATION_FAILED: "danger",
  SOURCE_NULL: "default",
  CONDITIONAL: "warning",
  SUPPORTED: "success",
  SUPPORTED_DATA_NOT_SYNCED: "warning",
  NOT_SUPPORTED: "default",
  MBO_DERIVED: "info",
  MANUAL_REQUIRED: "warning",
  REVIEW_REQUIRED: "warning",
  VERIFY_LIVE: "warning",
  OBSERVED: "info",
  VERIFIED: "success",
  MATCHED: "success",
  CONFIRMED: "success",
  COUPON_CLICK: "warning",
  CLIENT_VISIBLE: "success",
  ELIGIBLE: "success",
  ASSIGNED: "info",
  BLOCKED: "danger",
  IMPORTED: "info",
  PROCESSED: "success",
  SUCCEEDED: "success",
  STARTED: "info",
  LIVE: "success",
  DECLARED: "default",
  FAILED: "danger",
  SKIPPED: "default",
  REJECTED: "danger",
  CANCELLED: "danger",
  EXPIRED: "danger",
  ERROR: "danger",
  PUBLISHED: "success",
  PROVISIONED: "info",
  COMMISSION_READY: "info",
  TRACKING_READY: "info",
  READY: "success",
  ASSIGNABLE: "success",
  NOT_ASSIGNABLE: "default",
  REVOKED: "danger",
};

const LABELS = {
  NOT_APPLIED: "Not Joined",
  NOT_JOINED: "Not Joined",
  NOTAPPLIED: "Not Applied",
  SOURCE_PRESENT_MAPPING_MISSING: "Mapping Missing",
  SOURCE_ONLY: "Source Only",
  TRANSFORM_FAILED: "Transform Failed",
  VALIDATION_FAILED: "Validation Failed",
  SOURCE_NULL: "Source Null",
  CONDITIONAL: "Conditional",
  NOT_SUPPORTED: "Not Supported",
  MBO_DERIVED: "MBO Derived",
  MANUAL_REQUIRED: "Manual Required",
  REVIEW_REQUIRED: "Review Required",
  VERIFY_LIVE: "Verify Live",
  SUPPORTED: "Supported",
  SUPPORTED_DATA_NOT_SYNCED: "Supported — Data Not Synced",
  UNVERIFIED: "Unverified",
  VERIFIED: "Verified",
  GAP: "Mapping Missing",
  MAPPING_GAP: "Mapping Missing",
};

function humanize(status) {
  if (status == null || status === "") return "—";
  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusPill({ status, label, className = "" }) {
  const raw = status == null || status === "" ? null : String(status).toUpperCase();
  if (!raw) return <span className="text-slate-400">—</span>;
  const variant = TONE[raw] || "default";
  return (
    <Badge variant={variant} className={`whitespace-nowrap ${className}`}>
      {label || LABELS[raw] || humanize(raw)}
    </Badge>
  );
}
