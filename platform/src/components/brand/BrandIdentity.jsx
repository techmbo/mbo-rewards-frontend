import { useState } from "react";
import { displayText } from "../../utils/display";

/**
 * Shared brand identity cell — real logo when URL present, initials fallback otherwise.
 * Never invents logos; broken images fall back to initials.
 */
export function BrandIdentity({
  name,
  logoUrl,
  size = "sm",
  className = "",
  nameClassName = "",
  truncate = true,
}) {
  const [failed, setFailed] = useState(false);
  const label = displayText(name);
  const initials = (name || "?")
    .trim()
    .slice(0, 2)
    .toUpperCase() || "?";
  const dim =
    size === "lg"
      ? "h-14 w-14 text-lg"
      : size === "md"
        ? "h-9 w-9 text-xs"
        : "h-7 w-7 text-[10px]";
  const showImage = Boolean(logoUrl) && !failed;
  const altText = name ? `${String(name).trim()} logo` : "Brand logo";

  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`.trim()}>
      {showImage ? (
        <img
          alt={altText}
          src={logoUrl}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={`${dim} shrink-0 rounded-md border border-slate-100 bg-white object-contain`}
        />
      ) : (
        <span
          role="img"
          aria-label={name ? `${String(name).trim()} (no logo)` : "Brand (no logo)"}
          className={`${dim} grid shrink-0 place-items-center rounded-md bg-slate-100 font-bold text-slate-500`}
        >
          {initials}
        </span>
      )}
      <span
        className={`${truncate ? "truncate" : "whitespace-nowrap"} font-medium text-slate-900 ${nameClassName}`.trim()}
        title={label === "—" ? undefined : label}
      >
        {label}
      </span>
    </div>
  );
}

/** Resolve logo/name from allocation / admin / assignment / client DTO shapes. */
export function brandFromRow(row = {}) {
  const brand = row.brand && typeof row.brand === "object" ? row.brand : null;
  const brandAsString = typeof row.brand === "string" ? row.brand.trim() || null : null;
  const merchant =
    row.canonicalCampaign?.merchant ||
    row.merchant ||
    (row.merchantId && row.displayName ? row : null);
  return {
    name:
      brand?.name ||
      brandAsString ||
      row.brandName ||
      row.merchantNameRaw ||
      merchant?.displayName ||
      row.canonicalCampaign?.merchant?.displayName ||
      null,
    logoUrl:
      brand?.logoUrl ||
      row.brandLogoLink ||
      row.brandLogoUrl ||
      row.campaignLogoUrl ||
      merchant?.logoUrl ||
      row.canonicalCampaign?.merchant?.logoUrl ||
      null,
    websiteUrl:
      brand?.websiteUrl ||
      row.brandWebsiteLink ||
      row.brandWebsiteUrl ||
      row.brandWebsite ||
      merchant?.website ||
      null,
  };
}
