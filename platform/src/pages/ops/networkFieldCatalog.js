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
];

export const ALL_NETWORK_RECORD_TYPES = [
  { value: "campaign", label: "Campaigns", blurb: "Campaign master/source records using 03A Admin Campaign Tab + 03E MBO naming." },
  { value: "coupon", label: "Coupon / Voucher", blurb: "Network voucher and coupon inventory records." },
  { value: "conversion", label: "Orders / Conversions", blurb: "Network conversion and order evidence records." },
  { value: "product", label: "Products / Feeds", blurb: "Product and feed source records when available." },
];

/** Campaign columns for All Network Data — display + technical key under header. */
export const CAMPAIGN_MBO_COLUMNS = [
  { key: "network", label: "Network Source", technical: "supplier", defaultVisible: true },
  { key: "brand", label: "Brand Name", technical: "brand_name", defaultVisible: true },
  { key: "brandWebsiteLink", label: "Brand Website Link", technical: "brandWebsiteUrl / landingPageUrl", defaultVisible: true },
  { key: "brandLogoLink", label: "Brand Logo Link", technical: "brandLogoUrl / campaignLogoUrl", defaultVisible: true },
  { key: "campaign", label: "Campaign Name", technical: "campaignName", defaultVisible: true },
  { key: "category", label: "Primary Category", technical: "primaryCategory", defaultVisible: true },
  { key: "secondaryCategory", label: "Secondary Category", technical: "secondaryCategory", defaultVisible: true },
  { key: "country", label: "Country", technical: "country", defaultVisible: true },
  { key: "currency", label: "Currency", technical: "currency", defaultVisible: true },
  { key: "campaignType", label: "Campaign Type", technical: "campaignType", defaultVisible: true },
  { key: "campaignDescription", label: "Campaign Description", technical: "campaignDescription", defaultVisible: true },
  { key: "termsAndConditions", label: "Campaign Terms and Condition", technical: "campaignTerms", defaultVisible: true },
  { key: "commissionDisplay", label: "Campaign Commission", technical: "campaignCommissionDisplay", defaultVisible: true },
  { key: "networkTrackingLink", label: "Campaign Tracking Link", technical: "campaignTrackingLink", defaultVisible: true },
  { key: "startDate", label: "Campaign Start Date", technical: "campaignStartDate", defaultVisible: true },
  { key: "endDate", label: "Campaign End Date", technical: "campaignEndDate", defaultVisible: true },
  { key: "campaignStatus", label: "Campaign Status", technical: "campaign_status", defaultVisible: true },
  { key: "promotionDescription", label: "Campaign Promotion Description", technical: "promotion_description", defaultVisible: false },
  { key: "discountPercent", label: "Discount %", technical: "discount_percent", defaultVisible: false },
  { key: "relationshipStatus", label: "Relationship Status", technical: "relationship_status", defaultVisible: true },
  { key: "isAssignable", label: "Is Assignable", technical: "is_assignable", defaultVisible: true },
  { key: "supplierCampaignExtId", label: "Supplier Campaign ID", technical: "supplier_campaign_id", defaultVisible: true },
  { key: "campaignSourceId", label: "Campaign Source ID", technical: "campaign_source_id", defaultVisible: true },
  { key: "linkSupport", label: "Link Support", technical: "supports_link_tracking", defaultVisible: true },
  { key: "couponSupport", label: "Coupon Support", technical: "supports_coupon", defaultVisible: true },
  { key: "deeplinkSupport", label: "Deeplink Support", technical: "supports_deeplink", defaultVisible: true },
  { key: "commissionRuleCount", label: "Commission Rule Count", technical: "commission_rule_count", defaultVisible: true },
  { key: "lastSyncedAt", label: "Last Synced At", technical: "last_synced_at", defaultVisible: true },
  { key: "mappingStatus", label: "Mapping Status", technical: "mapping_status", defaultVisible: true },
  { key: "rawPayloadId", label: "Raw Payload Link", technical: "raw_payload_id", defaultVisible: false },
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
  { key: "ruleStatus", label: "Rule Status", technical: "rule_status" },
  { key: "sourceFieldPath", label: "Source Field / Path", technical: "source_field_path" },
  { key: "mappingStatus", label: "Mapping Status", technical: "mapping_status" },
];

/** v13 Products / Feeds registry columns. */
export const PRODUCT_FEED_COLUMNS = [
  { key: "networkSource", label: "Network Source", technical: "network_source", defaultVisible: true },
  { key: "brandName", label: "Brand Name", technical: "brand_name", defaultVisible: true },
  { key: "campaignName", label: "Campaign Name", technical: "campaign_name", defaultVisible: true },
  { key: "supplierProductId", label: "Supplier Product ID", technical: "supplier_product_id", defaultVisible: true },
  { key: "productName", label: "Product Name", technical: "product_name", defaultVisible: true },
  { key: "sku", label: "SKU", technical: "sku", defaultVisible: true },
  { key: "price", label: "Price", technical: "price", defaultVisible: true },
  { key: "currency", label: "Currency", technical: "currency", defaultVisible: true },
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
  { key: "linkStatus", label: "Link Status", technical: "link_status", defaultVisible: true },
  { key: "mappingStatus", label: "Mapping Status", technical: "mapping_status", defaultVisible: true },
];
