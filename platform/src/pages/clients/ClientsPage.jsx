import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { useMutation } from "../../hooks/useMutation";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { Button } from "../../components/ui/Button";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { StatusBadge } from "../helpers";
import { StatusPill } from "../../components/ui/StatusPill";
import { COUNTRY_OPTIONS } from "../../utils/countries";
import { Truncate } from "../../components/ui/TableCells";

import { NETWORK_FILTER_DEF, readStoredClientNetwork, writeStoredClientNetwork } from "./NetworkFilter";

const STATUS_OPTIONS = [
  { value: "PROSPECT", label: "Prospect / Onboarding" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "OFFBOARDED", label: "Offboarded" },
];

const FILTER_DEFS = [
  { key: "search", type: "search", label: "Search", placeholder: "Client name..." },
  NETWORK_FILTER_DEF,
  { key: "status", label: "Status", options: STATUS_OPTIONS, allLabel: "All statuses" },
  {
    key: "country",
    label: "Country",
    options: COUNTRY_OPTIONS,
    allLabel: "All countries",
  },
];

/**
 * Clients directory (v5) — Open Client → Client Setup.
 */
export function ClientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = hasPermission(user, PERMISSIONS.CLIENTS_MANAGE);
  const [filters, setFilters] = useState(() => ({
    search: "",
    network: readStoredClientNetwork(),
    status: "",
    country: "",
  }));

  const queryFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filters).filter(([key, v]) => v && key !== "network"),
      ),
    [filters],
  );
  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/clients",
    queryFilters,
    { pageSize: 25 },
  );

  const metrics = useMemo(() => {
    const total = pagination.total ?? rows.length;
    const active = rows.filter((r) => r.status === "ACTIVE").length;
    const onboarding = rows.filter((r) => r.status === "PROSPECT").length;
    const apiReady = rows.filter((r) => r.opsSummary?.apiAccess === "CONFIGURED").length;
    const needsReview = rows.filter(
      (r) => r.status !== "ACTIVE" && r.opsSummary?.readyForActivation === false,
    ).length;
    return { total, active, onboarding, apiReady, needsReview };
  }, [rows, pagination.total]);

  const updateMutation = useMutation("PATCH", {
    successMessage: "Client updated.",
    onSuccess: () => reload(),
  });

  const deleteMutation = useMutation("DELETE", {
    successMessage: "Client deleted.",
    onSuccess: () => reload(),
  });

  function handleDelete(row) {
    const confirmed = window.confirm(
      `Delete client "${row.name}"? This removes them from the client list and offboards the account.`,
    );
    if (!confirmed) return;
    deleteMutation.mutate(`/clients/${row.id}`);
  }

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Client",
        minWidth: 160,
        render: (row) => <Truncate className="font-medium text-slate-900">{row.name}</Truncate>,
      },
      {
        key: "country",
        label: "Country",
        minWidth: 80,
        render: (row) => row.country || "—",
      },
      {
        key: "industry",
        label: "Client Type",
        minWidth: 100,
        render: (row) => <Truncate>{row.industry || row.category || "—"}</Truncate>,
      },
      {
        key: "agreement",
        label: "Agreement",
        minWidth: 100,
        render: (row) => {
          const signed =
            row.opsSummary?.agreementSigned ||
            String(row.agreementStatus || "").toUpperCase() === "SIGNED";
          return (
            <StatusPill status={signed ? "ACTIVE" : "PENDING"} label={signed ? "Signed" : "Pending"} />
          );
        },
      },
      {
        key: "commercial",
        label: "Commercials",
        minWidth: 110,
        render: (row) =>
          row.opsSummary?.commercialConfigured || row.commercialModel ? (
            <StatusPill status="ACTIVE" label="Configured" />
          ) : (
            <StatusPill status="PENDING" label="Pending" />
          ),
      },
      {
        key: "assigned",
        label: "Assigned Campaigns",
        minWidth: 110,
        render: (row) => displayCount(row.opsSummary?.assignedCount),
      },
      {
        key: "activeCampaigns",
        label: "Active Campaigns",
        minWidth: 110,
        render: (row) => displayCount(row.opsSummary?.publishedCount),
      },
      {
        key: "api",
        label: "API",
        minWidth: 100,
        render: (row) => (
          <StatusPill
            status={row.opsSummary?.apiAccess === "CONFIGURED" ? "ACTIVE" : "NOT_CONFIGURED"}
            label={row.opsSummary?.apiAccess === "CONFIGURED" ? "Active" : "Pending"}
          />
        ),
      },
      {
        key: "portal",
        label: "Portal",
        minWidth: 100,
        render: (row) => (
          <StatusPill
            status={row.opsSummary?.portalAccess === "CONFIGURED" ? "ACTIVE" : "NOT_CONFIGURED"}
            label={row.opsSummary?.portalAccess === "CONFIGURED" ? "Active" : "Pending"}
          />
        ),
      },
      {
        key: "activation",
        label: "Activation",
        minWidth: 110,
        render: (row) => {
          if (row.status === "ACTIVE") return <StatusPill status="ACTIVE" label="Active" />;
          if (row.opsSummary?.readyForActivation) {
            return <StatusPill status="READY" label="Ready" />;
          }
          return <StatusPill status="PENDING" label="Setup" />;
        },
      },
      {
        key: "account",
        label: "Account",
        minWidth: 100,
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "updated",
        label: "Last Updated",
        minWidth: 110,
        render: (row) => formatShortDate(row.updatedAt),
      },
      {
        key: "actions",
        label: "Action",
        minWidth: 120,
        render: (row) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              to={`/clients/${row.id}/setup`}
              className="rounded-lg border border-slate-900 bg-slate-900 px-2.5 py-1.5 text-[10px] font-semibold text-white"
              onClick={(e) => e.stopPropagation()}
            >
              Open Client
            </Link>
            {canManage ? (
              <ActionMenu
                items={[
                  {
                    label: "Client Campaigns",
                    onClick: () => navigate(`/assignments?clientId=${encodeURIComponent(row.id)}`),
                  },
                  {
                    label: "Activation Review",
                    onClick: () => navigate(`/activation-review?clientId=${row.id}`),
                  },
                  {
                    label: "Suspend",
                    visible: row.status === "ACTIVE",
                    onClick: () => updateMutation.mutate(`/clients/${row.id}`, { status: "SUSPENDED" }),
                  },
                  {
                    label: "Offboard",
                    danger: true,
                    visible: row.status !== "OFFBOARDED",
                    onClick: () => updateMutation.mutate(`/clients/${row.id}`, { status: "OFFBOARDED" }),
                  },
                  {
                    label: "Delete",
                    danger: true,
                    onClick: () => handleDelete(row),
                  },
                ]}
              />
            ) : null}
          </div>
        ),
      },
    ],
    [canManage, navigate, updateMutation, deleteMutation],
  );

  return (
    <PageLayout
      eyebrow="Client Operations"
      title="Clients"
      subtitle="Global client directory. Open a client to manage all client-specific information in Client Setup."
      actions={
        canManage ? (
          <Button variant="primary" onClick={() => navigate("/clients/setup")}>
            + Add Client
          </Button>
        ) : null
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Total Clients", metrics.total, "All accounts"],
          ["Active", metrics.active, "Live clients"],
          ["Setup In Progress", metrics.onboarding, "Not activated"],
          ["API Active", metrics.apiReady, "Production access"],
          ["Needs Review", metrics.needsReview, "Activation blockers"],
        ].map(([label, value, hint]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
            <strong className="mt-2 block text-2xl text-slate-900">{value}</strong>
            <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>
          </div>
        ))}
      </div>

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
        emptyTitle="No clients"
        emptyDescription="Add a client to open Client Setup and configure agreement, commercials, and delivery."
        onRowClick={(row) => {
          if (row?.id) navigate(`/clients/${row.id}/setup`);
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
              setFilters({ search: "", network: "", status: "", country: "" });
            }}
          />
        }
      />
    </PageLayout>
  );
}

function displayCount(value) {
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : "—";
}

function formatShortDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
