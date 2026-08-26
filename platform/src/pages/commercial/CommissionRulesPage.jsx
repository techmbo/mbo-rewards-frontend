import { useMemo, useState } from "react";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { useMutation } from "../../hooks/useMutation";
import { useResourceOptions } from "../../hooks/useResourceOptions";
import { useAuth } from "../../context/AuthContext";
import { canViewCommission, hasPermission, PERMISSIONS } from "../../auth/permissions";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/FormControls";
import { Modal } from "../../components/ui/Modal";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { formatDateShort, StatusBadge } from "../helpers";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "EFFECTIVE", label: "Effective" },
  { value: "SUPERSEDED", label: "Superseded" },
];

const RULE_TYPE_OPTIONS = [
  { value: "PERCENT", label: "Percent (legacy alias)" },
  { value: "PERCENT_OF_ACTUAL_SUPPLIER_COMMISSION", label: "Percent of actual supplier commission" },
  { value: "FIXED_CLIENT_PERCENT_OF_ORDER_VALUE", label: "Fixed % of order value" },
  { value: "FIXED_CLIENT_AMOUNT_PER_CONFIRMED_ORDER", label: "Fixed amount per confirmed order" },
  { value: "MANUAL_APPROVED_CLIENT_COMMISSION", label: "Manual approved commission" },
  { value: "DISPLAY_RANGE_WITH_ACTUAL_SPLIT", label: "Display range (actual split payout)" },
  { value: "FIXED", label: "Fixed (legacy — needs fixedAmount)" },
  { value: "UNKNOWN", label: "Unknown" },
];

function formatCommissionTypeLabel(type) {
  if (String(type || "").toUpperCase() === "TIERED") return "TIERED — Not Implemented";
  const hit = RULE_TYPE_OPTIONS.find((o) => o.value === type);
  return hit?.label || type || "—";
}

const FILTER_DEFS = [{ key: "status", label: "Status", options: STATUS_OPTIONS }];

const EMPTY_FORM = {
  assignmentId: "",
  grossCommission: "",
  clientCommission: "",
  commissionType: "PERCENT_OF_ACTUAL_SUPPLIER_COMMISSION",
  currency: "USD",
  orderValuePercent: "",
  fixedAmount: "",
  manualAmount: "",
  manualApproved: false,
  displayRangeMin: "",
  displayRangeMax: "",
  displayLabel: "",
  effectiveFrom: new Date().toISOString().slice(0, 10),
  activate: true,
};

function deriveMbo(gross, client) {
  const g = Number(gross);
  const c = Number(client);
  if (Number.isNaN(g) || Number.isNaN(c)) return "—";
  return (g - c).toFixed(4);
}

function needsRatioFields(type) {
  return (
    type === "PERCENT" ||
    type === "PERCENT_OF_ACTUAL_SUPPLIER_COMMISSION" ||
    type === "DISPLAY_RANGE_WITH_ACTUAL_SPLIT" ||
    type === "UNKNOWN"
  );
}

export function CommissionRulesPage() {
  const { user } = useAuth();
  const showCommission = canViewCommission(user);
  const canManage = hasPermission(user, PERMISSIONS.COMMISSION_MANAGE);
  const [filters, setFilters] = useState({ status: "" });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { options: assignmentOptions } = useResourceOptions("/client-assignments", (row) => ({
    value: row.id,
    label: `${row.client?.name || row.clientId} → ${row.canonicalCampaign?.displayName || row.canonicalCampaignId}`,
  }));

  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    [filters],
  );
  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/commission-rules",
    queryFilters,
    { pageSize: 25 },
  );

  const createMutation = useMutation("POST", {
    successMessage: "Commission rule created.",
    onSuccess: () => {
      setOpen(false);
      setForm(EMPTY_FORM);
      reload();
    },
  });
  const updateMutation = useMutation("PATCH", {
    successMessage: "Commission rule updated.",
    onSuccess: () => reload(),
  });

  async function handleCreate(event) {
    event.preventDefault();
    const payload = {
      assignmentId: form.assignmentId,
      commissionType: form.commissionType,
      currency: form.currency || null,
      effectiveFrom: form.effectiveFrom,
      activate: form.activate,
    };
    if (needsRatioFields(form.commissionType) || form.commissionType === "FIXED") {
      if (form.grossCommission !== "") payload.grossCommission = form.grossCommission;
      if (form.clientCommission !== "") payload.clientCommission = form.clientCommission;
    }
    if (form.orderValuePercent !== "") payload.orderValuePercent = Number(form.orderValuePercent);
    if (form.fixedAmount !== "") payload.fixedAmount = form.fixedAmount;
    if (form.manualAmount !== "") payload.manualAmount = form.manualAmount;
    if (form.commissionType === "MANUAL_APPROVED_CLIENT_COMMISSION") {
      payload.manualApproved = form.manualApproved;
    }
    if (form.displayRangeMin !== "") payload.displayRangeMin = form.displayRangeMin;
    if (form.displayRangeMax !== "") payload.displayRangeMax = form.displayRangeMax;
    if (form.displayLabel) payload.displayLabel = form.displayLabel;
    await createMutation.mutate("/commission-rules", payload);
  }

  const columns = useMemo(() => {
    const cols = [
      { key: "assignmentId", label: "Assignment", render: (row) => row.assignmentId?.slice(0, 8) },
      { key: "commissionType", label: "Type", render: (row) => formatCommissionTypeLabel(row.commissionType) },
      { key: "currency", label: "Currency" },
      { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
      { key: "effectiveFrom", label: "From", render: (row) => formatDateShort(row.effectiveFrom) },
      { key: "effectiveUntil", label: "Until", render: (row) => formatDateShort(row.effectiveUntil) },
    ];
    if (showCommission) {
      cols.splice(
        2,
        0,
        { key: "grossCommission", label: "Gross / basis" },
        { key: "clientCommission", label: "Client share" },
        { key: "mboCommission", label: "MBO (ratio)" },
        {
          key: "engineFields",
          label: "Engine",
          render: (row) => {
            if (row.orderValuePercent != null) return `${row.orderValuePercent}% OV`;
            if (row.fixedAmount != null) return `Fixed ${row.fixedAmount}`;
            if (row.manualAmount != null) return `Manual ${row.manualAmount}${row.manualApproved ? " (approved)" : ""}`;
            if (row.displayRangeMin != null || row.displayRangeMax != null) {
              return `Display ${row.displayRangeMin ?? "—"}–${row.displayRangeMax ?? "—"}`;
            }
            return "—";
          },
        },
      );
    }
    if (canManage) {
      cols.push({
        key: "actions",
        label: "",
        render: (row) => (
          <ActionMenu
            items={[
              {
                label: "Activate",
                visible: row.status === "DRAFT" && String(row.commissionType || "").toUpperCase() !== "TIERED",
                onClick: () => updateMutation.mutate(`/commission-rules/${row.id}`, { activate: true }),
              },
              {
                label: "Supersede",
                danger: true,
                visible: row.status === "EFFECTIVE",
                onClick: () => updateMutation.mutate(`/commission-rules/${row.id}`, { supersede: true }),
              },
            ]}
          />
        ),
      });
    }
    return cols;
  }, [showCommission, canManage, updateMutation]);

  const type = form.commissionType;

  return (
    <PageLayout
      title="Commission Rules"
      subtitle="Configure how client commission is calculated from confirmed network commission. Tiered client bands are not available yet."
      actions={
        canManage ? (
          <Button variant="primary" onClick={() => setOpen(true)}>
            Create Rule
          </Button>
        ) : null
      }
    >
      {!showCommission && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Commission amounts are hidden for your role. Admin and Operations with commission:read can see Gross, Client, and MBO commission.
        </p>
      )}
      <FilterBar
        filters={FILTER_DEFS}
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onReset={() => setFilters({ status: "" })}
      />
      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        onRefresh={reload}
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={setPage}
        emptyTitle="No commission rules"
        emptyDescription="Create a commission rule on a published assignment."
      />

      <Modal
        open={open}
        title="Create Commission Rule"
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={createMutation.loading} onClick={handleCreate}>
              Create
            </Button>
          </div>
        }
      >
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleCreate}>
          <Select
            label="Assignment *"
            required
            className="sm:col-span-2"
            value={form.assignmentId}
            onChange={(e) => setForm((p) => ({ ...p, assignmentId: e.target.value }))}
            options={[{ value: "", label: "Select assignment" }, ...assignmentOptions]}
          />
          <Select
            label="Type *"
            className="sm:col-span-2"
            value={form.commissionType}
            onChange={(e) => setForm((p) => ({ ...p, commissionType: e.target.value }))}
            options={RULE_TYPE_OPTIONS}
          />
          {needsRatioFields(type) && (
            <>
              <Input
                label="Gross Commission *"
                required
                value={form.grossCommission}
                onChange={(e) => setForm((p) => ({ ...p, grossCommission: e.target.value }))}
                placeholder="100"
              />
              <Input
                label="Client Commission *"
                required
                value={form.clientCommission}
                onChange={(e) => setForm((p) => ({ ...p, clientCommission: e.target.value }))}
                placeholder="70"
              />
              <div className="sm:col-span-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                MBO Commission (derived): <strong>{deriveMbo(form.grossCommission, form.clientCommission)}</strong>
              </div>
            </>
          )}
          {type === "FIXED_CLIENT_PERCENT_OF_ORDER_VALUE" && (
            <Input
              label="Order value % *"
              required
              className="sm:col-span-2"
              value={form.orderValuePercent}
              onChange={(e) => setForm((p) => ({ ...p, orderValuePercent: e.target.value }))}
              placeholder="3.5"
            />
          )}
          {(type === "FIXED_CLIENT_AMOUNT_PER_CONFIRMED_ORDER" || type === "FIXED") && (
            <Input
              label="Fixed amount *"
              required={type === "FIXED_CLIENT_AMOUNT_PER_CONFIRMED_ORDER"}
              className="sm:col-span-2"
              value={form.fixedAmount}
              onChange={(e) => setForm((p) => ({ ...p, fixedAmount: e.target.value }))}
              placeholder="5.0000"
            />
          )}
          {type === "MANUAL_APPROVED_CLIENT_COMMISSION" && (
            <>
              <Input
                label="Manual amount *"
                required
                value={form.manualAmount}
                onChange={(e) => setForm((p) => ({ ...p, manualAmount: e.target.value }))}
                placeholder="12.5000"
              />
              <label className="flex items-center gap-2 self-end text-sm">
                <input
                  type="checkbox"
                  checked={form.manualApproved}
                  onChange={(e) => setForm((p) => ({ ...p, manualApproved: e.target.checked }))}
                />
                Approved (required for payable)
              </label>
            </>
          )}
          {type === "DISPLAY_RANGE_WITH_ACTUAL_SPLIT" && (
            <>
              <Input
                label="Display range min"
                value={form.displayRangeMin}
                onChange={(e) => setForm((p) => ({ ...p, displayRangeMin: e.target.value }))}
              />
              <Input
                label="Display range max"
                value={form.displayRangeMax}
                onChange={(e) => setForm((p) => ({ ...p, displayRangeMax: e.target.value }))}
              />
              <Input
                label="Display label"
                className="sm:col-span-2"
                value={form.displayLabel}
                onChange={(e) => setForm((p) => ({ ...p, displayLabel: e.target.value }))}
              />
            </>
          )}
          <Input
            label="Currency"
            maxLength={3}
            value={form.currency}
            onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
          />
          <Input
            label="Effective From *"
            required
            type="date"
            value={form.effectiveFrom}
            onChange={(e) => setForm((p) => ({ ...p, effectiveFrom: e.target.value }))}
          />
          <label className="flex items-center gap-2 self-end text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.activate}
              onChange={(e) => setForm((p) => ({ ...p, activate: e.target.checked }))}
            />
            Activate immediately (EFFECTIVE)
          </label>
        </form>
      </Modal>
    </PageLayout>
  );
}
