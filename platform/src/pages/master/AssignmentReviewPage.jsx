import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { patchApi, postApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { Button } from "../../components/ui/Button";
import { StatusPill } from "../../components/ui/StatusPill";
import { BrandIdentity, brandFromRow } from "../../components/brand/BrandIdentity";
import { displayText } from "../../utils/display";
import { MonoChip, UrlCell } from "../../components/ui/TableCells";
import { CampaignDetailsPanel } from "./CampaignDetailsPanel";
import { AssignmentStepper } from "./AssignmentStepper";
import { publishAssignmentRow } from "../clients/assignmentPublishActions";
import {
  assignmentAsCampaignRow,
  deriveAllocationMode,
  masterCampaignCouponCode,
  publishReadinessOfAssignment,
  resolveAssignmentTrackingUrl,
  seedClientFacing,
} from "./masterCampaignHelpers";

const FILTER_DEFS = [
  { key: "search", type: "search", label: "Search", placeholder: "Client, brand, campaign" },
];

export function AssignmentReviewPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.CLIENTS_MANAGE);
  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = searchParams.get("clientId") || "";
  const savedCount = searchParams.get("saved");
  const [detail, setDetail] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({ search: "" });

  useEffect(() => {
    if (!savedCount) return;
    setMessage(
      `${savedCount} unpublished draft${Number(savedCount) === 1 ? "" : "s"} saved from Assign Campaigns. Review checklist items, then Publish.`,
    );
    const next = new URLSearchParams(searchParams);
    next.delete("saved");
    setSearchParams(next, { replace: true });
  }, [savedCount, searchParams, setSearchParams]);

  const queryFilters = useMemo(
    () => ({
      published: "false",
      ...(clientId ? { clientId } : {}),
      ...(filters.search ? { search: filters.search } : {}),
    }),
    [filters, clientId],
  );
  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/client-assignments",
    queryFilters,
    { pageSize: 25 },
  );

  async function publishRow(row) {
    const readiness = publishReadinessOfAssignment(row);
    if (!readiness.ready) {
      setMessage(
        `Cannot publish yet — missing: ${readiness.missing.map((f) => f.label).join(", ")}. Open Campaign Details to fill them.`,
      );
      return;
    }
    setBusyId(row.id);
    setMessage("");
    try {
      await publishAssignmentRow(row, { patchApi, postApi });
      await reload();
      setMessage(`Published "${row.canonicalCampaign?.displayName || row.id}". You can publish the next draft on this page.`);
    } catch (err) {
      setMessage(err?.message || "Publish failed.");
    } finally {
      setBusyId(null);
    }
  }

  const assignHref = clientId
    ? `/master/assign?step=configure&clientId=${encodeURIComponent(clientId)}`
    : "/master/assign?step=select";

  const columns = useMemo(
    () => [
      {
        key: "client",
        label: "Client",
        render: (row) => displayText(row.client?.name),
      },
      {
        key: "brand",
        label: "Brand",
        minWidth: 140,
        render: (row) => {
          const b = brandFromRow(row);
          const facing = row.clientFacing || {};
          return (
            <BrandIdentity
              name={b.name || row.brandName || facing.brandName}
              logoUrl={b.logoUrl || row.brandLogoLink || facing.brandLogoUrl}
            />
          );
        },
      },
      {
        key: "campaign",
        label: "Campaign",
        render: (row) =>
          displayText(row.clientFacing?.campaignName || row.canonicalCampaign?.displayName),
      },
      {
        key: "source",
        label: "Source",
        render: (row) =>
          displayText(
            row.campaignSource?.supplierCampaign?.supplier ||
              row.networkSource ||
              row.supplier ||
              row.clientFacing?.networkSource,
          ),
      },
      {
        key: "coupon",
        label: "Coupon",
        minWidth: 110,
        render: (row) => {
          const campaign = assignmentAsCampaignRow(row);
          const couponCode = masterCampaignCouponCode(campaign) || row.clientFacing?.couponCode;
          return couponCode ? <MonoChip value={couponCode} /> : displayText(null);
        },
      },
      {
        key: "allocationMode",
        label: "Allocation Mode",
        render: (row) => displayText(deriveAllocationMode(assignmentAsCampaignRow(row), row.clientFacing)),
      },
      {
        key: "mboLink",
        label: "MBO Link",
        minWidth: 160,
        render: (row) => {
          const linkUrl = resolveAssignmentTrackingUrl(row);
          if (!linkUrl) return displayText(null);
          return <UrlCell url={linkUrl} missingLabel="—" tone="indigo" />;
        },
      },
      {
        key: "validation",
        label: "Validation",
        render: (row) => {
          const r = publishReadinessOfAssignment(row);
          return (
            <StatusPill status={r.ready ? "READY" : "NEEDS_REVIEW"} label={r.ready ? "Passed" : "Failed"} />
          );
        },
      },
      {
        key: "publishStatus",
        label: "Publish Status",
        render: (row) => <StatusPill status={row.status} />,
      },
      {
        key: "actions",
        label: "Action",
        render: (row) => {
          const ready = publishReadinessOfAssignment(row).ready;
          return (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setDetail(row)}>
                Open
              </Button>
              {canManage ? (
                <Button
                  size="sm"
                  variant="primary"
                  disabled={busyId === row.id}
                  title={
                    ready
                      ? "Publish to client Assignments"
                      : "Will try to create tracking if missing; facing fields must be complete"
                  }
                  onClick={() => publishRow(row)}
                >
                  Publish
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [busyId, canManage],
  );

  return (
    <PageLayout
      eyebrow="Master"
      title="Assignment Review"
      subtitle="Unpublished drafts saved from Assign Campaigns. Validate client-facing fields, tracking, and commission, then publish to the Assignments ledger."
      actions={
        <div className="flex gap-2">
          {clientId ? (
            <Link
              to={`/assignments?clientId=${encodeURIComponent(clientId)}`}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Published Assignments
            </Link>
          ) : null}
          <Link
            to={assignHref}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {clientId ? "Back to Configure" : "Assign Campaigns"}
          </Link>
        </div>
      }
    >
      <AssignmentStepper current="review" selectedCount={rows.length} />

      {message ? (
        <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      {clientId ? (
        <p className="mb-3 text-xs text-slate-600">
          Showing unpublished drafts for this client.{" "}
          <Link to="/master/review" className="font-medium text-brand-700 underline">
            Clear client filter
          </Link>
        </p>
      ) : (
        <p className="mb-3 text-xs text-slate-600">
          Showing all unpublished drafts. Save from Assign Campaigns with a client selected to land here filtered.
        </p>
      )}

      <FilterBar
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onReset={() => setFilters({ search: "" })}
        filters={FILTER_DEFS}
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
        pageSize={pagination.pageSize}
        onPageChange={setPage}
        emptyTitle="Nothing to review"
        emptyDescription="Go to Assign Campaigns → select a client → configure → Save & open Assignment Review. Only unpublished drafts appear here."
      />
      <CampaignDetailsPanel
        open={Boolean(detail)}
        campaign={detail ? assignmentAsCampaignRow(detail) : null}
        clientFacing={detail?.clientFacing || {}}
        sources={detail?.sources || []}
        selectedSourceId={detail?.campaignSourceId}
        client={detail?.client}
        resetKey={detail?.id}
        canEdit={canManage}
        onClose={() => setDetail(null)}
        onSave={async (clientFacing) => {
          if (!detail?.id) return;
          await patchApi(`/client-assignments/${detail.id}`, {
            clientFacing: seedClientFacing(assignmentAsCampaignRow(detail), clientFacing),
          });
          setDetail(null);
          await reload();
        }}
      />
    </PageLayout>
  );
}
