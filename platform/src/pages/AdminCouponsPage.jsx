import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteApi, fetchApi, patchApi, postApi, putApi } from "../api";
import { hasPermission, PERMISSIONS } from "../auth/permissions";
import { useAuth } from "../context/AuthContext";
import { PLATFORM_NAME } from "../config/brand";
import { CouponCommissionPanel } from "../components/coupons/CouponCommissionPanel.jsx";
import { CouponPoolPanel } from "../components/coupons/CouponPoolPanel.jsx";
import { Icon } from "../components/ui/Icon";

const STANDARD_FIELDS = [
  { key: "brandName", label: "Brand Name", type: "text" },
  { key: "campaignName", label: "Campaign Name", type: "text" },
  { key: "categoryName", label: "Category Name", type: "text" },
  {
    key: "codeType",
    label: "Coupon Type",
    type: "select",
    options: [
      { value: "code", label: "Code" },
      { value: "link", label: "Link" },
      { value: "both", label: "Both" },
    ],
  },
  { key: "couponCode", label: "Code", type: "text", showFor: ["code", "both"] },
  { key: "discountPercentage", label: "Discount Percentage", type: "number", showFor: ["code", "both"] },
  { key: "couponLink", label: "Link", type: "url", showFor: ["link", "both"] },
  { key: "startDate", label: "Start Date", type: "date" },
  { key: "expiryDate", label: "Expiry Date", type: "date" },
  { key: "couponStatus", label: "Coupon Status", type: "text" },
  {
    key: "campaignStatus",
    label: "Campaign Status",
    type: "select",
    options: [
      { value: "Active", label: "Active" },
      { value: "Paused", label: "Paused" },
    ],
  },
  { key: "networkSource", label: "Network Source", type: "text" },
];

const CAMPAIGN_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Paused", label: "Paused" },
];

function campaignStatusBadge(status) {
  const normalized = String(status || "Active").trim().toLowerCase();
  if (normalized === "paused") {
    return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">Paused</span>;
  }
  return <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">Active</span>;
}

const COUPON_TYPE_OPTIONS = [
  { value: "code", label: "Code" },
  { value: "link", label: "Link" },
  { value: "both", label: "Both" },
];

function normalizeCouponType(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");
  if (!normalized) return "code";
  if (normalized === "both" || normalized.includes("both")) return "both";
  if (/\blink\b/.test(normalized) && /\b(code|coupon)\b/.test(normalized)) return "both";
  if (normalized === "link" || (/\blink\b/.test(normalized) && !/\bcode\b/.test(normalized))) return "link";
  return "code";
}

const CUSTOM_FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Long text" },
  { value: "link", label: "Link / URL" },
  { value: "date", label: "Date" },
  { value: "number", label: "Number" },
  { value: "image", label: "Image URL" },
];

const SOURCE_TYPES = [
  { value: "builtin", label: "Built-in" },
  { value: "normalized", label: "Normalized path" },
  { value: "raw", label: "Raw path" },
  { value: "custom", label: "Custom field" },
];

function inputTypeForField(type) {
  if (type === "link" || type === "image") return "url";
  if (type === "date") return "date";
  if (type === "number") return "number";
  return "text";
}

function placeholderForField(type) {
  if (type === "link") return "https://…";
  if (type === "image") return "https://…/image.png";
  if (type === "number") return "0";
  return "Value";
}

function emptyCouponForm() {
  return {
    fields: {
      ...Object.fromEntries(STANDARD_FIELDS.map((field) => [field.key, ""])),
      codeType: "code",
      campaignStatus: "Active",
      networkSource: "manual",
    },
    fieldPolicies: {},
    customFields: [],
    resolveConflict: {},
  };
}

function CouponEditorModal({ coupon, columns, onClose, onSaved }) {
  const isNew = !coupon;
  const [form, setForm] = useState(emptyCouponForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [section, setSection] = useState("details");
  const { user } = useAuth();
  const canViewCommission = hasPermission(user, PERMISSIONS.COMMISSION_READ);
  const canWriteCoupons = hasPermission(user, PERMISSIONS.COUPONS_WRITE);

  useEffect(() => {
    if (!coupon) {
      setForm(emptyCouponForm());
      return;
    }

    const displayFields = coupon.cmsMeta?.displayFields || {};
    const manualData = coupon.cmsMeta?.manualData || {};
    const fieldPolicies = coupon.cmsMeta?.fieldPolicies || {};
    const fieldTypes = coupon.cmsMeta?.fieldTypes || {};
    const standardKeys = new Set(STANDARD_FIELDS.map((field) => field.key));
    const customFields = Object.entries(displayFields)
      .filter(([key]) => !standardKeys.has(key) && key !== "couponTerms")
      .map(([key, value]) => ({
        key,
        value: value ?? "",
        type: fieldTypes[key] || "text",
      }));

    const codeType = normalizeCouponType(displayFields.codeType);
    setForm({
      fields: {
        ...Object.fromEntries(STANDARD_FIELDS.map((field) => [field.key, displayFields[field.key] ?? ""])),
        codeType,
        campaignStatus: displayFields.campaignStatus || "Active",
        discountPercentage:
          displayFields.discountPercentage ?? displayFields.couponTerms ?? "",
        couponLink: displayFields.couponLink ?? (codeType === "link" ? displayFields.couponCode ?? "" : ""),
        couponCode: codeType === "link" ? "" : displayFields.couponCode ?? "",
        ...Object.fromEntries(customFields.map((field) => [field.key, field.value])),
      },
      fieldPolicies,
      customFields,
      resolveConflict: {},
    });
  }, [coupon]);

  const conflicts = useMemo(() => {
    if (!coupon?.cmsMeta?.hasSyncConflict) return [];
    const synced = coupon.cmsMeta.syncedFields || {};
    const manual = coupon.cmsMeta.manualData || {};
    const policies = coupon.cmsMeta.fieldPolicies || {};

    return Object.keys({ ...synced, ...manual })
      .filter((key) => (policies[key] || "manual") === "manual")
      .filter((key) => {
        const a = manual[key] ?? "";
        const b = synced[key] ?? "";
        return String(a) !== String(b);
      })
      .map((key) => ({
        key,
        manual: manual[key] ?? "",
        synced: synced[key] ?? "",
      }));
  }, [coupon]);

  function updateField(key, value) {
    setForm((prev) => {
      const nextFields = { ...prev.fields, [key]: value };
      if (key === "codeType") {
        const type = normalizeCouponType(value);
        nextFields.codeType = type;
        if (type === "code") nextFields.couponLink = "";
        if (type === "link") {
          nextFields.couponCode = "";
          nextFields.discountPercentage = "";
        }
      }
      return {
        ...prev,
        fields: nextFields,
        fieldPolicies: { ...prev.fieldPolicies, [key]: "manual" },
      };
    });
  }

  function updatePolicy(key, policy) {
    setForm((prev) => ({
      ...prev,
      fieldPolicies: { ...prev.fieldPolicies, [key]: policy },
    }));
  }

  function addCustomField() {
    setForm((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { key: "", value: "", type: "text" }],
    }));
  }

  function updateCustomField(index, patch) {
    setForm((prev) => {
      const next = [...prev.customFields];
      next[index] = { ...next[index], ...patch };
      return { ...prev, customFields: next };
    });
  }

  function removeCustomField(index) {
    setForm((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const codeType = normalizeCouponType(form.fields.codeType);
      const fields = { ...form.fields, codeType };
      delete fields.couponTerms;

      if (codeType === "code") {
        fields.couponLink = "";
      } else if (codeType === "link") {
        fields.couponCode = "";
        fields.discountPercentage = "";
      }

      const fieldTypes = {};
      for (const custom of form.customFields) {
        const key = String(custom.key || "").trim();
        if (!key) continue;
        fields[key] = custom.value;
        fieldTypes[key] = custom.type || "text";
      }

      const payload = {
        fields,
        fieldPolicies: form.fieldPolicies,
        fieldTypes,
        resolveConflict: form.resolveConflict,
      };

      if (isNew) {
        await postApi("/admin/coupons", payload);
      } else {
        await patchApi(`/admin/coupons/${coupon.id}`, payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  }

  const couponType = normalizeCouponType(form.fields.codeType);
  const allFieldDefs = [
    ...STANDARD_FIELDS.filter((field) => !field.showFor || field.showFor.includes(couponType)),
    ...form.customFields.map((field, index) => ({
      key: field.key || `custom_${index}`,
      label: field.key || `Custom field ${index + 1}`,
      type: field.type || "text",
      customIndex: index,
      isCustom: true,
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{isNew ? "Create coupon" : "Edit coupon"}</h2>
            <p className="mt-1 text-sm text-slate-600">
              Campaign details, offer fields, and commission rules for allotted clients.
            </p>
          </div>
          <button className="rounded-lg border border-slate-300 px-3 py-1 text-sm" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-sm ${section === "details" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
            onClick={() => setSection("details")}
          >
            Campaign Details
          </button>
          {!isNew && canViewCommission ? (
            <button
              type="button"
              className={`rounded-lg px-3 py-1.5 text-sm ${section === "commission" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
              onClick={() => setSection("commission")}
            >
              Commission Rules
            </button>
          ) : null}
        </div>

        {section === "commission" && !isNew ? (
          <CouponCommissionPanel couponId={coupon.id} />
        ) : (
          <>
        {conflicts.length > 0 && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-medium text-amber-900">Sync conflict detected</p>
            <p className="mt-1 text-sm text-amber-800">
              The network has newer values for some fields you edited. Choose which value to keep.
            </p>
            <div className="mt-3 space-y-3">
              {conflicts.map((conflict) => (
                <div key={conflict.key} className="rounded-lg border border-amber-200 bg-white p-3 text-sm">
                  <p className="font-medium text-slate-800">{conflict.key}</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <label className="flex items-start gap-2">
                      <input
                        checked={(form.resolveConflict[conflict.key] || "manual") === "manual"}
                        name={`resolve-${conflict.key}`}
                        type="radio"
                        onChange={() =>
                          setForm((prev) => ({
                            ...prev,
                            resolveConflict: { ...prev.resolveConflict, [conflict.key]: "manual" },
                          }))
                        }
                      />
                      <span>
                        <span className="block text-xs uppercase text-slate-500">Your edit</span>
                        {String(conflict.manual || "-")}
                      </span>
                    </label>
                    <label className="flex items-start gap-2">
                      <input
                        checked={form.resolveConflict[conflict.key] === "sync"}
                        name={`resolve-${conflict.key}`}
                        type="radio"
                        onChange={() =>
                          setForm((prev) => ({
                            ...prev,
                            resolveConflict: { ...prev.resolveConflict, [conflict.key]: "sync" },
                          }))
                        }
                      />
                      <span>
                        <span className="block text-xs uppercase text-slate-500">Network sync</span>
                        {String(conflict.synced || "-")}
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {allFieldDefs.map((field) => {
            if (field.isCustom) {
              const custom = form.customFields[field.customIndex] || {};
              const fieldType = custom.type || "text";
              return (
                <div
                  key={`custom-${field.customIndex}`}
                  className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_auto_1fr_auto]"
                >
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Field key"
                    value={custom.key || ""}
                    onChange={(e) => updateCustomField(field.customIndex, { key: e.target.value })}
                  />
                  <select
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={fieldType}
                    onChange={(e) => updateCustomField(field.customIndex, { type: e.target.value })}
                  >
                    {CUSTOM_FIELD_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {fieldType === "textarea" ? (
                    <textarea
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder={placeholderForField(fieldType)}
                      rows={2}
                      value={custom.value || ""}
                      onChange={(e) => updateCustomField(field.customIndex, { value: e.target.value })}
                    />
                  ) : (
                    <input
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder={placeholderForField(fieldType)}
                      type={inputTypeForField(fieldType)}
                      value={custom.value || ""}
                      onChange={(e) => updateCustomField(field.customIndex, { value: e.target.value })}
                    />
                  )}
                  <button
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700"
                    onClick={() => removeCustomField(field.customIndex)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              );
            }

            const policy = form.fieldPolicies[field.key] || (coupon?.cmsMeta?.manualData?.[field.key] ? "manual" : "sync");

            return (
              <div key={field.key} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label className="text-sm font-medium text-slate-800">{field.label}</label>
                  {!isNew && (
                    <select
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                      value={policy}
                      onChange={(e) => updatePolicy(field.key, e.target.value)}
                    >
                      <option value="manual">Keep my edit on sync</option>
                      <option value="sync">Use network sync</option>
                    </select>
                  )}
                </div>
                {field.type === "select" || field.key === "codeType" ? (
                  <select
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={
                      field.key === "codeType"
                        ? normalizeCouponType(form.fields[field.key])
                        : form.fields[field.key] || field.options?.[0]?.value || ""
                    }
                    onChange={(e) => updateField(field.key, e.target.value)}
                  >
                    {(field.options || COUPON_TYPE_OPTIONS).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    rows={3}
                    value={form.fields[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  />
                ) : (
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    type={field.type === "url" ? "url" : field.type}
                    placeholder={
                      field.key === "discountPercentage"
                        ? "e.g. 10"
                        : field.key === "couponLink"
                          ? "https://…"
                          : undefined
                    }
                    value={form.fields[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={addCustomField} type="button">
            Add custom field
          </button>
        </div>

        {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm" onClick={onClose} type="button">
            Cancel
          </button>
          {canWriteCoupons ? (
            <button
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={saving}
              onClick={handleSave}
              type="button"
            >
              {saving ? "Saving..." : isNew ? "Create coupon" : "Save changes"}
            </button>
          ) : null}
        </div>
          </>
        )}
      </div>
    </div>
  );
}

function ColumnEditor({ columns, onRefresh }) {
  const [draft, setDraft] = useState([]);
  const [newColumn, setNewColumn] = useState({
    key: "",
    label: "",
    sourceType: "custom",
    dataPath: "",
    columnType: "text",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(columns);
  }, [columns]);

  function moveColumn(index, direction) {
    setDraft((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((column, sortOrder) => ({ ...column, sortOrder }));
    });
  }

  async function saveOrder() {
    setSaving(true);
    setError("");
    try {
      await putApi("/admin/coupons/columns", {
        columns: draft.map((column, index) => ({ ...column, sortOrder: index })),
      });
      onRefresh();
    } catch (err) {
      setError(err.message || "Failed to save columns");
    } finally {
      setSaving(false);
    }
  }

  async function addColumn() {
    setSaving(true);
    setError("");
    try {
      await postApi("/admin/coupons/columns", newColumn);
      setNewColumn({ key: "", label: "", sourceType: "custom", dataPath: "", columnType: "text" });
      onRefresh();
    } catch (err) {
      setError(err.message || "Failed to add column");
    } finally {
      setSaving(false);
    }
  }

  async function removeColumn(key) {
    setSaving(true);
    setError("");
    try {
      await deleteApi(`/admin/coupons/columns/${key}`);
      onRefresh();
    } catch (err) {
      setError(err.message || "Failed to delete column");
    } finally {
      setSaving(false);
    }
  }

  async function resetDefaults() {
    setSaving(true);
    setError("");
    try {
      await postApi("/admin/coupons/columns/reset", {});
      onRefresh();
    } catch (err) {
      setError(err.message || "Failed to reset columns");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" disabled={saving} onClick={saveOrder} type="button">
          Save column layout
        </button>
        <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm" disabled={saving} onClick={resetDefaults} type="button">
          Reset to defaults
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Key</th>
              <th className="px-3 py-2">Label</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Visible</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {draft.map((column, index) => (
              <tr key={column.key} className="border-t border-slate-200">
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="rounded border px-2 py-1 text-xs" onClick={() => moveColumn(index, -1)} type="button" aria-label="Move up">
                      <Icon name="keyboard_arrow_up" size={16} />
                    </button>
                    <button className="rounded border px-2 py-1 text-xs" onClick={() => moveColumn(index, 1)} type="button" aria-label="Move down">
                      <Icon name="keyboard_arrow_down" size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{column.key}</td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1"
                    value={column.label}
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev.map((item) => (item.key === column.key ? { ...item, label: e.target.value } : item)),
                      )
                    }
                  />
                </td>
                <td className="px-3 py-2 text-xs text-slate-600">{column.sourceType}</td>
                <td className="px-3 py-2">
                  <input
                    checked={column.visible !== false}
                    type="checkbox"
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev.map((item) => (item.key === column.key ? { ...item, visible: e.target.checked } : item)),
                      )
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  {column.sourceType !== "builtin" && (
                    <button className="text-xs text-red-700" onClick={() => removeColumn(column.key)} type="button">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="font-medium text-slate-900">Add new column</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Column key"
            value={newColumn.key}
            onChange={(e) => setNewColumn((prev) => ({ ...prev, key: e.target.value }))}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Column label"
            value={newColumn.label}
            onChange={(e) => setNewColumn((prev) => ({ ...prev, label: e.target.value }))}
          />
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={newColumn.sourceType}
            onChange={(e) => setNewColumn((prev) => ({ ...prev, sourceType: e.target.value }))}
          >
            {SOURCE_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Data path (for normalized/raw/custom)"
            value={newColumn.dataPath}
            onChange={(e) => setNewColumn((prev) => ({ ...prev, dataPath: e.target.value }))}
          />
        </div>
        <button className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm" disabled={saving} onClick={addColumn} type="button">
          Add column
        </button>
      </div>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}

export function AdminCouponsPage() {
  const { user } = useAuth();
  const canWriteCoupons = hasPermission(user, PERMISSIONS.COUPONS_WRITE);
  const canManageColumns = hasPermission(user, PERMISSIONS.COUPON_COLUMNS_MANAGE);
  const canViewCommission = hasPermission(user, PERMISSIONS.COMMISSION_READ);
  const [tab, setTab] = useState("pool");
  const [coupons, setCoupons] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editorCoupon, setEditorCoupon] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ campaignStatus: "", search: "" });

  async function loadCoupons() {
    const params = { page, pageSize: 25 };
    if (filters.campaignStatus) params.campaignStatus = filters.campaignStatus;
    if (filters.search.trim()) params.search = filters.search.trim();
    const response = await fetchApi("/admin/coupons", params);
    setCoupons(response.rows || []);
    setTotalPages(response.totalPages || 1);
  }

  async function loadColumns() {
    const response = await fetchApi("/admin/coupons/columns", { include_hidden: true });
    setColumns(response.columns || []);
  }

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadCoupons(), loadColumns()]);
    } catch (err) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [page, filters.campaignStatus]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await deleteApi(`/admin/coupons/${id}`);
      await loadCoupons();
    } catch (err) {
      setError(err.message || "Failed to delete coupon");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <section className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">{PLATFORM_NAME}</p>
            <h1 className="text-3xl font-semibold text-slate-900">Coupons</h1>
            <p className="mt-1 text-sm text-slate-600">
              Canonical coupon inventory and management (CouponCodeMaster pool + CMS) for {PLATFORM_NAME}.
            </p>
          </div>
          <div className="flex gap-2">
            <Link className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" to="/">
              Dashboard
            </Link>
            {canWriteCoupons && tab === "coupons" && (
              <button
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                onClick={() => setShowCreate(true)}
                type="button"
              >
                New coupon
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className={`rounded-lg px-3 py-2 text-sm ${tab === "pool" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white"}`}
            onClick={() => setTab("pool")}
            type="button"
          >
            Coupon pool
          </button>
          <button
            className={`rounded-lg px-3 py-2 text-sm ${tab === "coupons" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white"}`}
            onClick={() => setTab("coupons")}
            type="button"
          >
            Coupons CMS
          </button>
          {canManageColumns && (
            <button
              className={`rounded-lg px-3 py-2 text-sm ${tab === "columns" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white"}`}
              onClick={() => setTab("columns")}
              type="button"
            >
              Columns
            </button>
          )}
        </div>

        {tab === "pool" ? <CouponPoolPanel /> : null}

        {tab !== "pool" && error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>
        ) : null}

        {tab !== "pool" && loading ? (
          <p className="text-sm text-slate-600">Loading...</p>
        ) : tab === "columns" ? (
          <ColumnEditor columns={columns} onRefresh={loadColumns} />
        ) : tab === "coupons" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <label className="grid gap-1 text-sm">
                <span className="text-slate-600">Campaign Status</span>
                <select
                  className="min-w-[160px] rounded-lg border border-slate-300 px-3 py-2"
                  value={filters.campaignStatus}
                  onChange={(e) => {
                    setPage(1);
                    setFilters((prev) => ({ ...prev, campaignStatus: e.target.value }));
                  }}
                >
                  {CAMPAIGN_STATUS_OPTIONS.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid min-w-[220px] flex-1 gap-1 text-sm">
                <span className="text-slate-600">Search</span>
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={filters.search}
                  placeholder="Campaign or brand…"
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setPage(1);
                      loadCoupons();
                    }
                  }}
                />
              </label>
              <button
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                type="button"
                onClick={() => {
                  setPage(1);
                  loadCoupons();
                }}
              >
                Apply
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2">Campaign</th>
                    <th className="px-3 py-2">Code / Link</th>
                    <th className="px-3 py-2">Campaign Status</th>
                    <th className="px-3 py-2">Network</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Conflict</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-t border-slate-200">
                      <td className="px-3 py-2">{coupon.campaignName || coupon.cmsMeta?.displayFields?.campaignName || "-"}</td>
                      <td className="px-3 py-2">{coupon.code || coupon.cmsMeta?.displayFields?.couponCode || "-"}</td>
                      <td className="px-3 py-2">
                        {campaignStatusBadge(coupon.cmsMeta?.displayFields?.campaignStatus)}
                      </td>
                      <td className="px-3 py-2">{coupon.networkSource}</td>
                      <td className="px-3 py-2">{coupon.isManual ? "Manual" : "Synced"}</td>
                      <td className="px-3 py-2">
                        {coupon.cmsMeta?.hasSyncConflict ? (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">Conflict</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {canWriteCoupons || canViewCommission ? (
                          <div className="flex gap-2">
                            <button className="text-blue-600" onClick={() => setEditorCoupon(coupon)} type="button">
                              {canWriteCoupons ? "Edit" : "View"}
                            </button>
                            {canWriteCoupons ? (
                              <button className="text-red-700" onClick={() => handleDelete(coupon.id)} type="button">
                                Delete
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-slate-400">Read only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-between border-t border-slate-200 p-3">
                <button
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  type="button"
                >
                  Prev
                </button>
                <span className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {(canWriteCoupons || canViewCommission) && (showCreate || editorCoupon) && (
        <CouponEditorModal
          columns={columns}
          coupon={editorCoupon}
          onClose={() => {
            setShowCreate(false);
            setEditorCoupon(null);
          }}
          onSaved={loadCoupons}
        />
      )}
    </main>
  );
}
