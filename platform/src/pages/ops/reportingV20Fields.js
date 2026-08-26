/**
 * Reporting v20 field catalogs (HTML MBO_Rewards_Reporting_v20).
 * Keys are camelCase API/DTO names; labels match the HTML workbook.
 */

export const RAW_PERFORMANCE_FIELDS = [
  { key: "date", label: "Date" },
  { key: "network", label: "Network" },
  { key: "reportGranularity", label: "Report Granularity" },
  { key: "brandName", label: "Brand Name" },
  { key: "campaignName", label: "Campaign Name" },
  { key: "campaignType", label: "Campaign Type" },
  { key: "country", label: "Country" },
  { key: "customerType", label: "Customer Type" },
  { key: "currency", label: "Currency" },
  { key: "couponCode", label: "Coupon Code" },
  { key: "networkOrderId", label: "Network Order ID" },
  { key: "networkConversionId", label: "Network Conversion ID" },
  { key: "networkClickId", label: "Network Click ID" },
  { key: "subId1", label: "Sub ID 1" },
  { key: "networkClicks", label: "Network Clicks" },
  { key: "mboLinkClicks", label: "MBO Link Clicks" },
  { key: "grossOrders", label: "Gross Orders" },
  { key: "pendingOrders", label: "Pending Orders" },
  { key: "confirmedOrders", label: "Confirmed Orders" },
  { key: "cancelledOrders", label: "Cancel Orders" },
  { key: "rejectedOrders", label: "Rejected Orders" },
  { key: "grossOrderValue", label: "Gross Order Value" },
  { key: "netOrderValue", label: "Net Order Value" },
  { key: "grossCommission", label: "Gross Commission" },
  { key: "pendingCommission", label: "Pending Commission" },
  { key: "netCommission", label: "Net Commission" },
  { key: "networkOrderStatusRaw", label: "Network Raw Status" },
  { key: "orderDate", label: "Order Date" },
  { key: "orderConfirmedDate", label: "Order Confirmed Date" },
  { key: "lastUpdatedAt", label: "Last Updated" },
  { key: "sourceEndpoint", label: "Source Endpoint / Report" },
];

export const CONFIRMED_ORDERS_FIELDS = [
  { key: "orderConfirmedDate", label: "Order Confirmed Date" },
  { key: "orderDate", label: "Order Date" },
  { key: "network", label: "Network" },
  { key: "brandName", label: "Brand Name" },
  { key: "campaignName", label: "Campaign Name" },
  { key: "campaignType", label: "Campaign Type" },
  { key: "country", label: "Country" },
  { key: "customerType", label: "Customer Type" },
  { key: "currency", label: "Currency" },
  { key: "couponCode", label: "Coupon Code" },
  { key: "mboTrackingLink", label: "MBO Tracking Link" },
  { key: "networkOrderId", label: "Network Order ID" },
  { key: "networkConversionId", label: "Network Conversion ID" },
  { key: "networkClickId", label: "Network Click ID" },
  { key: "mboClickId", label: "MBO Click ID" },
  { key: "clientName", label: "Client" },
  { key: "clientCampaignAssignmentId", label: "Client Campaign Assignment ID" },
  { key: "orderValue", label: "Order Value" },
  { key: "confirmedNetworkCommission", label: "Confirmed Network Commission" },
  { key: "clientCommissionRate", label: "Client Commission Rate" },
  { key: "clientCommissionAmount", label: "Client Commission Amount" },
  { key: "mboCommissionAmount", label: "MBO Commission" },
  { key: "networkOrderStatusRaw", label: "Network Raw Status" },
  { key: "mboOrderStatus", label: "MBO Order Status" },
  { key: "lastUpdatedAt", label: "Last Updated" },
];

export const CLIENT_OVERVIEW_FIELDS = [
  { key: "clientName", label: "Client Name" },
  { key: "country", label: "Country" },
  { key: "networkOrders", label: "Network Orders" },
  { key: "mboOrders", label: "MBO Orders" },
  { key: "clientOrders", label: "Client Orders" },
  { key: "pendingOrders", label: "Pending Orders" },
  { key: "confirmedOrders", label: "Confirmed Orders" },
  { key: "rejectedOrders", label: "Rejected Orders" },
  { key: "cancelledOrders", label: "Cancelled Orders" },
  { key: "grossOrderValue", label: "Gross Order Value" },
  { key: "confirmedOrderValue", label: "Confirmed Order Value" },
  { key: "grossNetworkCommission", label: "Gross Network Commission" },
  { key: "confirmedNetworkCommission", label: "Confirmed Network Commission" },
  { key: "clientCommissionGenerated", label: "Client Commission Generated" },
  { key: "confirmedClientCommission", label: "Confirmed Client Commission" },
  { key: "mboCommission", label: "MBO Commission" },
  { key: "couponOrders", label: "Coupon Orders" },
  { key: "affiliateLinkOrders", label: "Affiliate Link Orders" },
  { key: "activeCampaigns", label: "Active Campaigns" },
  { key: "lastUpdatedAt", label: "Last Updated" },
];

export const CLIENT_PERFORMANCE_FIELDS = [
  { key: "date", label: "Date" },
  { key: "brandName", label: "Brand Name" },
  { key: "campaignName", label: "Campaign Name" },
  { key: "campaignType", label: "Campaign Type" },
  { key: "couponCode", label: "Coupon Code" },
  { key: "mboTrackingLink", label: "MBO Tracking Link" },
  { key: "grossOrders", label: "Gross Orders" },
  { key: "pendingOrders", label: "Pending Orders" },
  { key: "confirmedOrders", label: "Confirmed Orders" },
  { key: "rejectedOrders", label: "Rejected Orders" },
  { key: "cancelledOrders", label: "Cancelled Orders" },
  { key: "grossOrderValue", label: "Gross Order Value" },
  { key: "confirmedOrderValue", label: "Confirmed Order Value" },
  { key: "clientCommissionGenerated", label: "Client Commission Generated" },
  { key: "confirmedClientCommission", label: "Confirmed Client Commission" },
  { key: "lastUpdatedAt", label: "Last Updated" },
];

export const CLIENT_CONFIRMED_FIELDS = [
  { key: "confirmationType", label: "Confirmation Type" },
  { key: "orderConfirmedDate", label: "Order Confirmed Date" },
  { key: "orderDate", label: "Order Date" },
  { key: "cycle", label: "Cycle" },
  { key: "clientName", label: "Client" },
  { key: "network", label: "Network" },
  { key: "brandName", label: "Brand Name / Payment Source" },
  { key: "campaignName", label: "Campaign Name" },
  { key: "campaignType", label: "Campaign Type" },
  { key: "couponCode", label: "Coupon Code" },
  { key: "mboTrackingLink", label: "MBO Tracking Link" },
  { key: "networkOrderId", label: "Network Order ID" },
  { key: "networkConversionId", label: "Network Conversion ID" },
  { key: "mboClickId", label: "MBO Click ID" },
  { key: "confirmedOrders", label: "Confirmed Orders" },
  { key: "confirmedOrderValueAmount", label: "Confirmed Order Value Amount" },
  { key: "currency", label: "Currency" },
  { key: "clientCommissionRate", label: "Client Commission Rate" },
  { key: "confirmedClientCommissionAmount", label: "Confirmed Client Commission Amount" },
  { key: "confirmationStatus", label: "Confirmation Status" },
  { key: "settlementStatus", label: "Settlement Status" },
  { key: "lastUpdatedDate", label: "Last Updated Date" },
  { key: "lastUpdatedTime", label: "Last Updated Time" },
];

export const REPORTING_NETWORKS = [
  { value: "", label: "All Networks" },
  { value: "OPTIMISE", label: "Optimise" },
  { value: "IMPACT", label: "Impact" },
  { value: "PARTNERIZE", label: "Partnerize" },
  { value: "TRACKIER", label: "Trackier" },
  { value: "VCOMMISSION", label: "vCommission" },
  { value: "BOOSTINY", label: "Boostiny" },
  { value: "AWIN", label: "Awin" },
];

export function exportRowsCsv(filename, fields, keys, rows) {
  const labelByKey = Object.fromEntries(fields.map((f) => [f.key, f.label]));
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    keys.map((k) => esc(labelByKey[k] || k)).join(","),
    ...rows.map((r) => keys.map((k) => esc(r[k])).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${String(filename || "export").replace(/[^a-z0-9]+/gi, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
