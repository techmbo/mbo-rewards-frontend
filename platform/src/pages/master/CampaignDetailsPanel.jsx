import { useEffect, useMemo, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Drawer } from "../../components/ui/Drawer";
import { Input } from "../../components/ui/FormControls";
import { BrandIdentity } from "../../components/brand/BrandIdentity";
import { htmlToPlainText } from "../../utils/display";
import {
  completenessOf,
  completenessBadgeItems,
  displayFacing,
  fieldHasValue,
  mergeFacing,
  resolveClientFacingDetailFields,
  sourceTagForField,
} from "./masterCampaignHelpers";

const TABS = [
  { id: "information", label: "Campaign Information" },
  { id: "source", label: "Network Source" },
  { id: "audit", label: "Audit" },
];

const TAG_CLASS = {
  purple: "bg-violet-100 text-violet-800",
  info: "bg-sky-100 text-sky-800",
  gold: "bg-amber-100 text-amber-900",
  warning: "bg-orange-100 text-orange-800",
};

const FIELD_DEFS = [
  { key: "brandName", label: "Brand Name" },
  { key: "brandLogoUrl", label: "Brand Logo" },
  { key: "campaignName", label: "Campaign Name" },
  { key: "campaignType", label: "Campaign Type" },
  { key: "customerOffer", label: "Customer Offer" },
  { key: "offerDescription", label: "Offer Description", multiline: true },
  { key: "termsAndConditions", label: "Terms & Conditions", multiline: true },
  { key: "expiry", label: "Expiry" },
  { key: "countries", label: "Valid Countries" },
  { key: "clientCommissionPercent", label: "Client Commission", suffix: "%" },
];

const DERIVED_FIELD_DEFS = [
  { key: "slug", label: "Slug", readOnly: true },
  { key: "currency", label: "Currency" },
];

function CompletenessBadges({ completeness, campaign }) {
  const items = completenessBadgeItems(campaign || {});
  const missingKeys = new Set(completeness.missing.map((f) => f.key));
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const missing = missingKeys.has(item.key);
        return (
          <Badge key={item.key} variant={missing ? "warning" : "success"}>
            {missing ? item.missLabel : item.okLabel}
          </Badge>
        );
      })}
    </div>
  );
}

export function CampaignDetailsPanel({
  open,
  campaign,
  clientFacing,
  sources = [],
  selectedSourceId,
  client,
  resetKey,
  onClose,
  onSave,
  canEdit = true,
}) {
  const [tab, setTab] = useState("information");
  const [editingKey, setEditingKey] = useState(null);
  const [draftFacing, setDraftFacing] = useState(clientFacing || {});

  useEffect(() => {
    if (!open) return;
    setDraftFacing(clientFacing && typeof clientFacing === "object" ? clientFacing : {});
    setEditingKey(null);
    setTab("information");
  }, [open, campaign?.id, resetKey]);

  const facing = useMemo(
    () => mergeFacing(campaign || {}, draftFacing),
    [campaign, draftFacing],
  );
  const completeness = completenessOf(campaign || {}, draftFacing);
  const informationFields = useMemo(() => {
    const couponLinkFields = resolveClientFacingDetailFields(campaign || {});
    const offerIdx = FIELD_DEFS.findIndex((field) => field.key === "offerDescription");
    return [
      ...FIELD_DEFS.slice(0, offerIdx + 1),
      ...couponLinkFields,
      ...FIELD_DEFS.slice(offerIdx + 1),
    ];
  }, [campaign]);

  function startEdit(key) {
    const current = draftFacing[key] ?? facing.merged[key];
    if (typeof current === "string") {
      const plain = htmlToPlainText(current);
      if (plain !== current) patchFacing(key, plain);
    }
    setEditingKey(key);
    setTab("information");
  }

  function patchFacing(key, value) {
    setDraftFacing((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "countries") {
        delete next.currency;
      }
      return next;
    });
  }

  function save() {
    onSave?.({
      ...draftFacing,
      slug: facing.merged.slug,
      currency: facing.merged.currency,
    });
    setEditingKey(null);
  }

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <Button variant="secondary" onClick={onClose}>
        Close
      </Button>
      {canEdit ? (
        <Button variant="primary" onClick={save}>
          Save client-facing fields
        </Button>
      ) : null}
    </div>
  );

  return (
    <Drawer
      open={open}
      title={campaign?.campaignName || campaign?.displayName || "Campaign details"}
      onClose={onClose}
      width="max-w-3xl"
      footer={footer}
    >
      <div className="mb-4 flex items-center gap-3">
        <BrandIdentity
          name={facing.merged.brandName}
          logoUrl={facing.merged.brandLogoUrl}
          size="md"
        />
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{facing.merged.campaignName || "—"}</p>
          <p className="text-xs text-slate-500">{facing.merged.campaignType || "Campaign"}</p>
        </div>
      </div>

      <CompletenessBadges completeness={completeness} campaign={campaign} />

      <div className="mt-4 flex gap-1 border-b border-slate-200">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`px-3 py-2 text-sm font-medium ${
              tab === item.id
                ? "border-b-2 border-brand-600 text-brand-800"
                : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "information" ? (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-900">Client-Facing Campaign Information</h3>
          <p className="mb-3 mt-1 text-xs text-slate-500">
            Customer Offer stays short. Put eligibility, exclusions and restrictions in Terms & Conditions.
          </p>
          <DerivedFieldsPanel
            fields={DERIVED_FIELD_DEFS}
            facing={facing}
            draftFacing={draftFacing}
            canEdit={canEdit}
            editingKey={editingKey}
            onStartEdit={startEdit}
            onDoneEdit={() => setEditingKey(null)}
            onPatch={patchFacing}
          />
          <table className="mt-4 min-w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="py-2 pr-3">Field</th>
                <th className="py-2 pr-3">Value</th>
                <th className="py-2 pr-3">Source</th>
                <th className="py-2">Edit</th>
              </tr>
            </thead>
            <tbody>
              {informationFields.map((field) => {
                const tag = sourceTagForField(field.key, facing);
                const raw =
                  field.key === "couponOrLink"
                    ? facing.merged.trackingUrl || facing.merged.couponCode
                    : facing.merged[field.key];
                const missing = !fieldHasValue(raw);
                const editing = editingKey === field.key;
                const currencyEditable = field.key === "currency" && facing.currencyMeta?.editable;
                const fieldReadOnly =
                  field.readOnly ||
                  field.key === "trackingUrl" ||
                  field.key === "couponOrLink" ||
                  (field.key === "currency" && !currencyEditable);
                return (
                  <tr
                    key={field.key}
                    className={`border-t border-slate-100 ${missing ? "bg-amber-50/70" : ""}`}
                  >
                    <td className="py-2.5 pr-3 font-medium text-slate-700">{field.label}</td>
                    <td className="py-2.5 pr-3">
                      {editing ? (
                        field.multiline ? (
                          <textarea
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            rows={4}
                            value={
                              Array.isArray(draftFacing[field.key])
                                ? draftFacing[field.key].join(", ")
                                : htmlToPlainText(
                                    draftFacing[field.key] ?? facing.merged[field.key] ?? "",
                                  )
                            }
                            onChange={(e) => patchFacing(field.key, e.target.value)}
                          />
                        ) : field.key === "currency" && currencyEditable ? (
                          <select
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            value={draftFacing.currency ?? facing.merged.currency ?? ""}
                            onChange={(e) => patchFacing("currency", e.target.value)}
                          >
                            <option value="">Select currency…</option>
                            {(facing.currencyMeta?.options || []).map((code) => (
                              <option key={code} value={code}>
                                {code}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            placeholder={
                              field.key === "brandLogoUrl"
                                ? "https://…"
                                : field.key === "expiry"
                                  ? "YYYY-MM-DD"
                                  : undefined
                            }
                            value={
                              field.key === "countries"
                                ? formatCountriesInput(draftFacing.countries ?? facing.merged.countries)
                                : field.key === "clientCommissionPercent"
                                  ? draftFacing.clientCommissionPercent ?? facing.merged.clientCommissionPercent ?? ""
                                  : htmlToPlainText(
                                      draftFacing[field.key] ?? facing.merged[field.key] ?? "",
                                    )
                            }
                            onChange={(e) => {
                              if (field.key === "countries") {
                                patchFacing(
                                  "countries",
                                  e.target.value
                                    .split(",")
                                    .map((part) => part.trim())
                                    .filter(Boolean),
                                );
                              } else if (field.key === "currency") {
                                patchFacing(field.key, e.target.value.toUpperCase());
                              } else if (field.key === "clientCommissionPercent") {
                                patchFacing(
                                  field.key,
                                  e.target.value === "" ? null : Number(e.target.value),
                                );
                              } else {
                                patchFacing(field.key, e.target.value);
                              }
                            }}
                          />
                        )
                      ) : (
                        <span
                          className={`${missing ? "font-medium text-rose-600" : "text-slate-800"} ${
                            field.multiline ? "block max-w-xl whitespace-pre-wrap" : ""
                          }`}
                        >
                          {field.key === "brandLogoUrl"
                            ? fieldHasValue(raw)
                              ? "MBO canonical logo"
                              : "Not Provided"
                            : field.key === "clientCommissionPercent"
                              ? fieldHasValue(raw)
                                ? `${raw}%`
                                : "Not Provided"
                              : field.key === "trackingUrl" && fieldHasValue(raw)
                                ? (
                                    <a
                                      href={String(raw)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="break-all font-mono text-[12px] text-indigo-600 hover:text-indigo-800"
                                    >
                                      {String(raw)}
                                    </a>
                                  )
                                : displayFacing(raw)}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          TAG_CLASS[tag.tone] || TAG_CLASS.info
                        }`}
                      >
                        {tag.label}
                      </span>
                    </td>
                    <td className="py-2.5">
                      {!canEdit || fieldReadOnly ? (
                        <span className="text-xs text-slate-400">{fieldReadOnly ? "Auto" : "—"}</span>
                      ) : editing ? (
                        <Button variant="secondary" size="sm" onClick={() => setEditingKey(null)}>
                          Done
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" onClick={() => startEdit(field.key)}>
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "source" ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-600">
            Selected source:{" "}
            <span className="font-medium text-slate-900">
              {sources.find((s) => s.id === selectedSourceId)?.networkSource ||
                campaign?.networkSource ||
                "—"}
            </span>
          </p>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {(sources.length ? sources : [{ id: campaign?.campaignSourceId, networkSource: campaign?.networkSource, isPrimary: true }]).map(
              (source) => (
                <li key={source.id || source.networkSource} className="px-3 py-2 text-sm">
                  <span className="font-medium">{source.networkSource || "Network"}</span>
                  {source.isPrimary ? (
                    <span className="ml-2 text-[11px] font-semibold text-brand-700">Recommended</span>
                  ) : null}
                  <span className="ml-2 text-xs text-slate-500">
                    {source.relationshipStatus || source.campaignStatus || ""}
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}

      {tab === "audit" ? (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-semibold uppercase text-slate-400">Client</dt>
            <dd className="text-sm">{client?.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase text-slate-400">Catalog ID</dt>
            <dd className="break-all text-sm">{campaign?.id || "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase text-slate-400">Network</dt>
            <dd className="text-sm">{campaign?.networkSource || "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase text-slate-400">Last synced</dt>
            <dd className="text-sm">{campaign?.lastSyncedAt || "—"}</dd>
          </div>
        </dl>
      ) : null}
    </Drawer>
  );
}

function formatCountriesInput(value) {
  if (Array.isArray(value)) return value.join(", ");
  return value || "";
}

function DerivedFieldsPanel({
  fields,
  facing,
  draftFacing,
  canEdit,
  editingKey,
  onStartEdit,
  onDoneEdit,
  onPatch,
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Auto-derived fields
      </p>
      <table className="min-w-full text-sm">
        <thead className="text-left text-[11px] uppercase tracking-wide text-slate-400">
          <tr>
            <th className="py-2 pr-3">Field</th>
            <th className="py-2 pr-3">Value</th>
            <th className="py-2 pr-3">Source</th>
            <th className="py-2">Edit</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <FieldRow
              key={field.key}
              field={field}
              facing={facing}
              draftFacing={draftFacing}
              canEdit={canEdit}
              editing={editingKey === field.key}
              onStartEdit={onStartEdit}
              onDoneEdit={onDoneEdit}
              onPatch={onPatch}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FieldRow({
  field,
  facing,
  draftFacing,
  canEdit,
  editing,
  onStartEdit,
  onDoneEdit,
  onPatch,
}) {
  const tag = sourceTagForField(field.key, facing);
  const raw = facing.merged[field.key];
  const missing = !fieldHasValue(raw);
  const currencyEditable = field.key === "currency" && facing.currencyMeta?.editable;
  const fieldReadOnly = field.readOnly || (field.key === "currency" && !currencyEditable);

  return (
    <tr className={`border-t border-slate-100 ${missing ? "bg-amber-50/70" : ""}`}>
      <td className="py-2.5 pr-3 font-medium text-slate-700">{field.label}</td>
      <td className="py-2.5 pr-3">
        {editing ? (
          field.key === "currency" && currencyEditable ? (
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={draftFacing.currency ?? facing.merged.currency ?? ""}
              onChange={(e) => onPatch("currency", e.target.value)}
            >
              <option value="">Select currency…</option>
              {(facing.currencyMeta?.options || []).map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          ) : (
            <Input
              value={htmlToPlainText(draftFacing[field.key] ?? facing.merged[field.key] ?? "")}
              onChange={(e) => onPatch(field.key, e.target.value)}
            />
          )
        ) : (
          <span className={`${missing ? "font-medium text-rose-600" : "text-slate-800"}`}>
            {displayFacing(raw)}
          </span>
        )}
      </td>
      <td className="py-2.5 pr-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            TAG_CLASS[tag.tone] || TAG_CLASS.info
          }`}
        >
          {tag.label}
        </span>
      </td>
      <td className="py-2.5">
        {!canEdit || fieldReadOnly ? (
          <span className="text-xs text-slate-400">{fieldReadOnly ? "Auto" : "—"}</span>
        ) : editing ? (
          <Button variant="secondary" size="sm" onClick={onDoneEdit}>
            Done
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => onStartEdit(field.key)}>
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
}
