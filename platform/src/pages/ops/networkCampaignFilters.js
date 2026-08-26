/**
 * Shared Network Operations campaign filters — same bar as Campaigns (/data/entities).
 */

export const NETWORK_CAMPAIGN_EMPTY_FILTERS = {
  search: "",
  network: "",
  recordType: "",
  sourceStatus: "",
  country: "",
  campaignStatus: "",
  relationshipStatus: "",
  isAssignable: "",
  campaignType: "",
  category: "",
  currency: "",
  issue: "",
  preset: "",
};

export const NETWORK_CAMPAIGN_FILTER_DEFINITIONS = [
  {
    key: "search",
    label: "Search",
    type: "search",
    placeholder: "Brand, campaign, IDs, category, country, coupon…",
  },
  {
    key: "network",
    label: "Network",
    options: [
      { value: "optimise", label: "Optimise" },
      { value: "trackier", label: "Trackier" },
      { value: "boostiny", label: "Boostiny" },
      { value: "partnerize", label: "Partnerize" },
      { value: "impact", label: "Impact" },
    ],
  },
  {
    key: "recordType",
    label: "Record Type",
    options: [
      { value: "campaign", label: "Campaign" },
      { value: "coupon", label: "Coupon" },
      { value: "performance", label: "Performance" },
    ],
  },
  {
    key: "sourceStatus",
    label: "Source Status",
    options: [
      { value: "IMPORTED", label: "Imported" },
      { value: "PROCESSED", label: "Processed" },
      { value: "FAILED", label: "Failed" },
    ],
  },
  {
    key: "country",
    label: "Country",
    type: "text",
    placeholder: "e.g. AE, SA",
  },
  {
    key: "campaignStatus",
    label: "Campaign Status",
    options: [
      { value: "ACTIVE", label: "Active" },
      { value: "PAUSED", label: "Paused" },
      { value: "EXPIRED", label: "Expired" },
      { value: "INACTIVE", label: "Inactive" },
      { value: "UNKNOWN", label: "Unknown" },
    ],
  },
  {
    key: "relationshipStatus",
    label: "Relationship",
    options: [
      { value: "JOINED", label: "Joined" },
      { value: "APPROVED", label: "Approved" },
      { value: "PENDING", label: "Pending" },
      { value: "NOT_JOINED", label: "Not joined" },
      { value: "REJECTED", label: "Rejected" },
      { value: "SUSPENDED", label: "Suspended" },
      { value: "UNKNOWN", label: "Unknown" },
    ],
  },
  {
    key: "isAssignable",
    label: "Is Assignable",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  },
  {
    key: "campaignType",
    label: "Campaign Type",
    type: "text",
    placeholder: "CPS, CPA, CPL…",
  },
  {
    key: "category",
    label: "Category",
    type: "text",
    placeholder: "Category contains…",
  },
  {
    key: "currency",
    label: "Currency",
    type: "text",
    placeholder: "e.g. AED",
  },
  {
    key: "issue",
    label: "Issue",
    options: [
      { value: "CAMPAIGN_NOT_PROMOTED", label: "Not promoted" },
      { value: "MISSING_MERCHANT_IDENTIFIER", label: "Missing merchant ID" },
      { value: "CAMPAIGN_SOURCE_MISSING", label: "Campaign source missing" },
    ],
  },
];

/** Query params for /ops/imported-records (Campaigns + All Network Data). */
export function buildImportedRecordsQuery(filters = {}, overrides = {}) {
  const f = { ...filters, ...overrides };
  const query = {};
  if (f.search?.trim()) query.search = f.search.trim();
  if (f.network) query.network = f.network;
  if (f.recordType) query.recordType = f.recordType;
  if (f.entityType) query.entityType = f.entityType;
  if (f.sourceStatus) query.sourceStatus = f.sourceStatus;
  if (f.country?.trim()) query.country = f.country.trim();
  if (f.campaignStatus) query.campaignStatus = f.campaignStatus;
  if (f.relationshipStatus) query.relationshipStatus = f.relationshipStatus;
  if (f.isAssignable) query.isAssignable = f.isAssignable;
  if (f.campaignType?.trim()) query.campaignType = f.campaignType.trim();
  if (f.category?.trim()) query.category = f.category.trim();
  if (f.currency?.trim()) query.currency = f.currency.trim();
  if (f.issue) query.issue = f.issue;
  if (f.preset) query.preset = f.preset;
  return query;
}

/** Subset mapped for list endpoints that accept network + dimensional search. */
export function buildSharedNetworkQuery(filters = {}) {
  const query = {};
  if (filters.search?.trim()) query.q = filters.search.trim();
  if (filters.network) query.network = filters.network;
  if (filters.country?.trim()) query.country = filters.country.trim();
  if (filters.campaignType?.trim()) query.campaignType = filters.campaignType.trim();
  if (filters.category?.trim()) query.category = filters.category.trim();
  if (filters.currency?.trim()) query.currency = filters.currency.trim();
  return query;
}
