import { useState } from "react";
import { Drawer } from "../ui/Drawer";
import { StatusPill } from "../ui/StatusPill";
import { Button } from "../ui/Button";
import { UrlCell } from "../ui/TableCells";
import { BrandIdentity } from "../brand/BrandIdentity";
import { Icon } from "../ui/Icon";
import {
  countryListTitle,
  displayCountry,
  displayDate,
  displayText,
  truncateWords,
  coerceDetailValue,
  isCreativeArray,
  isCountryFieldKey,
} from "../../utils/display";

function DetailField({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800">{children ?? "—"}</dd>
    </div>
  );
}

function stageIcon(state) {
  if (state === "COMPLETED") return <Icon name="check" size={14} />;
  if (state === "NEEDS_REVIEW") return <Icon name="warning" size={14} />;
  if (state === "BLOCKED") return <Icon name="cancel" size={14} />;
  return <Icon name="radio_button_unchecked" size={14} />;
}

function stageClass(state) {
  if (state === "COMPLETED") return "text-emerald-700";
  if (state === "NEEDS_REVIEW") return "text-amber-700";
  if (state === "BLOCKED") return "text-rose-700";
  return "text-slate-400";
}

function TruncateLink({ href, label }) {
  if (!href) return "—";
  const text = label || href;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="break-all text-brand-800 hover:underline"
      title={href}
    >
      {text.length > 64 ? `${text.slice(0, 64)}…` : text}
    </a>
  );
}

function CountryCell({ country }) {
  const label = displayCountry(country);
  const title = countryListTitle(country);
  return (
    <span className="block truncate whitespace-nowrap text-sm text-slate-700" title={title || undefined}>
      {label}
    </span>
  );
}

function BoolOrDash({ value, yes = "Yes", no = "No" }) {
  if (value == null) return "—";
  return value ? yes : no;
}

function DetailFieldValue({ fieldKey, value, depth = 0 }) {
  const parsed = coerceDetailValue(value);
  if (parsed == null) return "—";

  if (fieldKey === "trackierFieldLineage" && typeof parsed === "object" && !Array.isArray(parsed)) {
    return (
      <dl className="space-y-1.5 text-xs">
        {Object.entries(parsed).map(([canonical, meta]) => (
          <div key={canonical} className="rounded border border-slate-200 bg-white px-2 py-1.5">
            <dt className="font-semibold text-slate-700">{canonical}</dt>
            <dd className="mt-0.5 text-slate-600">
              {meta?.sourceField ? (
                <span className="text-slate-500">from {meta.sourceField}: </span>
              ) : null}
              <DetailFieldValue fieldKey={canonical} value={meta?.value} depth={depth + 1} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  if (fieldKey === "creatives" || isCreativeArray(parsed)) {
    return <CreativeList items={parsed} />;
  }

  if (isCountryFieldKey(fieldKey)) {
    const label = displayCountry(parsed);
    const title = countryListTitle(parsed);
    return (
      <span title={title && title !== label ? title : undefined}>
        {label}
      </span>
    );
  }

  if (typeof parsed === "boolean") {
    return parsed ? "Yes" : "No";
  }

  if (typeof parsed === "number") {
    return String(parsed);
  }

  if (typeof parsed === "string") {
    if (/^https?:\/\//i.test(parsed.trim())) {
      return <TruncateLink href={parsed.trim()} />;
    }
    const text = displayText(parsed, "");
    if (!text) return "—";
    if (text.includes("\n")) {
      return <span className="whitespace-pre-wrap break-words">{text}</span>;
    }
    return <span className="break-words">{text}</span>;
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return "—";
    if (parsed.every((item) => item == null || typeof item === "string" || typeof item === "number")) {
      return parsed.filter((item) => item != null && item !== "").join(", ");
    }
    return (
      <ul className="list-inside list-disc space-y-1 text-xs">
        {parsed.slice(0, 12).map((item, index) => (
          <li key={index} className="break-words">
            <DetailFieldValue fieldKey={fieldKey} value={item} depth={depth + 1} />
          </li>
        ))}
        {parsed.length > 12 ? (
          <li className="list-none text-slate-500">+{parsed.length - 12} more</li>
        ) : null}
      </ul>
    );
  }

  if (typeof parsed === "object") {
    if (depth >= 2) {
      return <span className="break-all font-mono text-xs text-slate-600">{JSON.stringify(parsed)}</span>;
    }
    return (
      <dl className="space-y-1 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs">
        {Object.entries(parsed)
          .slice(0, 24)
          .map(([key, nested]) => (
            <div key={key} className="grid grid-cols-[minmax(80px,120px)_1fr] gap-2">
              <dt className="font-medium text-slate-500">{key}</dt>
              <dd className="min-w-0 text-slate-800">
                <DetailFieldValue fieldKey={key} value={nested} depth={depth + 1} />
              </dd>
            </div>
          ))}
      </dl>
    );
  }

  return String(parsed);
}

function CreativeList({ items }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return "—";
  return (
    <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
      {list.slice(0, 24).map((item, index) => {
        const url = item?.full_url ?? item?.url ?? item?.image_url ?? null;
        const title = item?.title || item?.file_name || `Creative ${index + 1}`;
        const width = item?.dimensions?.width;
        const height = item?.dimensions?.height;
        const isImage = String(item?.mime_type || url || "").includes("image");
        return (
          <li
            key={`${url || title}-${index}`}
            className="flex gap-2 rounded-lg border border-slate-200 bg-white p-2"
          >
            {url && isImage ? (
              <img
                src={url}
                alt=""
                className="h-12 w-20 shrink-0 rounded border border-slate-100 object-contain bg-slate-50"
                loading="lazy"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800" title={title}>
                {title}
              </p>
              {width && height ? (
                <p className="text-[11px] text-slate-500">
                  {width}×{height}
                  {item?.mime_type ? ` · ${item.mime_type}` : ""}
                </p>
              ) : null}
              {url ? <TruncateLink href={url} label="Open asset" /> : null}
            </div>
          </li>
        );
      })}
      {list.length > 24 ? (
        <li className="text-xs text-slate-500">+{list.length - 24} more creatives</li>
      ) : null}
    </ul>
  );
}

function KvViewer({ data }) {
  if (!data || typeof data !== "object") {
    return <p className="text-sm text-slate-500">No source data available.</p>;
  }
  const entries = Object.entries(data).slice(0, 80);
  return (
    <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50/50">
      {entries.map(([key, value]) => (
        <div key={key} className="grid grid-cols-[140px_1fr] gap-3 px-3 py-2 text-sm">
          <dt className="font-medium text-slate-500">{key}</dt>
          <dd className="min-w-0 text-slate-800">
            <DetailFieldValue fieldKey={key} value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ImportedRecordDetailDrawer({
  detail,
  detailLoading,
  detailError,
  onClose,
  canReprocess = false,
  actionMsg = "",
  actionBusy = false,
  onReprocess,
  onRetry,
}) {
  const [showSource, setShowSource] = useState(false);

  return (
    <Drawer
      open={Boolean(detail) || detailLoading || Boolean(detailError)}
      onClose={onClose}
      title={detail?.campaign || detail?.sourceRecordId || "Imported record"}
    >
      {detailLoading ? <p className="text-sm text-slate-500">Loading…</p> : null}
      {detailError ? <p className="text-sm text-rose-600">{detailError}</p> : null}
      {detail ? (
        <div className="space-y-6">
          {actionMsg ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {actionMsg}
            </p>
          ) : null}

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Pipeline
            </h3>
            <ol className="space-y-2">
              {(detail.pipeline || []).map((stage) => (
                <li key={stage.key} className={`flex gap-2 text-sm ${stageClass(stage.state)}`}>
                  <span className="w-4 font-semibold">{stageIcon(stage.state)}</span>
                  <div>
                    <p className="font-medium text-slate-800">{stage.label}</p>
                    {stage.detail ? <p className="text-xs text-slate-500">{stage.detail}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Identity
            </h3>
            <dl className="grid grid-cols-2 gap-3">
              <DetailField label="Network">{detail.identity?.network || detail.network}</DetailField>
              <DetailField label="Network account">
                {detail.identity?.networkAccount || detail.networkAccount || "—"}
              </DetailField>
              <DetailField label="Raw payload ID">
                {detail.identity?.rawPayloadId || detail.rawPayloadId || "—"}
              </DetailField>
              <DetailField label="Supplier campaign ID">
                {detail.identity?.supplierCampaignId || detail.supplierCampaignExtId || "—"}
              </DetailField>
              <DetailField label="Campaign source ID">
                {detail.identity?.campaignSourceId || detail.campaignSourceId || "—"}
              </DetailField>
              <DetailField label="Network campaign ID">
                {detail.identity?.networkCampaignId || detail.networkCampaignId || "—"}
              </DetailField>
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Brand
            </h3>
            <dl className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Brand</dt>
                <dd className="mt-1">
                  <BrandIdentity
                    name={detail.brandDetail?.brand || detail.brand}
                    logoUrl={detail.brandDetail?.brandLogoLink || detail.brandLogoLink}
                  />
                </dd>
              </div>
              <DetailField label="Brand website">
                <TruncateLink href={detail.brandDetail?.brandWebsite || detail.brandWebsiteLink} />
              </DetailField>
              <DetailField label="Campaign">
                {detail.brandDetail?.campaign || detail.campaign || "—"}
              </DetailField>
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Source / tracking
            </h3>
            <dl className="grid grid-cols-2 gap-3">
              <DetailField label="Network tracking link">
                <TruncateLink href={detail.tracking?.networkTrackingLink || detail.networkTrackingLink} />
              </DetailField>
              <DetailField label="MBO tracking link">
                <UrlCell
                  url={
                    detail.tracking?.mboTrackingLink ||
                    detail.mboTrackingLink ||
                    detail.normalized?.mboTrackingUrl ||
                    null
                  }
                  missingLabel="Not generated"
                />
              </DetailField>
              <DetailField label="Tracking link ID">
                {detail.tracking?.trackingLinkId || detail.trackingLinkId || "—"}
              </DetailField>
              <DetailField label="Network click ID">
                {detail.tracking?.networkClickId ?? "—"}
              </DetailField>
              <DetailField label="MBO click ID">{detail.tracking?.mboClickId ?? "—"}</DetailField>
              <DetailField label="Sub IDs">
                {[detail.tracking?.subId1, detail.tracking?.subId2, detail.tracking?.subId3]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </DetailField>
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Campaign
            </h3>
            <dl className="grid grid-cols-2 gap-3">
              <DetailField label="Primary category">
                {detail.campaignDetail?.category || detail.category || "—"}
              </DetailField>
              <DetailField label="Secondary category">
                {detail.campaignDetail?.secondaryCategory || detail.secondaryCategory || "—"}
              </DetailField>
              <DetailField label="Country">
                <CountryCell country={detail.campaignDetail?.country ?? detail.country} />
              </DetailField>
              <DetailField label="Currency">
                {detail.campaignDetail?.currency || detail.currency || "—"}
              </DetailField>
              <DetailField label="Campaign type">
                {detail.campaignDetail?.campaignType || detail.campaignType || "—"}
              </DetailField>
              <DetailField label="Commercial type">
                {detail.campaignDetail?.commercialType || detail.commercialType || "—"}
              </DetailField>
              <DetailField label="Channel type">
                {detail.campaignDetail?.channelType || detail.channelType || "—"}
              </DetailField>
              <DetailField label="Relationship status">
                {detail.campaignDetail?.relationshipStatus || detail.relationshipStatus || "—"}
              </DetailField>
              <DetailField label="Campaign status">
                {detail.campaignDetail?.campaignStatus || detail.campaignStatus || "—"}
              </DetailField>
              <DetailField label="Is Assignable">
                <BoolOrDash
                  value={detail.campaignDetail?.isAssignable ?? detail.isAssignable}
                />
              </DetailField>
              <DetailField label="Start date">
                {displayDate(detail.campaignDetail?.startDate || detail.startDate)}
              </DetailField>
              <DetailField label="End date">
                {displayDate(detail.campaignDetail?.endDate || detail.endDate)}
              </DetailField>
              <DetailField label="Discount %">
                {detail.campaignDetail?.discountPercent != null
                  ? String(detail.campaignDetail.discountPercent)
                  : detail.discountPercent != null
                    ? String(detail.discountPercent)
                    : "—"}
              </DetailField>
              <DetailField label="Campaign description">
                {detail.campaignDetail?.campaignDescription || detail.campaignDescription || "—"}
              </DetailField>
              <DetailField label="Promotion description">
                {detail.campaignDetail?.promotionDescription || detail.promotionDescription || "—"}
              </DetailField>
              <DetailField label="Terms and conditions">
                {detail.campaignDetail?.termsAndConditions || detail.termsAndConditions || "—"}
              </DetailField>
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Commercial
            </h3>
            <dl className="grid grid-cols-2 gap-3">
              <DetailField label="Commission">
                {detail.commercial?.commissionDisplay ||
                  detail.commissionDisplay ||
                  (detail.commercial?.commission != null
                    ? String(detail.commercial.commission)
                    : "—")}
              </DetailField>
              <DetailField label="Commission type">
                {detail.commercial?.commissionType || detail.commissionType || "—"}
              </DetailField>
              <DetailField label="Commission rate">
                {detail.commercial?.commissionRate != null
                  ? String(detail.commercial.commissionRate)
                  : "—"}
              </DetailField>
              <DetailField label="Commission rule count">
                {detail.commercial?.commissionRuleCount ?? detail.commissionRuleCount ?? "—"}
              </DetailField>
              <DetailField label="Currency">
                {detail.commercial?.commissionCurrency || "—"}
              </DetailField>
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Assets
            </h3>
            <dl className="grid grid-cols-2 gap-3">
              <DetailField label="Link">
                <BoolOrDash value={detail.assetsDetail?.link ?? detail.assets?.link} yes="Available" no="—" />
              </DetailField>
              <DetailField label="Coupon">
                <BoolOrDash value={detail.assetsDetail?.coupon ?? detail.assets?.coupon} yes="Available" no="—" />
              </DetailField>
              <DetailField label="Deeplink">
                <BoolOrDash
                  value={detail.assetsDetail?.deeplink ?? detail.assets?.deeplink}
                  yes="Available"
                  no="—"
                />
              </DetailField>
              <DetailField label="Feed">
                <BoolOrDash value={detail.assetsDetail?.feed ?? detail.assets?.feed} yes="Available" no="—" />
              </DetailField>
              <DetailField label="Coupon count">
                {detail.ingestion?.couponCount ?? detail.couponCount ?? "—"}
              </DetailField>
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Ingestion
            </h3>
            <dl className="grid grid-cols-2 gap-3">
              <DetailField label="Source status">
                <StatusPill status={detail.ingestion?.sourceStatus || detail.sourceStatus} />
              </DetailField>
              <DetailField label="Mapping status">
                <StatusPill status={detail.ingestion?.mappingStatus || detail.mappingStatus} />
              </DetailField>
              <DetailField label="Certification">
                {detail.ingestion?.certificationStatus || detail.certificationStatus || "—"}
              </DetailField>
              <DetailField label="Is Assignable">
                {detail.entityType === "campaign" ? (
                  <BoolOrDash value={detail.ingestion?.isAssignable ?? detail.isAssignable} />
                ) : (
                  "—"
                )}
              </DetailField>
              <DetailField label="Last synced">
                {displayDate(detail.ingestion?.lastSyncedAt || detail.lastSyncedAt)}
              </DetailField>
              <DetailField label="Last updated">
                {displayDate(detail.ingestion?.lastUpdated || detail.lastUpdated)}
              </DetailField>
              <DetailField label="Imported at">
                {displayDate(detail.ingestion?.importedAt || detail.importedAt)}
              </DetailField>
              <DetailField label="Issue">
                {(() => {
                  const full =
                    detail.ingestion?.issueCode && (detail.ingestion?.issue || detail.issue)
                      ? `${detail.ingestion?.issue || detail.issue} (${detail.ingestion.issueCode})`
                      : detail.ingestion?.issue || detail.issue || "";
                  return (
                    <span className="text-sm text-slate-700" title={full || undefined}>
                      {truncateWords(full, 4)}
                    </span>
                  );
                })()}
              </DetailField>
              <DetailField label="Source endpoint">
                {detail.source?.sourceEndpoint || "—"}
              </DetailField>
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Source
            </h3>
            <dl className="grid grid-cols-2 gap-3">
              <DetailField label="Network">{detail.source?.network}</DetailField>
              <DetailField label="Record type">{detail.source?.recordType}</DetailField>
              <DetailField label="Source record ID">{detail.source?.sourceRecordId}</DetailField>
              <DetailField label="Raw payload ref">
                {detail.source?.rawPayloadReference?.id || "—"}
              </DetailField>
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Detected information
            </h3>
            {Object.keys(detail.detected || {}).length === 0 ? (
              <p className="text-sm text-slate-500">No detected fields on this record.</p>
            ) : (
              <dl className="grid grid-cols-2 gap-3">
                {Object.entries(detail.detected).map(([key, value]) => (
                  <DetailField key={key} label={key}>
                    <DetailFieldValue fieldKey={key} value={value} />
                  </DetailField>
                ))}
              </dl>
            )}
          </section>

          <section className="flex flex-wrap gap-2">
            {canReprocess && onReprocess ? (
              <Button size="sm" disabled={actionBusy} onClick={onReprocess}>
                Reprocess
              </Button>
            ) : null}
            {canReprocess && detail.openMapperErrorId && onRetry ? (
              <Button
                size="sm"
                variant="secondary"
                disabled={actionBusy}
                onClick={() => onRetry(detail.openMapperErrorId)}
              >
                Retry
              </Button>
            ) : null}
            <Button size="sm" variant="ghost" onClick={() => setShowSource((v) => !v)}>
              {showSource ? "Hide source data" : "View source data"}
            </Button>
          </section>

          {showSource ? (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Source data
              </h3>
              <KvViewer data={detail.sourceData} />
            </section>
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
}
