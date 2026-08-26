import { useMemo, useState } from "react";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { useMutation } from "../../hooks/useMutation";
import { useResourceOptions } from "../../hooks/useResourceOptions";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { Badge } from "../../components/ui/Badge";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { DateCell, MonoChip, Truncate, UrlCell } from "../../components/ui/TableCells";
import { StatusBadge } from "../helpers";

const STATUS_OPTIONS = [
  { value: "GENERATED", label: "Generated" },
  { value: "ACTIVE", label: "Active" },
  { value: "REVOKED", label: "Revoked" },
];

async function copyText(value) {
  if (!value || !navigator?.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function TrackingLinksPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.TRACKING_MANAGE);
  const [filters, setFilters] = useState({ status: "", clientId: "", search: "" });
  const [copiedId, setCopiedId] = useState(null);

  const { options: clientOptions } = useResourceOptions("/clients", (row) => ({
    value: row.id,
    label: row.name,
  }));

  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    [filters],
  );
  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/tracking-links",
    queryFilters,
    { pageSize: 25 },
  );

  const updateMutation = useMutation("PATCH", {
    successMessage: "Tracking link updated.",
    onSuccess: () => reload(),
  });

  async function handleCopy(row) {
    const ok = await copyText(row.mboTrackingUrl);
    if (ok) {
      setCopiedId(row.id);
      setTimeout(() => setCopiedId((current) => (current === row.id ? null : current)), 1500);
    }
  }

  const filterDefs = useMemo(
    () => [
      { key: "search", label: "Search", type: "search", placeholder: "Slug, token, client…" },
      { key: "clientId", label: "Client", options: clientOptions, allLabel: "All clients" },
      { key: "status", label: "Status", options: STATUS_OPTIONS, allLabel: "All statuses" },
    ],
    [clientOptions],
  );

  const columns = useMemo(
    () => [
      {
        key: "client",
        label: "Client",
        minWidth: 110,
        render: (row) => <Truncate className="font-medium text-slate-900">{row.client?.name || "—"}</Truncate>,
      },
      {
        key: "campaign",
        label: "Campaign",
        minWidth: 200,
        render: (row) => <Truncate>{row.campaign?.displayName || "—"}</Truncate>,
      },
      {
        key: "brand",
        label: "Brand",
        minWidth: 120,
        defaultHidden: true,
        render: (row) => <Truncate>{row.brand || row.campaign?.brand || "—"}</Truncate>,
      },
      {
        key: "slug",
        label: "Slug",
        minWidth: 140,
        defaultHidden: true,
        render: (row) => <MonoChip value={row.slug} />,
      },
      {
        key: "token",
        label: "Token",
        minWidth: 100,
        render: (row) => <MonoChip value={row.token || row.subId} />,
      },
      {
        key: "supplier",
        label: "Supplier",
        minWidth: 100,
        defaultHidden: true,
        render: (row) => <Truncate>{row.supplier || "—"}</Truncate>,
      },
      {
        key: "supplierTrackingUrl",
        label: "Supplier URL",
        minWidth: 200,
        defaultHidden: true,
        render: (row) => <UrlCell url={row.supplierTrackingUrl} tone="slate" />,
      },
      {
        key: "mboTrackingUrl",
        label: "MBO URL",
        minWidth: 220,
        render: (row) => <UrlCell url={row.mboTrackingUrl} tone="indigo" />,
      },
      {
        key: "status",
        label: "Status",
        minWidth: 130,
        render: (row) => (
          <div className="flex flex-nowrap items-center gap-1.5">
            <StatusBadge status={row.status} />
            {row.assignmentPublished ? <Badge variant="success">Live</Badge> : null}
          </div>
        ),
      },
      {
        key: "clickCount",
        label: "Clicks",
        minWidth: 70,
        className: "text-right tabular-nums",
        headerClassName: "text-right",
        render: (row) => row.clickCount ?? 0,
      },
      {
        key: "createdAt",
        label: "Created",
        minWidth: 130,
        render: (row) => <DateCell value={row.createdAt} />,
      },
      {
        key: "actions",
        label: "",
        minWidth: 48,
        render: (row) => (
          <ActionMenu
            items={[
              {
                label: copiedId === row.id ? "Copied MBO URL" : "Copy MBO URL",
                visible: Boolean(row.mboTrackingUrl),
                onClick: () => handleCopy(row),
              },
              {
                label: "Preview redirect",
                visible: Boolean(row.mboTrackingUrl),
                onClick: () => window.open(row.mboTrackingUrl, "_blank", "noopener,noreferrer"),
              },
              {
                label: "Open supplier URL",
                visible: Boolean(row.supplierTrackingUrl),
                onClick: () => window.open(row.supplierTrackingUrl, "_blank", "noopener,noreferrer"),
              },
              {
                label: "Make primary",
                visible: canManage && !row.isPrimary && row.status !== "REVOKED",
                onClick: () => updateMutation.mutate(`/tracking-links/${row.id}`, { isPrimary: true }),
              },
              {
                label: "Regenerate token",
                visible: canManage && row.status !== "REVOKED",
                onClick: () => updateMutation.mutate(`/tracking-links/${row.id}`, { regenerateToken: true }),
              },
              {
                label: "Disable",
                danger: true,
                visible: canManage && row.status !== "REVOKED",
                onClick: () => updateMutation.mutate(`/tracking-links/${row.id}`, { status: "REVOKED" }),
              },
            ]}
          />
        ),
      },
    ],
    [canManage, copiedId, updateMutation],
  );

  return (
    <PageLayout
      title="Tracking Links"
      subtitle="Short MBO links redirect to each campaign’s supplier destination. Use Columns to show slug or supplier URL."
    >
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
        emptyTitle="No tracking links"
        emptyDescription="Links are created automatically when campaigns are allotted to a client."
        toolbar={
          <FilterBar
            compact
            filters={filterDefs}
            values={filters}
            onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onReset={() => setFilters({ status: "", clientId: "", search: "" })}
          />
        }
      />
    </PageLayout>
  );
}
