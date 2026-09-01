/** Pointer 8 — MBO canonical object labels (keep in sync with backend contract). */
export const MBO_CANONICAL_OBJECT_OPTIONS = [
  { value: "", label: "All MBO objects" },
  { value: "NetworkAccount", label: "Network Account" },
  { value: "NetworkCampaign", label: "Network Campaign" },
  { value: "Brand", label: "Brand" },
  { value: "Campaign", label: "Campaign" },
  { value: "SupplierCommissionRule", label: "Supplier Commission Rule" },
  { value: "CouponVoucher", label: "Coupon / Voucher" },
  { value: "TrackingLink", label: "Tracking Link" },
  { value: "OfferPromotion", label: "Offer / Promotion" },
  { value: "Product", label: "Product" },
  { value: "PerformanceRecord", label: "Performance Record" },
  { value: "Click", label: "Click" },
  { value: "OrderConversion", label: "Order / Conversion" },
  { value: "OrderItem", label: "Order Item" },
  { value: "NetworkInvoiceBilling", label: "Network Invoice / Billing" },
  { value: "NetworkPayment", label: "Network Payment" },
  { value: "MBOReceipt", label: "MBO Receipt" },
  { value: "ClientCampaignAssignment", label: "Client Campaign Assignment" },
  { value: "ClientPayable", label: "Client Payable" },
  { value: "Exception", label: "Exception" },
];

const LABEL_BY_VALUE = Object.fromEntries(
  MBO_CANONICAL_OBJECT_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label]),
);

export function mboCanonicalObjectLabel(value) {
  if (!value) return "—";
  return LABEL_BY_VALUE[value] || String(value).replace(/([A-Z])/g, " $1").trim();
}
