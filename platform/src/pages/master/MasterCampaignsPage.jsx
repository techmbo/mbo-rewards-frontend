import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchApi } from "../../api";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { useAuth } from "../../context/AuthContext";
import { hasAnyPermission, PERMISSIONS } from "../../auth/permissions";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { Button } from "../../components/ui/Button";
import { StatusPill } from "../../components/ui/StatusPill";
import { BrandIdentity, brandFromRow } from "../../components/brand/BrandIdentity";
import { countryListTitle, displayText } from "../../utils/display";
import { CampaignDetailsPanel } from "./CampaignDetailsPanel";
import {
  assignabilityOf,
  filterMasterCampaignRows,
  formatAssetAvailability,
  formatCampaignType,
  formatCommissionDisplay,
  formatCountries,
  masterCampaignCouponCode,
  masterCampaignLinkUrl,
  toSupplierCampaignQueryFilters,
} from "./masterCampaignHelpers";
import { getMasterFacingOverride, loadMasterFacingOverrides, saveMasterFacingOverride } from "./masterFacingStore";
import { loadAssignDraft, saveAssignDraft } from "./assignDraftStore";

const FILTER_DEFS = [
  { key: "q", type: "search", label: "Search", placeholder: "Brand or campaign" },
  {
    key: "networkSource",
    label: "Network",
    allLabel: "All networks",
    options: [
      { value: "OPTIMISE", label: "Optimise" },
      { value: "TRACKIER", label: "Trackier" },
      { value: "BOOSTINY", label: "Boostiny" },
      { value: "PARTNERIZE", label: "Partnerize" },
      { value: "IMPACT", label: "Impact" },
    ],
  },
  {
    key: "campaignStatus",
    label: "Status",
    allLabel: "All statuses",
    options: [
      { value: "ACTIVE", label: "Active" },
      { value: "PAUSED", label: "Paused" },
      { value: "PENDING", label: "Pending" },
    ],
  },
  {
    key: "assignable",
    label: "Assignable",
    allLabel: "All",
    options: [
      { value: "true", label: "Assignable only" },
      { value: "false", label: "Not assignable" },
    ],
  },
  {
    key: "relationshipStatus",
    label: "Relationship",
    allLabel: "All relationships",
    options: [
      { value: "JOINED", label: "Joined" },
      { value: "APPROVED", label: "Approved" },
      { value: "PENDING", label: "Pending" },
      { value: "NOT_JOINED", label: "Not joined" },
      { value: "UNKNOWN", label: "Unknown" },
    ],
  },
  {
    key: "channelSupport",
    label: "Channel",
    allLabel: "All channels",
    options: [
      { value: "link", label: "Link" },
      { value: "coupon", label: "Coupon" },
      { value: "deeplink", label: "Deeplink" },
    ],
  },
];

const EMPTY_FILTERS = {
  q: "",
  networkSource: "",
  campaignStatus: "",
  assignable: "",
  relationshipStatus: "",
  channelSupport: "",
};

export function MasterCampaignsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = hasAnyPermission(user, [PERMISSIONS.CATALOG_MANAGE, PERMISSIONS.CLIENTS_MANAGE]);
  const [filters, setFilters] = useState(() => {
    const brandSearch = sessionStorage.getItem("mbo.master.brandSearch") || "";
    if (brandSearch) sessionStorage.removeItem("mbo.master.brandSearch");
    return { ...EMPTY_FILTERS, q: brandSearch };
  });
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [facingOverrides, setFacingOverrides] = useState(() => loadMasterFacingOverrides());
  const [gateMessage, setGateMessage] = useState("");

  const queryFilters = useMemo(() => toSupplierCampaignQueryFilters(filters), [filters]);
  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/supplier-campaigns",
    queryFilters,
    { pageSize: 25 },
  );

  const visibleRows = useMemo(() => filterMasterCampaignRows(rows, filters), [rows, filters]);

  async function openDetail(row) {
    setDetailLoading(true);
    try {
      const res = await fetchApi(`/supplier-campaigns/${row.id}`, { forMaster: true });
      setDetail(res?.data ?? row);
    } catch {
      setDetail(row);
    } finally {
      setDetailLoading(false);
    }
  }

  const [draftTick, setDraftTick] = useState(0);

  function addToAssignment(row, { force = false, goToAssign = true } = {}) {
    const eligibility = assignabilityOf(row);
    if (!eligibility.assignable && !force) {
      setGateMessage(
        `"${row.campaignName || row.displayName || "Campaign"}" is not assignable yet: ${eligibility.blockers.join("; ")}. Open details or force-add if you still need a draft.`,
      );
      return;
    }
    setGateMessage("");
    const draft = loadAssignDraft();
    const clientFacing = getMasterFacingOverride(row.id);
    if (!draft.campaignIds.includes(row.id)) {
      draft.campaignIds = [...draft.campaignIds, row.id];
      draft.configs[row.id] = {
        campaign: row,
        clientFacing,
        selectedSourceId: row.campaignSourceId || row.primaryCampaignSourceId || null,
        createTrackingLink: true,
      };
      saveAssignDraft(draft);
    } else if (Object.keys(clientFacing).length) {
      draft.configs[row.id] = {
        ...(draft.configs[row.id] || {}),
        campaign: row,
        clientFacing: { ...(draft.configs[row.id]?.clientFacing || {}), ...clientFacing },
      };
      saveAssignDraft(draft);
    }
    setDraftTick((n) => n + 1);
    if (goToAssign) navigate("/master/assign?step=select");
  }

  function toggleSelect(row) {
    const draft = loadAssignDraft();
    if (draft.campaignIds.includes(row.id)) {
      draft.campaignIds = draft.campaignIds.filter((id) => id !== row.id);
      delete draft.configs[row.id];
      saveAssignDraft(draft);
      setDraftTick((n) => n + 1);
      return;
    }
    addToAssignment(row, { force: true, goToAssign: false });
  }

  function saveClientFacing(clientFacing) {
    if (!detail?.id) return;
    saveMasterFacingOverride(detail.id, clientFacing);
    setFacingOverrides(loadMasterFacingOverrides());
  }

  const selectedIds = useMemo(() => new Set(loadAssignDraft().campaignIds), [draftTick]);

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: "Select",
        width: 52,
        render: (row) => (
          <input
            type="checkbox"
            checked={selectedIds.has(row.id)}
            aria-label={`Select ${row.campaignName || row.displayName || "campaign"}`}
            onClick={(e) => e.stopPropagation()}
            onChange={() => toggleSelect(row)}
          />
        ),
      },
      {
        key: "brandName",
        label: "Brand Name",
        minWidth: 150,
        render: (row) => {
          const b = brandFromRow(row);
          return <BrandIdentity name={b.name} logoUrl={b.logoUrl} />;
        },
      },
      {
        key: "campaignName",
        label: "Campaign Name",
        minWidth: 180,
        render: (row) => (
          <span className="font-medium text-slate-900">{displayText(row.campaignName || row.displayName)}</span>
        ),
      },
      {
        key: "masterCampaignId",
        label: "Master Campaign ID",
        minWidth: 140,
        render: (row) => (
          <span className="font-mono text-xs text-slate-700">
            {displayText(row.masterCampaignId || row.id)}
          </span>
        ),
      },
      {
        key: "country",
        label: "Country",
        render: (row) => {
          const countries = row.countries || row.country || row.countryCodes;
          return (
            <span className="block max-w-[8rem] truncate whitespace-nowrap" title={countryListTitle(countries) || undefined}>
              {displayText(formatCountries(countries))}
            </span>
          );
        },
      },
      {
        key: "currency",
        label: "Currency",
        render: (row) => displayText(row.currencyCode || row.currency || row.commissionCurrency),
      },
      {
        key: "primaryCategory",
        label: "Primary Category",
        render: (row) => displayText(row.primaryCategory || row.categoryName || row.merchant?.category),
      },
      {
        key: "campaignType",
        label: "Campaign Type",
        render: (row) => displayText(formatCampaignType(row) || row.campaignType),
      },
      {
        key: "commission",
        label: "Commission",
        render: (row) => displayText(formatCommissionDisplay(row)),
      },
      {
        key: "primaryNetwork",
        label: "Primary Network",
        render: (row) => displayText(row.networkSource || row.supplier),
      },
      {
        key: "primarySourceId",
        label: "Primary Source ID",
        minWidth: 120,
        render: (row) => (
          <span className="font-mono text-xs text-slate-700">
            {displayText(row.primarySourceId || row.supplierCampaignId)}
          </span>
        ),
      },
      {
        key: "alternateSources",
        label: "Alternate Sources",
        render: (row) => displayText(row.alternateSources ?? Math.max(0, (row.sources?.length || 0) - 1)),
      },
      {
        key: "coupon",
        label: "Coupon",
        render: (row) => {
          const code = masterCampaignCouponCode(row);
          const available = Boolean(code || row.hasCoupon || assignabilityOf(row).supportsCoupon);
          return displayText(formatAssetAvailability(available));
        },
      },
      {
        key: "link",
        label: "Link",
        render: (row) => {
          const url = masterCampaignLinkUrl(row);
          const available = Boolean(
            url || row.hasLink || assignabilityOf(row).supportsLink || assignabilityOf(row).supportsDeeplink,
          );
          return displayText(formatAssetAvailability(available));
        },
      },
      {
        key: "products",
        label: "Products",
        render: (row) => displayText(formatAssetAvailability(Boolean(row.hasProducts))),
      },
      {
        key: "assignmentReady",
        label: "Assignment Ready",
        render: (row) => {
          const el = assignabilityOf(row);
          return (
            <StatusPill status={el.assignable ? "READY" : "BLOCKED"} label={el.assignable ? "Yes" : "No"} />
          );
        },
      },
      {
        key: "assignedCount",
        label: "Assigned Count",
        render: (row) => displayText(row.assignedCount ?? 0),
      },
      {
        key: "action",
        label: "Action",
        render: (row) => {
          const el = assignabilityOf(row);
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openDetail(row);
                }}
              >
                Open
              </Button>
              <Button
                size="sm"
                variant="secondary"
                title={el.assignable ? "Add to assignment draft" : el.blockers.join("; ")}
                onClick={(e) => {
                  e.stopPropagation();
                  addToAssignment(row);
                }}
              >
                Assign
              </Button>
            </div>
          );
        },
      },
    ],
    [selectedIds],
  );

  return (
    <PageLayout
      eyebrow="Master"
      title="Master Campaigns"
      subtitle="All campaigns fetched from network suppliers. Assignable means ACTIVE + joined + channel support + commission."
      actions={
        <Link
          to="/master/assign"
          className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Assign Campaigns
        </Link>
      }
    >
      {gateMessage ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {gateMessage}
        </p>
      ) : null}
      <FilterBar
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onReset={() => setFilters(EMPTY_FILTERS)}
        filters={FILTER_DEFS}
      />
      <DataTable
        columns={columns}
        rows={visibleRows}
        loading={loading}
        error={error}
        onRetry={reload}
        onRefresh={reload}
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        pageSize={pagination.pageSize}
        onPageChange={setPage}
        emptyTitle="No master campaigns"
        emptyDescription="Fetched network campaigns appear here after supplier sync completes."
      />
      <CampaignDetailsPanel
        open={Boolean(detail) || detailLoading}
        campaign={detail}
        clientFacing={detail?.id ? facingOverrides[detail.id] || {} : {}}
        sources={detail?.sources || []}
        selectedSourceId={detail?.campaignSourceId || detail?.primaryCampaignSourceId}
        resetKey={detail?.id}
        canEdit={canEdit}
        onClose={() => setDetail(null)}
        onSave={saveClientFacing}
      />
    </PageLayout>
  );
}
