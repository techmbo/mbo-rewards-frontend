/**
 * Raw Network Performance — aligned to v13 04A_Performance_Report_Tab.
 * Null stays "—" — never coerce missing metrics to 0.
 * Link Clicks = network-reported clicks (never substitute MBO link clicks).
 */

const NETWORK_LABELS = {
  OPTIMISE: "Optimise",
  TRACKIER: "Trackier",
  BOOSTINY: "Boostiny",
  PARTNERIZE: "Partnerize",
  IMPACT: "Impact",
};

/** Default visible columns from v13 Performance Reports. */
export const PERFORMANCE_04A_DEFAULT_HEADERS = [
  "Network Source",
  "Brand Name",
  "Campaign Type (Coupon Or Link)",
  "Coupon Code",
  "Link Clicks",
  "Gross Orders",
  "Gross Order Value",
  "Gross Commission",
  "Net Orders",
  "Net Order Value",
  "Net Commission",
  "Confirmed Orders",
  "Currency",
  "Date",
];

export const PERFORMANCE_CSV_HEADERS = [
  ...PERFORMANCE_04A_DEFAULT_HEADERS,
  "Cancel Orders",
  "Country",
  "Customer Type",
  "Month",
  "Year",
  "Order Date",
  "Order Confirmed Date",
  "Order Payment Confirmed Date",
  "Discount %",
  "Campaign",
  "Network Account",
  "Campaign Source ID",
  "Network Tracking Link",
  "MBO Tracking Link",
  "MBO Link Clicks",
  "Attribution",
  "Report ID",
  "Network Campaign ID",
  "Coupon ID",
  "Coupon Source / Scope",
  "Tracking Link ID",
  "Network Click ID",
  "MBO Click ID",
  "Sub IDs",
  "Impressions",
  "Unique Clicks",
  "Conversion Rate",
  "Pending Orders",
  "Paid Orders",
  "Pending Order Value",
  "Confirmed Order Value",
  "Cancelled Order Value",
  "Pending Commission",
  "Rejected Commission",
  "Payable Commission",
  "Paid Commission",
  "MBO Receivable",
  "MBO Received",
  "Device / Platform",
  "AOV",
  "EPC",
  "Raw Status",
  "MBO Standard Status",
  "Raw Payload ID",
  "Source Endpoint",
  "Report Granularity",
  "Last Synced",
  "Last Updated",
  "Reconciliation",
];

export function networkDisplayName(value) {
  if (value == null || value === "") return null;
  const key = String(value).toUpperCase();
  return NETWORK_LABELS[key] || String(value);
}

/** 04A Campaign Type (Coupon Or Link). */
export function campaignTypeLabel(value) {
  const ch = String(value || "").toUpperCase();
  if (ch === "COUPON_AND_LINK" || ch === "LINK_AND_COUPON") return "Link + Coupon";
  if (ch === "COUPON_CODE_ONLY" || ch === "COUPON") return "Coupon";
  if (ch === "AFFILIATE_LINK_ONLY" || ch === "LINK") return "Link";
  if (ch === "DEEPLINK") return "Deeplink";
  // Already humanized from API
  if (value === "Link + Coupon" || value === "Coupon" || value === "Link") return value;
  return null;
}

export function customerTypeLabel(value) {
  if (value == null || value === "") return null;
  const v = String(value).toUpperCase();
  if (v === "NEW" || v === "NEW CUSTOMER") return "New Customer";
  if (v === "EXISTING" || v === "RETURNING" || v === "EXISTING CUSTOMER") return "Existing Customer";
  return String(value);
}

export function attributionTone(value) {
  const v = String(value || "")
    .toUpperCase()
    .replace(/[\s+-]+/g, "_");
  if (v === "MATCHED" || v === "ATTRIBUTED") return "MATCHED";
  if (v.includes("COUPON") && v.includes("CLICK")) return "COUPON_CLICK";
  if (v === "PARTIAL") return "PARTIAL";
  if (v === "PENDING") return "PENDING";
  return v || null;
}

export function csvCell(value) {
  if (value == null || value === "") return "";
  return String(value);
}

function resolveLinkClicks(r) {
  return r.linkClicks ?? r.networkClicks ?? null;
}

function resolveNetOrders(r) {
  return r.netOrders ?? r.confirmedOrders ?? null;
}

function resolveNetOrderValue(r) {
  return r.netOrderValue ?? r.confirmedOrderValue ?? null;
}

function resolveNetCommission(r) {
  return r.netCommission ?? r.confirmedCommission ?? r.payableCommission ?? null;
}

function resolveCancelOrders(r) {
  if (r.cancelOrders != null) return r.cancelOrders;
  const cancelled = r.cancelledOrders != null ? Number(r.cancelledOrders) : null;
  const rejected = r.rejectedOrders != null ? Number(r.rejectedOrders) : null;
  if (cancelled == null && rejected == null) return null;
  return (Number.isFinite(cancelled) ? cancelled : 0) + (Number.isFinite(rejected) ? rejected : 0);
}

export function csvRowsFromPerformance(items = []) {
  return items.map((r) => [
    csvCell(r.networkSource || r.network),
    csvCell(r.brandName),
    csvCell(r.campaignType || campaignTypeLabel(r.campaignChannelType)),
    csvCell(r.couponCode),
    csvCell(resolveLinkClicks(r)),
    csvCell(r.grossOrders),
    csvCell(r.grossOrderValue),
    csvCell(r.grossCommission),
    csvCell(resolveNetOrders(r)),
    csvCell(resolveNetOrderValue(r)),
    csvCell(resolveNetCommission(r)),
    csvCell(r.confirmedOrders),
    csvCell(r.currency),
    csvCell(r.date || r.reportDate),
    csvCell(resolveCancelOrders(r)),
    csvCell(r.country),
    csvCell(customerTypeLabel(r.customerType) || r.customerType),
    csvCell(r.month),
    csvCell(r.year),
    csvCell(r.orderDate),
    csvCell(r.orderConfirmDate),
    csvCell(r.orderPaymentConfirmDate),
    csvCell(r.discountPercent),
    csvCell(r.campaignName),
    csvCell(r.networkAccount),
    csvCell(r.campaignSourceId),
    csvCell(r.networkTrackingLink),
    csvCell(r.mboTrackingLink),
    csvCell(r.mboLinkClicks),
    csvCell(r.attribution || r.attributionStatus),
    csvCell(r.reportId),
    csvCell(r.supplierCampaignId),
    csvCell(r.couponId),
    csvCell(r.couponSourceScope),
    csvCell(r.trackingLinkId),
    csvCell(r.networkClickId),
    csvCell(r.mboClickId),
    csvCell(r.subIds),
    csvCell(r.impressions),
    csvCell(r.uniqueClicks),
    csvCell(r.conversionRate),
    csvCell(r.pendingOrders),
    csvCell(r.paidOrders),
    csvCell(r.pendingOrderValue),
    csvCell(r.confirmedOrderValue),
    csvCell(r.cancelledOrderValue),
    csvCell(r.pendingCommission),
    csvCell(r.rejectedCommission),
    csvCell(r.payableCommission),
    csvCell(r.paidCommission),
    csvCell(r.mboReceivable),
    csvCell(r.mboActuallyReceived),
    csvCell(r.devicePlatform),
    csvCell(r.aov),
    csvCell(r.epc),
    csvCell(r.rawStatus),
    csvCell(r.mboStandardStatus),
    csvCell(r.rawPayloadId),
    csvCell(r.sourceEndpoint),
    csvCell(r.reportGranularity),
    csvCell(r.lastSyncedAt),
    csvCell(r.lastUpdatedAt),
    csvCell(r.reconciliation || r.reconciliationStatus),
  ]);
}

export function exportPerformanceCsv(filename, items) {
  const rows = [PERFORMANCE_CSV_HEADERS, ...csvRowsFromPerformance(items)];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export {
  resolveLinkClicks,
  resolveNetOrders,
  resolveNetOrderValue,
  resolveNetCommission,
  resolveCancelOrders,
};
