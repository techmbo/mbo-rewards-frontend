/**
 * Master catalog presentation — network values are the base; clientFacing overrides
 * apply only to the assignment copy. Completeness is derived, never invented.
 */

import { resolveCurrencyForCountries } from "../../utils/countryCurrency.js";
import { displayCountry, displayText, htmlToPlainText } from "../../utils/display.js";
import { slugifyName } from "../../utils/slugify.js";

export const ASSIGN_STEPS = [
  {
    id: "select",
    label: "Select Campaigns",
    hint: "Choose master campaigns to assign",
  },
  {
    id: "configure",
    label: "Configure Assignment",
    hint: "Client, source, coupon, commission, tracking",
  },
  {
    id: "review",
    label: "Assignment Review",
    hint: "Validate drafts, then publish to the client",
  },
];

export const REQUIRED_CLIENT_FIELDS = [
  { key: "customerOffer", label: "Offer" },
  { key: "couponCode", label: "Coupon", requiredIf: (row) => isCouponType(row) },
  {
    key: "trackingUrl",
    label: "Link",
    requiredIf: (row) => isLinkRequired(row),
  },
  { key: "termsAndConditions", label: "T&C" },
  { key: "expiry", label: "Expiry" },
  { key: "countries", label: "Country" },
];

export function isCouponType(row = {}) {
  const type = String(row.campaignType || row.campaignChannelType || row.channelType || "").toUpperCase();
  return type.includes("COUPON");
}

export function isAffiliateLinkType(row = {}) {
  const combined = String(row.campaignChannelType || row.channelType || row.campaignType || "").toUpperCase();
  if (!combined) return false;
  if (combined.includes("COUPON") && !combined.includes("LINK") && !combined.includes("DEEP")) {
    return false;
  }
  return combined.includes("AFFILIATE") || combined.includes("LINK") || combined.includes("DEEP");
}

export function masterCampaignCouponCode(row = {}) {
  if (!isCouponType(row)) return null;
  const primaryCoupon = Array.isArray(row.coupons) ? row.coupons[0] : null;
  return row.couponCode || primaryCoupon?.couponCode || row.coupon?.code || null;
}

export function masterCampaignLinkUrl(row = {}) {
  if (!isAffiliateLinkType(row)) return null;
  return row.trackingUrl || row.destinationUrl || null;
}

export function masterCampaignMboLinkUrl(row = {}) {
  if (!isAffiliateLinkType(row) && !fieldHasValue(row.mboTrackingUrl)) return null;
  return row.mboTrackingUrl || null;
}

export function isLinkRequired(row = {}) {
  if (isCouponType(row) && !isAffiliateLinkType(row)) return false;
  return isAffiliateLinkType(row) || Boolean(row.trackingUrl || row.destinationUrl);
}

export function resolveNetworkTrackingUrl(campaign = {}) {
  return (
    masterCampaignLinkUrl(campaign) ||
    campaign.trackingUrl ||
    campaign.destinationUrl ||
    null
  );
}

/** Detail panel + completeness: which coupon/link fields apply to this campaign. */
export function resolveClientFacingDetailFields(campaign = {}) {
  const showCoupon = isCouponType(campaign);
  const showLink = isLinkRequired(campaign);
  const fields = [];

  if (showCoupon) {
    fields.push({
      key: "couponCode",
      label: showLink ? "Coupon Code" : "Coupon/Link",
    });
  }
  if (showLink) {
    fields.push({
      key: "trackingUrl",
      label: showCoupon ? "Affiliate Link" : "Coupon/Link",
      readOnly: true,
    });
  }
  if (!showCoupon && !showLink) {
    fields.push({ key: "couponOrLink", label: "Coupon/Link", readOnly: true });
  }

  return fields;
}

export function completenessBadgeItems(campaign = {}) {
  const items = [
    { key: "customerOffer", okLabel: "Offer ✓", missLabel: "Offer Missing" },
    { key: "termsAndConditions", okLabel: "T&C ✓", missLabel: "T&C Missing" },
    { key: "expiry", okLabel: "Expiry ✓", missLabel: "Expiry Missing" },
    { key: "countries", okLabel: "Country ✓", missLabel: "Country Missing" },
  ];

  if (isCouponType(campaign)) {
    items.splice(1, 0, { key: "couponCode", okLabel: "Coupon ✓", missLabel: "Coupon Missing" });
  }
  if (isLinkRequired(campaign)) {
    const linkBadge = { key: "trackingUrl", okLabel: "Link ✓", missLabel: "Link Missing" };
    const couponIdx = items.findIndex((item) => item.key === "couponCode");
    if (couponIdx >= 0) items.splice(couponIdx + 1, 0, linkBadge);
    else items.splice(1, 0, linkBadge);
  }

  return items;
}

export function formatOffer(row = {}) {
  if (row.customerOffer) return htmlToPlainText(row.customerOffer);
  if (row.discountPercent != null && row.discountPercent !== "") {
    const n = Number(row.discountPercent);
    if (Number.isFinite(n)) return `${n}% Off`;
  }
  const coupon = Array.isArray(row.coupons) ? row.coupons[0] : null;
  if (coupon?.discountValue) return htmlToPlainText(coupon.discountValue);
  if (row.campaignDescription) return htmlToPlainText(row.campaignDescription);
  return "";
}

export function formatCountries(value) {
  return displayCountry(value, "");
}

export function slugifyCampaignName(value) {
  return slugifyName(value);
}

export function formatCampaignType(row = {}) {
  const channel = row.campaignChannelType || row.channelType;
  if (channel) {
    const upper = String(channel).toUpperCase();
    if (upper.includes("COUPON") && upper.includes("LINK")) return "Coupon Offer";
    if (upper.includes("COUPON")) return "Coupon Offer";
    if (upper.includes("DEEP")) return "Deeplink";
    if (upper.includes("PRODUCT")) return "Product Campaign";
    if (upper.includes("AFFILIATE") || upper.includes("LINK")) return "Affiliate Link";
  }
  const type = row.campaignType;
  if (!type) return "";
  return String(type)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatTracking(row = {}) {
  if (row.trackingLabel) return row.trackingLabel;
  const channel = String(row.campaignChannelType || row.channelType || "").toUpperCase();
  if (channel.includes("COUPON") && !channel.includes("LINK")) return "MBO Link → Coupon";
  if (channel.includes("DEEP")) return "MBO Link → Deeplink";
  if (channel.includes("AFFILIATE")) return "MBO Link → Affiliate";
  return "MBO Link → Landing";
}

export function formatSourceLabel(source, { recommendedId } = {}) {
  if (!source) return "—";
  const name = source.networkSource || source.supplier || "Network";
  const label = String(name)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const isRecommended = source.isPrimary || source.id === recommendedId;
  return isRecommended ? `${label} — Recommended` : label;
}

export function networkFacingFromCampaign(campaign = {}) {
  const countries = Array.isArray(campaign.country)
    ? campaign.country
    : Array.isArray(campaign.countries)
      ? campaign.countries
      : Array.isArray(campaign.countryCodes)
        ? campaign.countryCodes
        : [];
  const primaryCoupon = Array.isArray(campaign.coupons) ? campaign.coupons[0] : null;
  return {
    brandName:
      campaign.brandName ||
      campaign.merchantNameRaw ||
      campaign.merchant?.displayName ||
      campaign.brand?.name ||
      "",
    brandLogoUrl:
      campaign.brandLogoLink ||
      campaign.brandLogoUrl ||
      campaign.campaignLogoUrl ||
      campaign.merchant?.logoUrl ||
      campaign.brand?.logoUrl ||
      "",
    campaignName: htmlToPlainText(campaign.campaignName || campaign.displayName || ""),
    campaignType: formatCampaignType(campaign) || campaign.campaignType || "",
    customerOffer: formatOffer(campaign),
    offerDescription: htmlToPlainText(
      campaign.campaignDescription || campaign.campaignPromotionDescription || "",
    ),
    couponCode: isCouponType(campaign)
      ? campaign.couponCode || primaryCoupon?.couponCode || campaign.coupon?.code || ""
      : "",
    trackingUrl: resolveNetworkTrackingUrl(campaign) || "",
    termsAndConditions: htmlToPlainText(
      campaign.campaignTermsAndCondition || campaign.termsAndConditions || campaign.campaignDescription || "",
    ),
    expiry: campaign.couponExpiry || primaryCoupon?.couponEndDate || campaign.campaignEndDate || "",
    countries,
    clientCommissionPercent: campaign.clientCommissionPercent ?? null,
    currency: campaign.currencyCode || campaign.currency || campaign.defaultCurrency || null,
    slug: slugifyCampaignName(
      htmlToPlainText(campaign.campaignName || campaign.displayName || ""),
    ),
  };
}

export function mergeFacing(campaign = {}, clientFacing = {}) {
  const network = networkFacingFromCampaign(campaign);
  const overrides = clientFacing && typeof clientFacing === "object" ? clientFacing : {};
  const merged = { ...network };
  for (const [key, value] of Object.entries(overrides)) {
    if (value == null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    merged[key] = value;
  }

  merged.slug = slugifyCampaignName(merged.campaignName);

  const currencyMeta = resolveCurrencyForCountries(merged.countries);
  if (!currencyMeta.editable && currencyMeta.currency) {
    merged.currency = currencyMeta.currency;
  } else if (fieldHasValue(overrides.currency)) {
    merged.currency = String(overrides.currency).toUpperCase();
  } else if (fieldHasValue(network.currency)) {
    merged.currency = String(network.currency).toUpperCase();
  } else {
    merged.currency = currencyMeta.currency;
  }

  return { network, overrides, merged, currencyMeta };
}

export function fieldHasValue(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  const text = htmlToPlainText(value).trim();
  return text !== "" && text.toLowerCase() !== "not provided";
}

/**
 * Snapshot network + operator overrides into clientFacing so Assignment Review /
 * Assignments see the same client-ready fields without re-fetching supplier rows.
 * Keys match backend clientFacingSnapshotSchema (strict).
 */
export function toDateInputValue(value) {
  if (value == null || value === "") return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    return "";
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return "";
}

export function seedClientFacing(campaign = {}, overrides = {}) {
  const { merged } = mergeFacing(campaign, overrides);
  const expiryRaw = merged.expiry;
  const expiry =
    expiryRaw == null || expiryRaw === ""
      ? null
      : typeof expiryRaw === "string"
        ? expiryRaw
        : expiryRaw instanceof Date
          ? expiryRaw.toISOString().slice(0, 10)
          : String(expiryRaw).slice(0, 40);

  return {
    campaignName: merged.campaignName || null,
    campaignType: merged.campaignType || null,
    customerOffer: merged.customerOffer || null,
    offerDescription: merged.offerDescription || null,
    couponCode: merged.couponCode || null,
    termsAndConditions: merged.termsAndConditions || null,
    expiry,
    countries: Array.isArray(merged.countries) ? merged.countries.map(String) : [],
    brandLogoUrl: merged.brandLogoUrl || null,
    clientCommissionPercent:
      merged.clientCommissionPercent != null && merged.clientCommissionPercent !== ""
        ? Number(merged.clientCommissionPercent)
        : null,
  };
}

export function completenessOf(campaign = {}, clientFacing = {}) {
  const { merged } = mergeFacing(campaign, clientFacing);
  const missing = [];
  for (const field of REQUIRED_CLIENT_FIELDS) {
    if (typeof field.requiredIf === "function" && !field.requiredIf({ ...campaign, ...merged })) {
      continue;
    }
    if (!fieldHasValue(merged[field.key])) missing.push(field);
  }
  return {
    missing,
    missingCount: missing.length,
    complete: missing.length === 0,
    status: missing.length === 0 ? "Ready" : "Review",
    completenessLabel: missing.length === 0 ? "Complete" : `Missing ${missing.length}`,
  };
}

/** Completeness for a persisted ClientCampaignAssignment list/detail DTO. */
export function completenessOfAssignment(row = {}) {
  const facing = row.clientFacing && typeof row.clientFacing === "object" ? row.clientFacing : {};
  const campaign = assignmentAsCampaignRow(row);
  return completenessOf(campaign, facing);
}

export function resolveAssignmentTrackingUrl(row = {}) {
  return (
    row.trackingUrl ||
    row.mboTrackingUrl ||
    row.supplierMboTrackingUrl ||
    row.supplierTrackingUrl ||
    row.destinationUrl ||
    null
  );
}

export function resolveAssignmentCouponCode(row = {}) {
  const facing = row.clientFacing && typeof row.clientFacing === "object" ? row.clientFacing : {};
  return facing.couponCode || row.couponCode || null;
}

export function assignmentHasMboTracking(row = {}) {
  return Boolean(
    row.hasTrackingUrl ||
    row.trackingLinkId ||
    row.mboTrackingUrl ||
    (Array.isArray(row.trackingLinks) && row.trackingLinks.length > 0),
  );
}

export function assignmentHasNetworkLink(row = {}) {
  return fieldHasValue(resolveAssignmentTrackingUrl(row));
}

/** Normalize a client-assignment row into campaign-shaped context for facing/completeness UI. */
export function assignmentAsCampaignRow(row = {}) {
  const facing = row.clientFacing && typeof row.clientFacing === "object" ? row.clientFacing : {};
  const context = campaignContextFromAssignment(row);
  return {
    ...context,
    campaignChannelType:
      row.campaignChannelType ||
      context.campaignChannelType ||
      facing.campaignType ||
      row.channelType ||
      row.channel,
    channelType: row.channelType || row.channel,
    trackingUrl: resolveAssignmentTrackingUrl(row),
    couponCode: resolveAssignmentCouponCode(row),
  };
}

/** Build CampaignDetailsPanel campaign prop from an assignment row. */
export function campaignContextFromAssignment(row = {}) {
  const facing = row.clientFacing && typeof row.clientFacing === "object" ? row.clientFacing : {};
  return {
    id: row.canonicalCampaignId || row.id,
    brandName: row.brandName || facing.brandName,
    brandLogoLink: row.brandLogoLink || facing.brandLogoUrl,
    campaignName: facing.campaignName || row.canonicalCampaign?.displayName,
    displayName: row.canonicalCampaign?.displayName,
    campaignType: facing.campaignType,
    campaignChannelType:
      row.campaignChannelType || facing.campaignType || row.channelType || row.channel,
    customerOffer: facing.customerOffer,
    campaignDescription: facing.offerDescription,
    couponCode: resolveAssignmentCouponCode(row),
    trackingUrl: resolveAssignmentTrackingUrl(row),
    mboTrackingUrl: row.supplierMboTrackingUrl || row.mboTrackingUrl || null,
    destinationUrl: row.destinationUrl || null,
    termsAndConditions: facing.termsAndConditions,
    campaignTermsAndCondition: facing.termsAndConditions,
    couponExpiry: facing.expiry,
    campaignEndDate: facing.expiry,
    countries: facing.countries?.length ? facing.countries : row.canonicalCampaign?.countries,
    country: facing.countries?.length ? facing.countries : row.canonicalCampaign?.countries,
    currencyCode: facing.currency,
    networkSource: row.networkSource,
    clientCommissionPercent: facing.clientCommissionPercent,
  };
}

export function sourceTagForField(key, { network, overrides, merged, currencyMeta } = {}) {
  if (key === "brandName" || key === "brandLogoUrl") {
    return fieldHasValue(merged?.[key]) ? { label: "MBO Brand Master", tone: "purple" } : { label: "Missing", tone: "warning" };
  }
  if (key === "slug") {
    return fieldHasValue(merged?.slug)
      ? { label: "Derived", tone: "info" }
      : { label: "Missing", tone: "warning" };
  }
  if (key === "currency") {
    const meta = currencyMeta || resolveCurrencyForCountries(merged?.countries);
    if (!fieldHasValue(merged?.currency)) {
      return { label: "Missing", tone: "warning" };
    }
    if (!meta.editable && meta.currency) {
      return { label: "Derived", tone: "info" };
    }
    if (overrides && fieldHasValue(overrides.currency)) {
      return { label: "Operator", tone: "info" };
    }
    if (fieldHasValue(network?.currency)) {
      return { label: "Network", tone: "info" };
    }
    return { label: "Derived", tone: "info" };
  }
  if (key === "clientCommissionPercent") {
    return fieldHasValue(merged?.[key])
      ? { label: "Client Commercial", tone: "gold" }
      : { label: "Missing", tone: "warning" };
  }
  if (key === "trackingUrl") {
    return fieldHasValue(merged?.trackingUrl)
      ? { label: "Network", tone: "info" }
      : { label: "Missing", tone: "warning" };
  }
  if (key === "couponOrLink") {
    const hasCoupon = fieldHasValue(merged?.couponCode);
    const hasLink = fieldHasValue(merged?.trackingUrl);
    return hasCoupon || hasLink
      ? { label: "Network", tone: "info" }
      : { label: "Missing", tone: "warning" };
  }
  if (overrides && fieldHasValue(overrides[key]) && String(overrides[key]) !== String(network?.[key] ?? "")) {
    return { label: "Operator", tone: "info" };
  }
  if (fieldHasValue(network?.[key])) return { label: "Network", tone: "info" };
  return { label: "Missing", tone: "warning" };
}

export function parseCampaignListResponse(res) {
  if (!res || typeof res !== "object") return { items: [], pagination: null };
  const items = Array.isArray(res.data) ? res.data : Array.isArray(res.items) ? res.items : [];
  return { items, pagination: res.pagination ?? null };
}

export function parseClientsResponse(res) {
  if (!res || typeof res !== "object") return [];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.items)) return res.items;
  return [];
}

export function commercialRuleLabel(client) {
  if (!client) return "—";
  if (client.commercialModel) return "Configured";
  return "Not configured";
}

export function clientStatusLabel(client) {
  return client?.status || "—";
}

export function displayFacing(value, fallback = "Not Provided") {
  if (!fieldHasValue(value)) return fallback;
  if (Array.isArray(value)) return value.join(", ");
  return displayText(htmlToPlainText(value), fallback);
}

function normalizeRelationship(raw) {
  if (raw == null || raw === "") return null;
  const v = String(raw).toUpperCase().trim();
  if (v === "JOINED" || v === "APPROVED") return v === "APPROVED" ? "APPROVED" : "JOINED";
  if (v === "NOT_JOINED" || v === "NOT_APPLIED") return "NOT_JOINED";
  if (v === "PENDING" || v === "REQUIRES_APPROVAL") return v;
  if (v === "REJECTED" || v === "SUSPENDED" || v === "UNKNOWN") return v;
  return "UNKNOWN";
}

/**
 * Blueprint §8 assignability — mirrors backend deriveIsAssignable.
 * Prefer selected source; otherwise best primary / assignable source on the campaign.
 */
export function resolveCampaignSource(campaign = {}, selectedSourceId = null) {
  const sources = Array.isArray(campaign.sources) ? campaign.sources : [];
  if (selectedSourceId) {
    const matched = sources.find((s) => s.id === selectedSourceId);
    if (matched) return matched;
  }
  return (
    sources.find((s) => s.isAssignable && s.isPrimary) ||
    sources.find((s) => s.isAssignable) ||
    sources.find((s) => s.isPrimary) ||
    sources[0] ||
    null
  );
}

export function assignabilityOf(campaign = {}, selectedSourceId = null) {
  if (typeof campaign.isAssignable === "boolean" && !selectedSourceId && !campaign.sources?.length) {
    return {
      assignable: campaign.isAssignable,
      blockers: campaign.assignabilityBlockers || [],
      source: null,
      relationshipStatus: campaign.relationshipStatus || null,
      supportsLink: Boolean(campaign.supportsLink),
      supportsCoupon: Boolean(campaign.supportsCoupon),
      supportsDeeplink: Boolean(campaign.supportsDeeplink),
      commissionAvailable: Boolean(campaign.commissionAvailable),
    };
  }

  const source = resolveCampaignSource(campaign, selectedSourceId);
  const campaignStatus = String(campaign.campaignStatus || campaign.catalogStatus || "").toUpperCase();
  const relationshipStatus =
    normalizeRelationship(source?.relationshipStatus) ||
    normalizeRelationship(campaign.relationshipStatus) ||
    (campaign.isJoined ? "JOINED" : null);
  const supportsLink =
    source?.supportsLink === true ||
    Boolean(campaign.supportsLink) ||
    Boolean(campaign.trackingUrl);
  const supportsCoupon = source?.supportsCoupon === true || Boolean(campaign.supportsCoupon);
  const channels = Array.isArray(source?.channelSupport) ? source.channelSupport : [];
  const supportsDeeplink =
    source?.supportsDeeplink === true ||
    Boolean(campaign.supportsDeeplink) ||
    Boolean(campaign.deepLinkingEnabled) ||
    channels.some((c) => String(c).toUpperCase().includes("DEEP"));
  const commissionAvailable =
    source?.commissionAvailable === true ||
    Boolean(campaign.commissionAvailable) ||
    (source?.grossCommission != null && String(source.grossCommission).trim() !== "") ||
    (campaign.defaultCommissionValue != null && String(campaign.defaultCommissionValue).trim() !== "");
  const hasCampaignSource = Boolean(source?.id || campaign.campaignSourceId || campaign.primaryCampaignSourceId);
  const blockers = [];
  if (!hasCampaignSource) blockers.push("No campaign source");
  if (campaignStatus !== "ACTIVE") blockers.push("Campaign not ACTIVE");
  if (relationshipStatus !== "JOINED" && relationshipStatus !== "APPROVED") {
    blockers.push("Relationship not JOINED/APPROVED");
  }
  if (!(supportsLink || supportsCoupon || supportsDeeplink)) {
    blockers.push("No link/coupon/deeplink support");
  }
  if (!commissionAvailable) blockers.push("No commission rule");

  const assignable =
    typeof source?.isAssignable === "boolean" && source.id === (selectedSourceId || source.id)
      ? source.isAssignable && campaignStatus === "ACTIVE"
      : hasCampaignSource &&
        campaignStatus === "ACTIVE" &&
        (relationshipStatus === "JOINED" || relationshipStatus === "APPROVED") &&
        (supportsLink || supportsCoupon || supportsDeeplink) &&
        commissionAvailable;

  return {
    assignable,
    blockers: assignable ? [] : blockers,
    source,
    relationshipStatus,
    supportsLink,
    supportsCoupon,
    supportsDeeplink,
    commissionAvailable,
  };
}

/**
 * Publish checklist for a persisted ClientCampaignAssignment row (staff DTO).
 * Uses assignment fields — do not re-derive from incomplete campaign context.
 */
export function publishReadinessOfAssignment(row = {}) {
  const facingComplete = completenessOfAssignment(row);
  const facing = row.clientFacing && typeof row.clientFacing === "object" ? row.clientFacing : {};
  const campaign = assignmentAsCampaignRow(row);
  const linkCampaign = isLinkRequired(campaign);
  const commissionPercent =
    facing.clientCommissionPercent ?? row.clientSharePercent ?? row.client?.clientSharePercent;
  const hasCommission = fieldHasValue(commissionPercent) || Boolean(row.commissionRuleId);
  const hasMboTracking = assignmentHasMboTracking(row);
  const hasNetworkLink = assignmentHasNetworkLink(row);
  const hasTracking = linkCampaign ? hasNetworkLink || hasMboTracking : hasMboTracking;
  const couponOk =
    !isCouponType({
      campaignType: facing.campaignType || row.channelType || row.channel,
      campaignChannelType: facing.campaignType || row.channelType || row.campaignChannelType,
    }) || fieldHasValue(facing.couponCode || row.couponCode);

  const missing = [...facingComplete.missing];
  if (!hasCommission) missing.push({ key: "clientCommissionPercent", label: "Commission %" });
  if (linkCampaign && !hasTracking) missing.push({ key: "tracking", label: "Tracking link" });
  if (!couponOk) missing.push({ key: "couponCode", label: "Coupon" });

  const checks = {
    clientFacing: facingComplete.complete,
    commission: hasCommission,
    tracking: !linkCampaign || hasTracking,
    coupon: couponOk,
  };
  const ready = Object.values(checks).every(Boolean);
  return {
    missing,
    missingCount: missing.length,
    complete: ready,
    ready,
    checks,
    status: ready ? "Ready" : "Review",
    completenessLabel: ready ? "Ready to publish" : `Missing ${missing.length}`,
  };
}

/**
 * Publish checklist: client-facing completeness + assignability + commercial + tracking/coupon.
 */
export function publishReadinessOf(campaign = {}, clientFacing = {}, extras = {}) {
  const complete = completenessOf(campaign, clientFacing);
  const eligibility = assignabilityOf(campaign, extras.selectedSourceId);
  const facing = mergeFacing(campaign, clientFacing).merged;
  const missing = [...complete.missing];
  const checks = {
    clientFacing: complete.complete,
    assignable: eligibility.assignable,
    commission: fieldHasValue(facing.clientCommissionPercent) || fieldHasValue(extras.clientSharePercent),
    tracking: Boolean(extras.hasTrackingLink) || eligibility.supportsLink || eligibility.supportsDeeplink,
    coupon:
      !isCouponType({ ...campaign, campaignType: facing.campaignType || campaign.campaignType }) ||
      fieldHasValue(facing.couponCode),
  };
  if (!checks.commission) missing.push({ key: "clientCommissionPercent", label: "Commission %" });
  if (!checks.tracking) missing.push({ key: "tracking", label: "Tracking" });
  if (!checks.coupon) missing.push({ key: "couponCode", label: "Coupon" });
  if (!checks.assignable) {
    for (const blocker of eligibility.blockers) {
      missing.push({ key: "assignability", label: blocker });
    }
  }
  const ready = Object.values(checks).every(Boolean);
  return {
    ...complete,
    missing,
    missingCount: missing.length,
    complete: ready,
    ready,
    checks,
    eligibility,
    status: ready ? "Ready" : "Review",
    completenessLabel: ready ? "Ready to publish" : `Missing ${missing.length}`,
  };
}

export function toSupplierCampaignQueryFilters(filters = {}) {
  const next = { forMaster: true };
  if (filters.q) next.search = filters.q;
  if (filters.networkSource) next.supplier = filters.networkSource;
  if (filters.campaignStatus) next.campaignStatus = filters.campaignStatus;
  if (filters.participationStatus) next.participationStatus = filters.participationStatus;
  return next;
}

/** Client-side filter for assignable / relationship / channel after forMaster list. */
export function filterMasterCampaignRows(rows = [], filters = {}) {
  let next = Array.isArray(rows) ? [...rows] : [];
  if (filters.assignable === "true" || filters.assignable === true) {
    next = next.filter((row) => assignabilityOf(row).assignable);
  } else if (filters.assignable === "false" || filters.assignable === false) {
    next = next.filter((row) => !assignabilityOf(row).assignable);
  }
  if (filters.relationshipStatus) {
    const want = String(filters.relationshipStatus).toUpperCase();
    next = next.filter((row) => {
      const rel = String(assignabilityOf(row).relationshipStatus || "").toUpperCase();
      if (want === "NOT_JOINED") return rel === "NOT_JOINED" || rel === "NOT_APPLIED";
      return rel === want;
    });
  }
  if (filters.channelSupport === "link") {
    next = next.filter((row) => assignabilityOf(row).supportsLink);
  } else if (filters.channelSupport === "coupon") {
    next = next.filter((row) => assignabilityOf(row).supportsCoupon);
  } else if (filters.channelSupport === "deeplink") {
    next = next.filter((row) => assignabilityOf(row).supportsDeeplink);
  }
  return next;
}

export function flattenCampaignSources(campaigns = []) {
  const rows = [];
  for (const campaign of campaigns) {
    const sources = Array.isArray(campaign.sources) ? campaign.sources : [];
    if (!sources.length) continue;
    for (const source of sources) {
      const eligibility = assignabilityOf(campaign, source.id);
      rows.push({
        ...source,
        campaignId: campaign.id,
        campaignName: campaign.campaignName || campaign.displayName || source.campaignName,
        campaignStatus: campaign.campaignStatus || campaign.catalogStatus || source.campaignStatus,
        brandName: campaign.brandName || source.brandName,
        brandLogoUrl: campaign.brandLogoUrl || campaign.brandLogoLink || source.brandLogoUrl,
        networkSource: source.networkSource || campaign.networkSource || campaign.supplier,
        supplier: source.supplier || campaign.supplier,
        isAssignable: eligibility.assignable,
        assignabilityBlockers: eligibility.blockers,
        relationshipStatus: eligibility.relationshipStatus || source.relationshipStatus,
        supportsLink: eligibility.supportsLink,
        supportsCoupon: eligibility.supportsCoupon,
        supportsDeeplink: eligibility.supportsDeeplink,
        commissionAvailable: eligibility.commissionAvailable,
        canonicalCampaignId: source.canonicalCampaignId || campaign.canonicalCampaignId,
      });
    }
  }
  return rows;
}

export function currencyHintForCountries(countries = []) {
  const meta = resolveCurrencyForCountries(countries);
  return {
    currency: meta.currency || null,
    editable: Boolean(meta.editable),
    label: meta.currency
      ? meta.editable
        ? `${meta.currency} (editable)`
        : `${meta.currency} (derived)`
      : "—",
  };
}

export function toNetworkBrandQueryFilters(filters = {}) {
  const next = {};
  if (filters.search) next.search = filters.search;
  if (filters.networkSource) next.supplier = filters.networkSource;
  if (filters.status) next.status = filters.status;
  if (filters.country) next.country = filters.country;
  return next;
}

/** v11 Master Catalog — Available / — for coupon, link, products cells. */
export function formatAssetAvailability(available) {
  if (available === true) return "Available";
  if (available === false || available == null) return "—";
  return String(available);
}

export function formatCommissionDisplay(row = {}) {
  if (row.commissionDisplay) return row.commissionDisplay;
  const value = row.defaultCommissionValue ?? row.grossCommission ?? row.clientCommissionPercent;
  if (value == null || value === "") return "—";
  const unit = String(row.commissionUnit || "PERCENT").toUpperCase();
  if (unit === "PERCENT" || unit === "%") return `${value}%`;
  return `${value}${unit ? ` ${unit}` : ""}`;
}

/**
 * Allocation Mode (v11 Assign / Review). Prefer explicit draft value; otherwise derive.
 */
export function deriveAllocationMode(row = {}, clientFacing = {}) {
  if (clientFacing.allocationMode) return clientFacing.allocationMode;
  if (row.allocationMode) return row.allocationMode;
  const scope = String(row.scope || clientFacing.scope || "").toUpperCase();
  if (scope === "UNIQUE_TO_CLIENT") return "Unique to Client";
  if (scope === "SHARED_LIMITED") return "Shared limited code";
  if (scope === "UNLIMITED") return "Shared / unlimited code";
  const coupon = clientFacing.couponCode || masterCampaignCouponCode(row);
  if (coupon) return "New available code";
  if (isAffiliateLinkType(row) || row.mboTrackingUrl || row.trackingUrl) return "Link only";
  return "—";
}

export function formatCouponScope(scope) {
  const key = String(scope || "").toUpperCase();
  if (key === "UNIQUE_TO_CLIENT") return "Unique to Client";
  if (key === "SHARED_LIMITED") return "Shared Limited";
  if (key === "UNLIMITED") return "Unlimited / Shared";
  if (key === "UNKNOWN" || !key) return "—";
  return String(scope)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function recommendedAlertAction(row = {}) {
  if (row.recommendedAction) return row.recommendedAction;
  const scope = String(row.scope || "").toUpperCase();
  if (scope === "UNIQUE_TO_CLIENT") return "No action — already unique";
  if (scope === "SHARED_LIMITED" || scope === "UNLIMITED") {
    return "Review for upgrade to unique code";
  }
  if (row.newCodeAlert) return "Review new code before assignment";
  return "—";
}

