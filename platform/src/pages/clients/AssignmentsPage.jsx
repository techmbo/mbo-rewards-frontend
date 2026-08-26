import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { patchApi, postApi } from "../../api";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { useMutation } from "../../hooks/useMutation";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { Button } from "../../components/ui/Button";
import { StatusPill } from "../../components/ui/StatusPill";
import { Drawer } from "../../components/ui/Drawer";
import { DateCell, Truncate } from "../../components/ui/TableCells";
import { BrandIdentity, brandFromRow } from "../../components/brand/BrandIdentity";
import {
  buildAssignmentListQuery,
  channelLabel,
  commercialModelLabel,
  commissionLedgerDisplay,
  couponPresentation,
  emptyAssignmentsMessage,
  ledgerLifecycle,
  ledgerPrimaryAction,
  pageScopedLifecycleCounts,
  trackingPresentation,
} from "./assignmentLedgerHelpers";
import { assignmentPublishReadiness, publishAssignmentRow } from "./assignmentPublishActions";
import { NETWORK_FILTER_DEF, readStoredClientNetwork, writeStoredClientNetwork } from "./NetworkFilter";

const EMPTY_FILTERS = {
  search: "",
  clientId: "",
  network: "",
  commercialModel: "",
  channel: "",
  status: "",
  lifecycle: "",
  trackingStatus: "",
  couponStatus: "",
  published: "",
};

const FILTER_DEFS = [
  { key: "search", type: "search", label: "Search", placeholder: "Client, brand, campaign" },
  NETWORK_FILTER_DEF,
  {
    key: "commercialModel",
    label: "Commercial",
    allLabel: "Commercial model",
    options: [
      { value: "CPS", label: "CPS" },
      { value: "CPA", label: "CPA" },
      { value: "CPL", label: "CPL" },
      { value: "CPI", label: "CPI" },
    ],
  },
  {
    key: "channel",
    label: "Channel",
    allLabel: "Channel",
    options: [
      { value: "LINK", label: "Link" },
      { value: "COUPON", label: "Coupon" },
      { value: "DEEPLINK", label: "Deeplink" },
      { value: "COUPON_LINK", label: "Link + Coupon" },
    ],
  },
  {
    key: "lifecycle",
    label: "Assignment status",
    allLabel: "Assignment status",
    options: [
      { value: "ASSIGNED", label: "Assigned" },
      { value: "COMMISSION_READY", label: "Commission ready" },
      { value: "TRACKING_READY", label: "Tracking ready" },
      { value: "PROVISIONED", label: "Provisioned" },
      { value: "CLIENT_VISIBLE", label: "Client visible" },
      { value: "PAUSED", label: "Paused" },
      { value: "REVOKED", label: "Revoked" },
    ],
  },
  {
    key: "trackingStatus",
    label: "Tracking",
    allLabel: "Tracking",
    options: [
      { value: "READY", label: "Ready" },
      { value: "PENDING", label: "Pending" },
      { value: "MISSING", label: "Missing" },
      { value: "REVOKED", label: "Revoked" },
    ],
  },
  {
    key: "couponStatus",
    label: "Coupon",
    allLabel: "Coupon",
    options: [
      { value: "ASSIGNED", label: "Assigned" },
      { value: "NOT_AVAILABLE", label: "Not available" },
      { value: "PENDING", label: "Pending" },
    ],
  },
  {
    key: "published",
    label: "Published",
    allLabel: "Published",
    options: [
      { value: "true", label: "Published" },
      { value: "false", label: "Not published" },
    ],
  },
  {
    key: "status",
    label: "DB status",
    allLabel: "DB status",
    options: [
      { value: "ASSIGNED", label: "ASSIGNED" },
      { value: "ACTIVE", label: "ACTIVE" },
      { value: "PAUSED", label: "Paused" },
      { value: "REVOKED", label: "Revoked" },
    ],
  },
];

function Field({ label, children }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <div className="mt-1 text-sm text-slate-800">{children}</div>
    </div>
  );
}

/**
 * Cross-client assignment ledger — operational monitoring (not Catalog allotment).
 */
export function AssignmentsPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.CLIENTS_MANAGE);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    clientId: searchParams.get("clientId") || "",
    network: readStoredClientNetwork(),
  }));
  const [detail, setDetail] = useState(null);
  const [opsOpen, setOpsOpen] = useState(false);
  const [publishingId, setPublishingId] = useState(null);
  const [publishError, setPublishError] = useState("");

  useEffect(() => {
    const clientId = searchParams.get("clientId") || "";
    if (!clientId) return;
    setFilters((prev) => (prev.clientId === clientId ? prev : { ...prev, clientId }));
  }, [searchParams]);

  const queryFilters = useMemo(() => buildAssignmentListQuery(filters), [filters]);
  const { rows, loading, error, reload, page, setPage, pagination, meta } = usePagedQuery(
    "/client-assignments",
    queryFilters,
    { pageSize: 25 },
  );

  const updateMutation = useMutation("PATCH", {
    successMessage: "Assignment updated.",
    onSuccess: () => reload(),
  });

  const handlePublishRow = useCallback(
    async (row) => {
      if (!canManage || !row?.id) return;
      setPublishingId(row.id);
      setPublishError("");
      try {
        await publishAssignmentRow(row, { patchApi, postApi });
        await reload();
      } catch (err) {
        setPublishError(err?.message || "Publish failed.");
      } finally {
        setPublishingId(null);
      }
    },
    [canManage, reload],
  );

  const filtersActive = useMemo(
    () => Object.values(filters).some((v) => v != null && String(v).trim() !== ""),
    [filters],
  );

  const pageCounts = useMemo(() => pageScopedLifecycleCounts(rows), [rows]);

  const emptyDescription = emptyAssignmentsMessage({
    hasError: Boolean(error),
    filtersActive,
    publishedOnly: filters.published === "true",
  });

  const columns = useMemo(
    () => [
      {
        key: "client",
        label: "Client",
        minWidth: 130,
        render: (row) => (
          <div>
            <Truncate className="font-medium text-slate-900">{row.client?.name ?? "—"}</Truncate>
            {row.client?.status ? (
              <p className="mt-0.5 text-[10px] text-slate-400">{row.client.status}</p>
            ) : null}
          </div>
        ),
      },
      {
        key: "brand",
        label: "Brand",
        minWidth: 140,
        render: (row) => {
          const b = brandFromRow(row);
          return <BrandIdentity name={b.name || row.brandName} logoUrl={b.logoUrl || row.brandLogoLink} />;
        },
      },
      {
        key: "campaign",
        label: "Campaign",
        minWidth: 160,
        render: (row) => (
          <Truncate className="font-medium text-slate-800">
            {row.canonicalCampaign?.displayName ?? "—"}
          </Truncate>
        ),
      },
      {
        key: "network",
        label: "Network",
        minWidth: 90,
        render: (row) => row.networkSource || row.supplierLabel || "—",
      },
      {
        key: "commercial",
        label: "Commercial",
        minWidth: 90,
        render: (row) => (
          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold">
            {commercialModelLabel(row)}
          </span>
        ),
      },
      {
        key: "channel",
        label: "Channel",
        minWidth: 100,
        render: (row) => (
          <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
            {channelLabel(row)}
          </span>
        ),
      },
      {
        key: "assignmentStatus",
        label: "Assignment status",
        minWidth: 140,
        render: (row) => {
          const life = ledgerLifecycle(row);
          return (
            <div>
              <StatusPill status={life.code} label={life.label} />
              {life.issue || row.blocker ? (
                <p className="mt-1 max-w-[140px] text-[10px] text-rose-600">{life.issue || row.blocker}</p>
              ) : null}
            </div>
          );
        },
      },
      {
        key: "commission",
        label: "Commission",
        minWidth: 110,
        render: (row) => {
          const c = commissionLedgerDisplay(row);
          return (
            <span title={c.title}>
              <StatusPill status={row.commissionRuleStatus} label={c.label} />
            </span>
          );
        },
      },
      {
        key: "tracking",
        label: "Tracking",
        minWidth: 90,
        render: (row) => {
          const t = trackingPresentation(row);
          return <StatusPill status={t.code} label={t.label} />;
        },
      },
      {
        key: "coupon",
        label: "Coupon",
        minWidth: 100,
        render: (row) => {
          const c = couponPresentation(row);
          return <StatusPill status={c.code} label={c.label} />;
        },
      },
      {
        key: "published",
        label: "Published",
        minWidth: 90,
        render: (row) =>
          row.published ? (
            <StatusPill status="PUBLISHED" label="Published" />
          ) : (
            <StatusPill status="NOT_AVAILABLE" label="Not published" />
          ),
      },
      {
        key: "updatedAt",
        label: "Updated",
        minWidth: 120,
        render: (row) => <DateCell value={row.updatedAt || row.createdAt} />,
      },
      {
        key: "actions",
        label: "Action",
        minWidth: 120,
        render: (row) => {
          const action = ledgerPrimaryAction(row, { canManage });
          const publishing = publishingId === row.id;
          return (
            <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700"
                onClick={() => {
                  setDetail(row);
                  setOpsOpen(false);
                }}
              >
                {action.kind === "issue" ? "View issue" : "View"}
              </button>
              {action.kind === "publish" && canManage ? (
                <button
                  type="button"
                  disabled={publishing || updateMutation.loading}
                  className="rounded-lg border border-slate-900 bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white disabled:opacity-50"
                  onClick={() => handlePublishRow(row)}
                >
                  {publishing ? "Publishing…" : action.label}
                </button>
              ) : null}
              {action.kind === "activate" && row.clientId ? (
                <Link
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-800"
                  to={`/clients/${row.clientId}/activation`}
                >
                  {action.label}
                </Link>
              ) : null}
              {action.kind === "resume" && canManage ? (
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold"
                  onClick={() =>
                    updateMutation.mutate(`/client-assignments/${row.id}`, action.mutate)
                  }
                >
                  Resume
                </button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [canManage, handlePublishRow, publishingId, updateMutation],
  );

  const detailCanPublish =
    detail && !detail.published && assignmentPublishReadiness(detail).ready;

  return (
    <PageLayout
      title="Assignments"
      subtitle="Operational view of campaign assignments across clients. Catalog allots; Activation publishes. Assigned ≠ Published ≠ Client visible."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            to="/clients"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            Clients
          </Link>
          <Link
            to="/clients"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            title="Open a client, then Catalog"
          >
            Catalog (via client)
          </Link>
        </div>
      }
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {[
          ["Current page", pageCounts.total],
          ["Assigned", pageCounts.ASSIGNED],
          ["Commission ready", pageCounts.COMMISSION_READY],
          ["Tracking ready", pageCounts.TRACKING_READY],
          ["Provisioned", pageCounts.PROVISIONED],
          ["Client visible", pageCounts.CLIENT_VISIBLE],
          ["Paused", pageCounts.PAUSED],
          ["Revoked", pageCounts.REVOKED],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
            <strong className="mt-1 block text-lg tabular-nums text-slate-900">{value}</strong>
          </div>
        ))}
      </div>
      <p className="mb-3 text-[10px] text-slate-400">
        Summary tiles are <strong>current page</strong> only
        {meta?.totalCampaigns != null ? ` · SQL-matched total ${meta.totalCampaigns}` : ""}.
        {meta?.ledgerNote ? ` ${meta.ledgerNote}` : ""}
      </p>
      {publishError ? (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {publishError}
        </p>
      ) : null}

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
        dense
        emptyTitle={error ? "Unable to load assignments" : "No assignments"}
        emptyDescription={emptyDescription}
        onRowClick={(row) => {
          setDetail(row);
          setOpsOpen(false);
        }}
        toolbar={
          <FilterBar
            compact
            filters={FILTER_DEFS}
            values={filters}
            onChange={(key, value) => {
              setFilters((prev) => ({ ...prev, [key]: value }));
              if (key === "network") writeStoredClientNetwork(value);
            }}
            onReset={() => {
              writeStoredClientNetwork("");
              setFilters(EMPTY_FILTERS);
            }}
          />
        }
      />

      <Drawer
        open={Boolean(detail)}
        title="Assignment detail"
        width="max-w-2xl"
        onClose={() => {
          setDetail(null);
          setOpsOpen(false);
        }}
      >
        {detail ? (
          <div className="space-y-4 text-xs">
            <section className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Assignment</h3>
              <BrandIdentity
                name={brandFromRow(detail).name || detail.brandName}
                logoUrl={brandFromRow(detail).logoUrl || detail.brandLogoLink}
                size="md"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Client">{detail.client?.name || "—"}</Field>
                <Field label="Campaign">{detail.canonicalCampaign?.displayName || "—"}</Field>
                <Field label="Network">{detail.networkSource || "—"}</Field>
                <Field label="Assignment status">
                  <StatusPill
                    status={ledgerLifecycle(detail).code}
                    label={ledgerLifecycle(detail).label}
                  />
                </Field>
                <Field label="Created">
                  <DateCell value={detail.createdAt} />
                </Field>
                <Field label="Updated">
                  <DateCell value={detail.updatedAt} />
                </Field>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Commercial</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Campaign commercial model">{commercialModelLabel(detail)}</Field>
                <Field label="Channel">{channelLabel(detail)}</Field>
                <Field label="Client commercial model">
                  {detail.clientCommercialModel || detail.client?.commercialModel || "Not configured"}
                </Field>
                <Field label="Client share (estimate)">
                  {detail.clientSharePercent != null
                    ? `${detail.clientSharePercent}%`
                    : detail.client?.clientSharePercent != null
                      ? `${detail.client.clientSharePercent}%`
                      : "—"}
                </Field>
                <Field label="Commission rule status">
                  {detail.commissionRuleStatus || "Not available"}
                </Field>
                <Field label="Commission rule type">{detail.commissionType || "—"}</Field>
              </div>
              <p className="text-[10px] text-slate-400">
                Client share is an estimate arrangement. Do not treat it as supplier receivable or MBO margin.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Tracking</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Tracking status">
                  <StatusPill
                    status={trackingPresentation(detail).code}
                    label={trackingPresentation(detail).label}
                  />
                </Field>
                <Field label="MBO tracking URL">
                  {detail.trackingUrl ? (
                    <span className="break-all font-mono text-[11px]">{detail.trackingUrl}</span>
                  ) : (
                    "Not available"
                  )}
                </Field>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Coupon</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Coupon status">
                  <StatusPill
                    status={couponPresentation(detail).code}
                    label={couponPresentation(detail).label}
                  />
                </Field>
                <Field label="Coupon code">{detail.couponCode || "Not available"}</Field>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Publication</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Published">{detail.published ? "Yes" : "No"}</Field>
                <Field label="Published at">
                  {detail.publishedAt ? <DateCell value={detail.publishedAt} /> : "—"}
                </Field>
                <Field label="Client visible">
                  {ledgerLifecycle(detail).clientVisible ? "Yes" : "No"}
                </Field>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Relationship</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Relationship">
                  {detail.relationshipLabel ||
                    (detail.relationshipStatus && detail.relationshipStatus !== "UNKNOWN"
                      ? detail.relationshipStatus
                      : "Needs review")}
                </Field>
                <Field label="Network">{detail.networkSource || "—"}</Field>
              </div>
            </section>

            {(detail.blocker || ledgerLifecycle(detail).issue) && (
              <section className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Blockers
                </h3>
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
                  {detail.blocker || ledgerLifecycle(detail).issue}
                </p>
              </section>
            )}

            <div className="flex flex-wrap gap-2">
              {detail.clientId ? (
                <>
                  <Link
                    className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold"
                    to={`/clients/${detail.clientId}/catalog`}
                  >
                    Open Catalog
                  </Link>
                  <Link
                    className="rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white"
                    to={`/clients/${detail.clientId}/activation`}
                  >
                    Open Activation
                  </Link>
                </>
              ) : null}
              {canManage && detailCanPublish ? (
                <Button
                  type="button"
                  disabled={publishingId === detail.id}
                  onClick={() => handlePublishRow(detail)}
                >
                  {publishingId === detail.id ? "Publishing…" : "Publish"}
                </Button>
              ) : null}
              {canManage && detail.status === "ACTIVE" ? (
                <Button
                  type="button"
                  onClick={() =>
                    updateMutation.mutate(`/client-assignments/${detail.id}`, {
                      lifecycle: "paused",
                    })
                  }
                >
                  Pause
                </Button>
              ) : null}
              {canManage && detail.status !== "REVOKED" ? (
                <Button
                  type="button"
                  onClick={() =>
                    updateMutation.mutate(`/client-assignments/${detail.id}`, {
                      lifecycle: "archived",
                    })
                  }
                >
                  Archive
                </Button>
              ) : null}
            </div>

            <section>
              <button
                type="button"
                className="text-[10px] font-bold uppercase tracking-wide text-slate-400"
                onClick={() => setOpsOpen((v) => !v)}
              >
                {opsOpen ? "▾" : "▸"} Operations (technical)
              </button>
              {opsOpen ? (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <Field label="Assignment ID">{detail.id || "—"}</Field>
                  <Field label="CampaignSource ID">{detail.campaignSourceId || "—"}</Field>
                  <Field label="SupplierCampaign ID">{detail.supplierCampaignId || "—"}</Field>
                  <Field label="TrackingLink ID">{detail.trackingLinkId || "—"}</Field>
                  <Field label="CommissionRule ID">{detail.commissionRuleId || "—"}</Field>
                  <Field label="Canonical campaign ID">{detail.canonicalCampaignId || "—"}</Field>
                </div>
              ) : null}
            </section>
          </div>
        ) : null}
      </Drawer>
    </PageLayout>
  );
}
