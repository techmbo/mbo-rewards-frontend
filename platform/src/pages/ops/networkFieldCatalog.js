/**
 * MBO Display Name + Canonical Field from
 * docs/MBO_Rewards_FINAL_MBO_to_Network_Mapping.xlsx - MBO_to_Network_Mapping.csv
 * (Campaign + Commission Rules entities).
 */

export const NETWORK_SOURCE_OPTIONS = [
  { value: "", label: "All Network Sources" },
  { value: "optimise", label: "Optimise" },
  { value: "partnerize", label: "Partnerize" },
  { value: "boostiny", label: "Boostiny" },
  { value: "trackier", label: "Trackier" },
  { value: "impact", label: "Impact" },
  { value: "awin", label: "Awin" },
  { value: "admitad", label: "Admitad" },
  { value: "cj", label: "CJ" },
  { value: "rakuten", label: "Rakuten" },
];

export const ALL_NETWORK_RECORD_TYPES = [
  { value: "campaign", label: "Campaigns", blurb: "Campaign master/source records using 03A Admin Campaign Tab + 03E MBO naming." },
  { value: "coupon", label: "Coupon / Voucher", blurb: "Network voucher and coupon inventory records." },
  { value: "conversion", label: "Orders / Conversions", blurb: "Network conversion and order evidence records." },
  { value: "product", label: "Products / Feeds", blurb: "Product and feed source records when available." },
];

export const ALL_NETWORK_VIEW_MODES = [
  { value: "MBO_DEFAULT", label: "MBO Default" },
  { value: "COMPACT", label: "Compact" },
  { value: "ALL_COLUMNS", label: "All Columns" },
  { value: "CUSTOM", label: "My Custom View" },
];

/** UI record type → API entity type (conversion → performance). */
export function normalizeRecordTypeForApi(uiType) {
  const t = String(uiType || "campaign").toLowerCase();
  if (t === "conversion") return "performance";
  return t;
}

export function getMboColumnCatalog(recordType) {
  const apiType = normalizeRecordTypeForApi(recordType);
  if (apiType === "coupon") return COUPON_MBO_COLUMNS;
  if (apiType === "performance") return PERFORMANCE_MBO_COLUMNS;
  if (apiType === "product") return PRODUCT_FEED_COLUMNS;
  return CAMPAIGN_MBO_COLUMNS;
}

export function getDefaultColumnKeys(recordType) {
  return getMboColumnCatalog(recordType)
    .filter((c) => c.defaultVisible !== false)
    .map((c) => c.key);
}

export function getCompactColumnKeys(recordType) {
  const catalog = getMboColumnCatalog(recordType);
  const compact = catalog.filter((c) => c.compactVisible).map((c) => c.key);
  if (compact.length) return compact;
  return getDefaultColumnKeys(recordType).slice(0, 8);
}

export function resolveActiveColumnKeys({ viewMode, recordType, customKeys = [] }) {
  const catalog = getMboColumnCatalog(recordType);
  const allKeys = catalog.map((c) => c.key);
  switch (String(viewMode || "MBO_DEFAULT").toUpperCase()) {
    case "ALL_COLUMNS":
      return allKeys;
    case "COMPACT":
      return getCompactColumnKeys(recordType);
    case "CUSTOM":
      return customKeys.length
        ? customKeys.filter((k) => allKeys.includes(k) || String(k).startsWith("source:"))
        : getDefaultColumnKeys(recordType);
    case "MBO_DEFAULT":
    default:
      return getDefaultColumnKeys(recordType);
  }
}

/** Union source-only field keys from list rows for All Columns mode. */
export function collectSourceFieldKeys(rows = []) {
  const keys = new Set();
  for (const row of rows) {
    const sf = row?.sourceFields;
    if (!sf || typeof sf !== "object") continue;
    for (const k of Object.keys(sf)) keys.add(k);
  }
  return [...keys].sort();
}

export function buildSourceColumnDefs(keys = []) {
  return keys.map((key) => ({
    key: `source:${key}`,
    label: `Source: ${key}`,
    technical: key,
    sourceOnly: true,
    defaultVisible: false,
  }));
}

/** Map product API row → shared explorer shape where helpful. */
export function normalizeProductExplorerRow(row) {
  if (!row) return row;
  return {
    ...row,
    network: row.networkSource,
    brand: row.brandName,
    campaign: row.campaignName,
    sourceRecordId: row.supplierProductId,
  };
}

/** Campaign columns for All Network Data — display + technical key under header. */
export const CAMPAIGN_MBO_COLUMNS = [
  { key: "network", label: "Network Source", technical: "supplier", defaultVisible: true, compactVisible: true },
  { key: "brand", label: "Brand Name", technical: "brand_name", defaultVisible: true, compactVisible: true },
  { key: "brandWebsiteLink", label: "Brand Website Link", technical: "brandWebsiteUrl / landingPageUrl", defaultVisible: true },
  { key: "brandLogoLink", label: "Brand Logo Link", technical: "brandLogoUrl / campaignLogoUrl", defaultVisible: true },
  { key: "campaign", label: "Campaign Name", technical: "campaignName", defaultVisible: true, compactVisible: true },
  { key: "category", label: "Primary Category", technical: "primaryCategory", defaultVisible: true },
  { key: "secondaryCategory", label: "Secondary Category", technical: "secondaryCategory", defaultVisible: true },
  { key: "country", label: "Country", technical: "country", defaultVisible: true, compactVisible: true },
  { key: "currency", label: "Currency", technical: "currency", defaultVisible: true },
  { key: "campaignType", label: "Campaign Type", technical: "campaignType", defaultVisible: true },
  { key: "campaignDescription", label: "Campaign Description", technical: "campaignDescription", defaultVisible: true },
  { key: "termsAndConditions", label: "Campaign Terms and Condition", technical: "campaignTerms", defaultVisible: true },
  { key: "commissionDisplay", label: "Campaign Commission", technical: "campaignCommissionDisplay", defaultVisible: true, compactVisible: true },
  { key: "commissionAverageDisplay", label: "Avg. Commission", technical: "campaignCommissionAverage", defaultVisible: true },
  { key: "networkTrackingLink", label: "Supplier Tracking Link", technical: "supplierTrackingLink", defaultVisible: true },
  { key: "startDate", label: "Campaign Start Date", technical: "campaignStartDate", defaultVisible: true },
  { key: "endDate", label: "Campaign End Date", technical: "campaignEndDate", defaultVisible: true },
  { key: "campaignStatus", label: "Campaign Status", technical: "campaign_status", defaultVisible: true, compactVisible: true },
  { key: "promotionDescription", label: "Campaign Promotion Description", technical: "promotion_description", defaultVisible: false },
  { key: "discountPercent", label: "Discount %", technical: "discount_percent", defaultVisible: false },
  { key: "relationshipStatus", label: "Relationship Status", technical: "relationship_status", defaultVisible: true, compactVisible: true },
  { key: "isAssignable", label: "Is Assignable", technical: "is_assignable", defaultVisible: true },
  { key: "supplierCampaignExtId", label: "Supplier Campaign ID", technical: "supplier_campaign_id", defaultVisible: true },
  { key: "campaignSourceId", label: "Campaign Source ID", technical: "campaign_source_id", defaultVisible: true },
  { key: "linkSupport", label: "Link Support", technical: "supports_link_tracking", defaultVisible: true },
  { key: "couponSupport", label: "Coupon Support", technical: "supports_coupon", defaultVisible: true },
  { key: "deeplinkSupport", label: "Deeplink Support", technical: "supports_deeplink", defaultVisible: true },
  { key: "feedSupport", label: "Feed Support", technical: "supports_product_feed", defaultVisible: false },
  { key: "commissionRuleCount", label: "Commission Rule Count", technical: "commission_rule_count", defaultVisible: true },
  { key: "lastSyncedAt", label: "Last Synced At", technical: "last_synced_at", defaultVisible: true },
  { key: "mappingStatus", label: "Mapping Status", technical: "mapping_status", defaultVisible: true, compactVisible: true },
  { key: "rawPayloadId", label: "Raw Payload Link", technical: "raw_payload_id", defaultVisible: false },
  { key: "sourceRecordId", label: "Source Record ID", technical: "external_id", defaultVisible: false },
];

export const COUPON_MBO_COLUMNS = [
  { key: "network", label: "Network Source", technical: "supplier", defaultVisible: true, compactVisible: true },
  { key: "brand", label: "Brand Name", technical: "brand_name", defaultVisible: true, compactVisible: true },
  { key: "campaign", label: "Campaign Name", technical: "campaignName", defaultVisible: true, compactVisible: true },
  { key: "couponCode", label: "Coupon Code", technical: "coupon_code", defaultVisible: true, compactVisible: true },
  { key: "couponStatus", label: "Coupon Status", technical: "coupon_status", defaultVisible: true, compactVisible: true },
  { key: "couponLink", label: "Coupon Link", technical: "coupon_link", defaultVisible: true },
  { key: "country", label: "Country", technical: "country", defaultVisible: true, compactVisible: true },
  { key: "currency", label: "Currency", technical: "currency", defaultVisible: true },
  { key: "startDate", label: "Start Date", technical: "start_date", defaultVisible: true },
  { key: "endDate", label: "End Date", technical: "end_date", defaultVisible: true },
  { key: "mappingStatus", label: "Mapping Status", technical: "mapping_status", defaultVisible: true, compactVisible: true },
  { key: "sourceStatus", label: "Source Status", technical: "source_status", defaultVisible: true },
  { key: "lastSyncedAt", label: "Last Synced At", technical: "last_synced_at", defaultVisible: true },
  { key: "rawPayloadId", label: "Raw Payload Link", technical: "raw_payload_id", defaultVisible: false },
  { key: "sourceRecordId", label: "Source Record ID", technical: "external_id", defaultVisible: false },
];

export const PERFORMANCE_MBO_COLUMNS = [
  { key: "network", label: "Network Source", technical: "supplier", defaultVisible: true, compactVisible: true },
  { key: "brandName", label: "Brand Name", technical: "brand_name", defaultVisible: true, compactVisible: true },
  { key: "campaignName", label: "Campaign Name", technical: "campaign_name", defaultVisible: true, compactVisible: true },
  { key: "reportDate", label: "Report Date", technical: "report_date", defaultVisible: true, compactVisible: true },
  { key: "reportGranularity", label: "Report Granularity", technical: "report_granularity", defaultVisible: true },
  { key: "country", label: "Country", technical: "country", defaultVisible: true, compactVisible: true },
  { key: "currency", label: "Currency", technical: "currency", defaultVisible: true, compactVisible: true },
  { key: "couponCode", label: "Coupon Code", technical: "coupon_code", defaultVisible: true },
  { key: "networkOrderId", label: "Network Order ID", technical: "network_order_id", defaultVisible: true, compactVisible: true },
  { key: "networkConversionId", label: "Network Conversion ID", technical: "network_conversion_id", defaultVisible: true },
  { key: "networkClickId", label: "Network Click ID", technical: "network_click_id", defaultVisible: true },
  { key: "networkClicks", label: "Network Clicks", technical: "network_clicks", defaultVisible: true },
  { key: "grossOrders", label: "Gross Orders", technical: "gross_orders", defaultVisible: true, compactVisible: true },
  { key: "confirmedOrders", label: "Confirmed Orders", technical: "confirmed_orders", defaultVisible: true, compactVisible: true },
  { key: "grossOrderValue", label: "Gross Order Value", technical: "gross_order_value", defaultVisible: true, compactVisible: true },
  { key: "grossCommission", label: "Gross Commission", technical: "gross_commission", defaultVisible: true, compactVisible: true },
  { key: "networkOrderStatusRaw", label: "Network Raw Status", technical: "network_raw_status", defaultVisible: true },
  { key: "mappingStatus", label: "Mapping Status", technical: "mapping_status", defaultVisible: true, compactVisible: true },
  { key: "lastSyncedAt", label: "Last Synced At", technical: "last_synced_at", defaultVisible: true },
  { key: "sourceEndpoint", label: "Source Endpoint", technical: "source_endpoint", defaultVisible: false },
  { key: "rawPayloadId", label: "Raw Payload Link", technical: "raw_payload_id", defaultVisible: false },
  { key: "sourceRecordId", label: "Source Record ID", technical: "external_id", defaultVisible: false },
];

export const SUPPLIER_COMMISSION_RULE_COLUMNS = [
  { key: "networkSource", label: "Network Source", technical: "network_source" },
  { key: "brandName", label: "Brand Name", technical: "brand_name" },
  { key: "campaignName", label: "Campaign Name", technical: "campaign_name" },
  { key: "supplierCommissionRuleId", label: "Supplier Commission Rule ID", technical: "supplier_commission_rule_id" },
  { key: "commissionType", label: "Commission Type", technical: "commission_type" },
  { key: "commissionValue", label: "Commission Value", technical: "commission_value" },
  { key: "currency", label: "Currency", technical: "currency" },
  { key: "customerType", label: "Customer Type", technical: "customer_type" },
  { key: "country", label: "Country", technical: "country" },
  { key: "categoryProductGoal", label: "Category / Product / Goal", technical: "rule_scope" },
  { key: "couponOrTier", label: "Coupon / Tier", technical: "coupon_or_tier_scope" },
  { key: "effectiveFrom", label: "Effective From", technical: "effective_from" },
  { key: "effectiveUntil", label: "Effective Until", technical: "effective_until" },
  { key: "sourceObject", label: "Source Object", technical: "source_object" },
  { key: "sourcePath", label: "Source Path", technical: "source_path" },
  { key: "ruleVersion", label: "Rule Version", technical: "rule_version" },
  { key: "ruleStatus", label: "Rule Status", technical: "rule_status" },
  { key: "sourceFieldPath", label: "Source Field / Path", technical: "source_field_path" },
  { key: "mappingStatus", label: "Mapping Status", technical: "mapping_status" },
  { key: "fieldMappingOutcome", label: "Mapping Outcome", technical: "field_mapping_outcome" },
];

/** v13 Products / Feeds registry columns. */
export const PRODUCT_FEED_COLUMNS = [
  { key: "networkSource", label: "Network Source", technical: "network_source", defaultVisible: true, compactVisible: true },
  { key: "brandName", label: "Brand Name", technical: "brand_name", defaultVisible: true, compactVisible: true },
  { key: "campaignName", label: "Campaign Name", technical: "campaign_name", defaultVisible: true, compactVisible: true },
  { key: "supplierProductId", label: "Supplier Product ID", technical: "supplier_product_id", defaultVisible: true, compactVisible: true },
  { key: "productName", label: "Product Name", technical: "product_name", defaultVisible: true, compactVisible: true },
  { key: "sku", label: "SKU", technical: "sku", defaultVisible: true, compactVisible: true },
  { key: "price", label: "Price", technical: "price", defaultVisible: true, compactVisible: true },
  { key: "currency", label: "Currency", technical: "currency", defaultVisible: true, compactVisible: true },
  { key: "availability", label: "Availability", technical: "availability", defaultVisible: true },
  { key: "productFeedSource", label: "Product Feed / API Source", technical: "product_feed_source", defaultVisible: true },
  { key: "mappingStatus", label: "Mapping Status", technical: "mapping_status", defaultVisible: true },
];

/** v13 Tracking Links registry columns. */
export const TRACKING_LINK_COLUMNS = [
  { key: "networkSource", label: "Network Source", technical: "network_source", defaultVisible: true },
  { key: "brandName", label: "Brand Name", technical: "brand_name", defaultVisible: true },
  { key: "campaignName", label: "Campaign Name", technical: "campaign_name", defaultVisible: true },
  { key: "linkType", label: "Link Type", technical: "link_type", defaultVisible: true },
  { key: "supplierTrackingLink", label: "Supplier Tracking Link", technical: "supplier_tracking_link", defaultVisible: true },
  { key: "mboTrackingLink", label: "MBO Tracking Link", technical: "mbo_tracking_link", defaultVisible: true },
  { key: "attributionParameter", label: "Attribution Parameter", technical: "attribution_parameter", defaultVisible: true },
  { key: "redirectChainSummary", label: "Redirect Chain", technical: "redirect_chain", defaultVisible: false },
  { key: "linkStatus", label: "Link Status", technical: "link_status", defaultVisible: true },
  { key: "mappingStatus", label: "Mapping Status", technical: "mapping_status", defaultVisible: true },
];
