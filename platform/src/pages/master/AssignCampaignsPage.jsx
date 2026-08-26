import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchApi, patchApi, postApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { BrandIdentity, brandFromRow } from "../../components/brand/BrandIdentity";
import { countryListTitle, displayText } from "../../utils/display";
import { ExpandableText, MonoChip, UrlCell } from "../../components/ui/TableCells";
import { AssignmentStepper } from "./AssignmentStepper";
import { CampaignDetailsPanel } from "./CampaignDetailsPanel";
import { clearAssignDraft, loadAssignDraft, saveAssignDraft } from "./assignDraftStore";
import {
  assignabilityOf,
  commercialRuleLabel,
  deriveAllocationMode,
  filterMasterCampaignRows,
  formatCampaignType,
  formatCommissionDisplay,
  formatCountries,
  formatOffer,
  formatSourceLabel,
  formatTracking,
  masterCampaignCouponCode,
  masterCampaignLinkUrl,
  parseClientsResponse,
  publishReadinessOf,
  seedClientFacing,
  toSupplierCampaignQueryFilters,
} from "./masterCampaignHelpers";

const SELECT_FILTERS = [
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
    key: "assignable",
    label: "Assignable",
    allLabel: "All",
    options: [
      { value: "true", label: "Assignable only" },
      { value: "false", label: "Not assignable" },
    ],
  },
];

function ensureConfig(draft, row) {
  const existing = draft.configs[row.id] || {};
  return {
    campaign: row,
    selectedSourceId:
      existing.selectedSourceId || row.campaignSourceId || row.primaryCampaignSourceId || null,
    clientFacing: existing.clientFacing || {},
    sources: existing.sources || row.sources || [],
    assignmentId: existing.assignmentId || null,
    createTrackingLink: existing.createTrackingLink !== false,
    trackingLinkId: existing.trackingLinkId || null,
    supplierCouponId: existing.supplierCouponId || null,
  };
}

function SelectAllCheckbox({ checked, indeterminate, onChange, title }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={title}
      title={title}
    />
  );
}

export function AssignCampaignsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = hasPermission(user, PERMISSIONS.CLIENTS_MANAGE);
  const [params, setParams] = useSearchParams();
  const step = params.get("step") || "select";
  const [draft, setDraft] = useState(() => loadAssignDraft());
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({ q: "", networkSource: "", assignable: "true" });
  const [detailId, setDetailId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [lastSavedCount, setLastSavedCount] = useState(0);

  const queryFilters = useMemo(() => toSupplierCampaignQueryFilters(filters), [filters]);
  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/supplier-campaigns",
    queryFilters,
    { pageSize: 25, enabled: step === "select" },
  );
  const filteredRows = useMemo(() => filterMasterCampaignRows(rows, filters), [rows, filters]);

  useEffect(() => {
    fetchApi("/clients", { page: 1, pageSize: 200 })
      .then((res) => setClients(parseClientsResponse(res)))
      .catch(() => setClients([]));
  }, []);

  const persist = useCallback((next) => {
    setDraft(next);
    saveAssignDraft(next);
  }, []);

  // Keep draft client in sync with URL (returning from Review, deep links).
  useEffect(() => {
    const fromUrl = params.get("clientId") || "";
    if (!fromUrl) return;
    setDraft((prev) => {
      if (prev.clientId === fromUrl) return prev;
      const next = { ...prev, clientId: fromUrl };
      saveAssignDraft(next);
      return next;
    });
  }, [params]);

  // Wizard review/publish steps are retired — Assignment Review page owns that stage.
  useEffect(() => {
    if (step !== "review" && step !== "publish") return;
    const client = draft.clientId || params.get("clientId") || "";
    navigate(
      client
        ? `/master/review?clientId=${encodeURIComponent(client)}`
        : "/master/review",
      { replace: true },
    );
  }, [step, draft.clientId, params, navigate]);

  const selectedClient = clients.find((c) => c.id === draft.clientId) || null;
  const selectedRows = useMemo(
    () => draft.campaignIds.map((id) => draft.configs[id]?.campaign).filter(Boolean),
    [draft],
  );

  // Pin selected campaigns to the top of the select table (including selections from other pages).
  const selectTableRows = useMemo(() => {
    const selectedIds = new Set(draft.campaignIds);
    const pinned = draft.campaignIds
      .map((id) => draft.configs[id]?.campaign)
      .filter(Boolean);
    const rest = (filteredRows || []).filter((row) => row?.id && !selectedIds.has(row.id));
    return [...pinned, ...rest];
  }, [draft.campaignIds, draft.configs, filteredRows]);

  const visibleRowIds = useMemo(
    () => selectTableRows.map((row) => row.id).filter(Boolean),
    [selectTableRows],
  );

  const { allVisibleSelected, someVisibleSelected, anyVisibleSelected } = useMemo(() => {
    const selectedCount = visibleRowIds.filter((id) => draft.campaignIds.includes(id)).length;
    return {
      allVisibleSelected: visibleRowIds.length > 0 && selectedCount === visibleRowIds.length,
      someVisibleSelected: selectedCount > 0 && selectedCount < visibleRowIds.length,
      anyVisibleSelected: selectedCount > 0,
    };
  }, [visibleRowIds, draft.campaignIds]);

  const selectAllVisible = useCallback(() => {
    const next = { ...draft, campaignIds: [...draft.campaignIds], configs: { ...draft.configs } };
    const existing = new Set(next.campaignIds);
    const toAdd = visibleRowIds.filter((id) => !existing.has(id));
    for (let i = toAdd.length - 1; i >= 0; i -= 1) {
      const id = toAdd[i];
      const row = selectTableRows.find((r) => r.id === id);
      if (!row) continue;
      next.campaignIds = [id, ...next.campaignIds];
      next.configs[id] = ensureConfig(next, row);
    }
    persist(next);
  }, [draft, visibleRowIds, selectTableRows, persist]);

  const deselectAllVisible = useCallback(() => {
    const visibleSet = new Set(visibleRowIds);
    persist({
      ...draft,
      campaignIds: draft.campaignIds.filter((id) => !visibleSet.has(id)),
    });
  }, [draft, visibleRowIds, persist]);

  const clearAllSelections = useCallback(() => {
    persist({ ...draft, campaignIds: [], configs: {} });
  }, [draft, persist]);

  const toggleAllVisible = useCallback(() => {
    if (allVisibleSelected) deselectAllVisible();
    else selectAllVisible();
  }, [allVisibleSelected, deselectAllVisible, selectAllVisible]);

  function patchFacing(id, patch) {
    const cfg = draft.configs[id] || {};
    patchConfig(id, {
      clientFacing: {
        ...(cfg.clientFacing || {}),
        ...patch,
      },
    });
  }

  function setStep(next) {
    const copy = new URLSearchParams(params);
    copy.set("step", next);
    setParams(copy, { replace: true });
  }

  function toggleCampaign(row) {
    const next = { ...draft, campaignIds: [...draft.campaignIds], configs: { ...draft.configs } };
    if (next.campaignIds.includes(row.id)) {
      next.campaignIds = next.campaignIds.filter((id) => id !== row.id);
    } else {
      // Newest selection first so it appears at the top of the list.
      next.campaignIds = [row.id, ...next.campaignIds];
      next.configs[row.id] = ensureConfig(next, row);
    }
    persist(next);
  }

  async function hydrateSelected() {
    const next = { ...draft, configs: { ...draft.configs } };
    await Promise.all(
      next.campaignIds.map(async (id) => {
        try {
          const res = await fetchApi(`/supplier-campaigns/${id}`, { forMaster: true });
          const campaign = res?.data ?? next.configs[id]?.campaign;
          const prior = next.configs[id] || {};
          next.configs[id] = {
            ...ensureConfig(next, campaign),
            campaign,
            sources: campaign?.sources?.length
              ? campaign.sources
              : campaign?.supplier
                ? [{ id: "", networkSource: campaign.supplier, supplier: campaign.supplier, isPrimary: true }]
                : [],
            selectedSourceId:
              prior.selectedSourceId ||
              campaign?.campaignSourceId ||
              campaign?.primaryCampaignSourceId ||
              campaign?.sources?.find((s) => s.isPrimary)?.id ||
              campaign?.sources?.[0]?.id ||
              null,
            clientFacing: seedClientFacing(campaign, prior.clientFacing || {}),
            createTrackingLink: prior.createTrackingLink !== false,
            trackingLinkId: prior.trackingLinkId || null,
            supplierCouponId: prior.supplierCouponId || null,
          };
        } catch {
          /* keep existing config */
        }
      }),
    );
    persist(next);
  }

  async function continueToConfigure() {
    await hydrateSelected();
    setStep("configure");
  }

  function patchConfig(id, patch) {
    persist({
      ...draft,
      configs: {
        ...draft.configs,
        [id]: { ...draft.configs[id], ...patch },
      },
    });
  }

  async function createOrUpdateAssignments({ publish, goToReviewStep = false, openReviewQueue = false }) {
    if (!canManage || !draft.clientId) return { okCount: 0, failed: [] };
    setBusy(true);
    setMessage("");
    const results = [];
    const nextConfigs = { ...draft.configs };
    const clientId = draft.clientId;
    try {
      for (const id of draft.campaignIds) {
        const cfg = nextConfigs[id];
        const seededFacing = seedClientFacing(cfg?.campaign, {
          ...(cfg?.clientFacing || {}),
          ...(cfg?.clientFacing?.clientCommissionPercent == null &&
          selectedClient?.clientSharePercent != null
            ? { clientCommissionPercent: selectedClient.clientSharePercent }
            : {}),
        });
        const clientFacing = seededFacing;
        const sourceId = cfg?.selectedSourceId || null;
        const body = {
          clientId,
          supplierCampaignId: id,
          ...(sourceId ? { campaignSourceId: sourceId } : {}),
          clientFacing,
          publish: false,
        };
        try {
          let assignmentId = cfg?.assignmentId;
          if (!assignmentId) {
            try {
              const created = await postApi("/client-assignments", body);
              assignmentId = created?.data?.id || created?.id;
            } catch (createErr) {
              if (createErr?.status !== 409) throw createErr;
              assignmentId =
                createErr?.details?.existingAssignmentId ||
                createErr?.existingAssignmentId ||
                null;
              if (!assignmentId) {
                const listed = await fetchApi("/client-assignments", {
                  clientId,
                  pageSize: 200,
                });
                assignmentId =
                  (listed?.data || []).find(
                    (item) =>
                      item.supplierCampaignId === id ||
                      item.campaignSourceId === sourceId ||
                      item.canonicalCampaignId === cfg?.campaign?.canonicalCampaignId,
                  )?.id || null;
              }
              if (!assignmentId) throw createErr;
              await patchApi(`/client-assignments/${assignmentId}`, {
                ...(sourceId ? { campaignSourceId: sourceId } : {}),
                clientFacing,
              });
            }
          } else {
            await patchApi(`/client-assignments/${assignmentId}`, {
              ...(sourceId ? { campaignSourceId: sourceId } : {}),
              clientFacing,
            });
          }

          let trackingLinkId = cfg?.trackingLinkId || null;
          if (assignmentId && cfg?.createTrackingLink !== false && !trackingLinkId) {
            try {
              const tracking = await postApi("/tracking-links", {
                assignmentId,
                ...(sourceId ? { campaignSourceId: sourceId } : {}),
                isPrimary: true,
              });
              trackingLinkId = tracking?.data?.id || tracking?.id || null;
            } catch {
              /* tracking may already exist or supplier URL missing — review will surface */
            }
          }

          if (assignmentId && (clientFacing.couponCode || cfg?.supplierCouponId)) {
            try {
              await postApi("/coupon-assignments", {
                assignmentId,
                ...(cfg?.supplierCouponId ? { supplierCouponId: cfg.supplierCouponId } : {}),
                ...(clientFacing.couponCode ? { clientCouponCode: clientFacing.couponCode } : {}),
              });
            } catch {
              /* duplicate coupon assignment is acceptable */
            }
          }

          const readiness = publishReadinessOf(cfg?.campaign, clientFacing, {
            selectedSourceId: sourceId,
            clientSharePercent: selectedClient?.clientSharePercent,
            hasTrackingLink: Boolean(trackingLinkId),
          });

          if (publish && assignmentId && readiness.ready) {
            await patchApi(`/client-assignments/${assignmentId}`, { lifecycle: "published" });
          }

          nextConfigs[id] = { ...cfg, assignmentId, clientFacing, trackingLinkId };
          results.push({
            id,
            ok: publish ? readiness.ready : true,
            assignmentId,
            ...(publish && !readiness.ready
              ? { message: `Missing ${readiness.missing.map((f) => f.label).join(", ")}` }
              : {}),
          });
        } catch (err) {
          results.push({ id, ok: false, message: err?.message || "Assignment failed." });
        }
      }
      persist({ ...draft, configs: nextConfigs });
      const failed = results.filter((r) => !r.ok);
      const okCount = results.length - failed.length;
      setLastSavedCount(okCount);
      setMessage(
        failed.length
          ? publish
            ? `${okCount} published. ${failed.length} still in review: ${failed.map((f) => f.message).join("; ")}`
            : `${okCount} draft(s) saved. ${failed.length} blocked: ${failed.map((f) => f.message).join("; ")}`
          : publish
            ? `${okCount} campaign(s) published to Assignments.`
            : `${okCount} draft(s) saved for Assignment Review.`,
      );
      if (publish && okCount > 0) {
        clearAssignDraft();
        setDraft(loadAssignDraft());
        navigate(`/assignments?clientId=${encodeURIComponent(clientId)}`);
      } else if ((goToReviewStep || openReviewQueue) && okCount > 0) {
        navigate(
          `/master/review?clientId=${encodeURIComponent(clientId)}&saved=${okCount}`,
        );
      }
      return { okCount, failed };
    } finally {
      setBusy(false);
    }
  }

  async function continueToReview() {
    if (!draft.clientId || !selectedRows.length) return;
    const { okCount, failed } = await createOrUpdateAssignments({
      publish: false,
      goToReviewStep: true,
    });
    if (!(okCount > 0)) {
      setMessage(
        failed?.length
          ? `Could not save drafts: ${failed.map((f) => f.message).join("; ")}`
          : "No drafts were saved. Fix blockers and try again.",
      );
    }
  }

  const selectColumns = useMemo(
    () => [
      {
        key: "select",
        label: "",
        width: 44,
        renderHeader: () => (
          <SelectAllCheckbox
            checked={allVisibleSelected}
            indeterminate={someVisibleSelected}
            onChange={toggleAllVisible}
            title={allVisibleSelected ? "Deselect all on this page" : "Select all on this page"}
          />
        ),
        render: (row) => (
          <input
            type="checkbox"
            checked={draft.campaignIds.includes(row.id)}
            onChange={() => toggleCampaign(row)}
            aria-label={`Select ${row.campaignName || row.displayName || "campaign"}`}
          />
        ),
      },
      {
        key: "brand",
        label: "Brand",
        minWidth: 150,
        render: (row) => {
          const b = brandFromRow(row);
          return <BrandIdentity name={b.name || row.brandName} logoUrl={b.logoUrl || row.brandLogoLink} />;
        },
      },
      {
        key: "campaign",
        label: "Campaign",
        minWidth: 180,
        render: (row) => displayText(row.campaignName || row.displayName),
      },
      {
        key: "type",
        label: "Type",
        render: (row) => displayText(formatCampaignType(row) || row.campaignType),
      },
      {
        key: "offer",
        label: "Customer Offer",
        render: (row) => <ExpandableText text={formatOffer(row)} showToggleLabel={false} />,
      },
      {
        key: "coupon",
        label: "Coupon",
        minWidth: 120,
        render: (row) => {
          const code = masterCampaignCouponCode(row);
          return code ? <MonoChip value={code} /> : displayText(null);
        },
      },
      {
        key: "link",
        label: "Link",
        minWidth: 180,
        render: (row) => {
          const url = masterCampaignLinkUrl(row);
          if (!url) return displayText(null);
          return <UrlCell url={url} missingLabel="—" tone="indigo" />;
        },
      },
      {
        key: "assignable",
        label: "Assignable",
        render: (row) => {
          const el = assignabilityOf(row);
          return (
            <StatusPill status={el.assignable ? "READY" : "BLOCKED"} label={el.assignable ? "Yes" : "No"} />
          );
        },
      },
      {
        key: "expiry",
        label: "Expiry",
        render: (row) =>
          displayText(
            draft.configs[row.id]?.clientFacing?.expiry || row.couponExpiry || row.campaignEndDate,
          ),
      },
      {
        key: "countries",
        label: "Countries",
        render: (row) => {
          const countries = row.countries || row.country || row.countryCodes;
          return (
            <span className="block max-w-[8rem] truncate whitespace-nowrap" title={countryListTitle(countries) || undefined}>
              {displayText(formatCountries(countries))}
            </span>
          );
        },
      },
    ],
    [draft.campaignIds, draft.configs, allVisibleSelected, someVisibleSelected, toggleAllVisible],
  );

  const configureColumns = useMemo(
    () => [
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
        render: (row) => displayText(row.campaignName || row.displayName),
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
        key: "primaryNetwork",
        label: "Primary Network",
        render: (row) => displayText(row.networkSource || row.supplier),
      },
      {
        key: "sourceId",
        label: "Source ID",
        minWidth: 120,
        render: (row) => {
          const cfg = draft.configs[row.id] || {};
          const sources = cfg.sources?.length
            ? cfg.sources
            : [
                {
                  id: row.campaignSourceId || row.primaryCampaignSourceId,
                  networkSource: row.networkSource || row.supplier,
                  isPrimary: true,
                },
              ];
          return (
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-mono text-xs"
              value={cfg.selectedSourceId || ""}
              onChange={(e) => patchConfig(row.id, { selectedSourceId: e.target.value || null })}
            >
              {sources.map((source) => (
                <option key={source.id || source.networkSource} value={source.id || ""}>
                  {row.primarySourceId || source.id || formatSourceLabel(source, { recommendedId: row.primaryCampaignSourceId })}
                </option>
              ))}
            </select>
          );
        },
      },
      {
        key: "couponSelected",
        label: "Coupon Selected",
        minWidth: 120,
        render: (row) => {
          const couponCode = masterCampaignCouponCode(row);
          return (
            <input
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono"
              value={draft.configs[row.id]?.clientFacing?.couponCode || ""}
              placeholder={couponCode || "—"}
              onChange={(e) => patchFacing(row.id, { couponCode: e.target.value || null })}
            />
          );
        },
      },
      {
        key: "allocationMode",
        label: "Allocation Mode",
        minWidth: 150,
        render: (row) => {
          const cfg = draft.configs[row.id] || {};
          const value = cfg.clientFacing?.allocationMode || deriveAllocationMode(row, cfg.clientFacing);
          return (
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
              value={value === "—" ? "New available code" : value}
              onChange={(e) => patchFacing(row.id, { allocationMode: e.target.value })}
            >
              <option value="New available code">New available code</option>
              <option value="Unique to Client">Unique to Client</option>
              <option value="Shared limited code">Shared limited code</option>
              <option value="Shared / unlimited code">Shared / unlimited code</option>
              <option value="Link only">Link only</option>
            </select>
          );
        },
      },
      {
        key: "mboTracking",
        label: "MBO Tracking Link",
        minWidth: 160,
        render: (row) => {
          const cfg = draft.configs[row.id] || {};
          const url = row.mboTrackingUrl || cfg.trackingUrl || null;
          return (
            <div className="space-y-1">
              {url ? <UrlCell url={url} missingLabel="—" tone="indigo" /> : (
                <span className="text-xs text-slate-500">{cfg.createTrackingLink !== false ? "Create on save" : formatTracking(row)}</span>
              )}
              <label className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <input
                  type="checkbox"
                  checked={cfg.createTrackingLink !== false}
                  onChange={(e) => patchConfig(row.id, { createTrackingLink: e.target.checked })}
                />
                Create tracking
              </label>
            </div>
          );
        },
      },
      {
        key: "commission",
        label: "Commission",
        minWidth: 110,
        render: (row) => {
          const override = draft.configs[row.id]?.clientFacing?.clientCommissionPercent;
          const value = override ?? selectedClient?.clientSharePercent ?? "";
          return (
            <div>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                value={value}
                placeholder={formatCommissionDisplay(row)}
                onChange={(e) => {
                  const raw = e.target.value;
                  patchFacing(row.id, {
                    clientCommissionPercent: raw === "" ? null : Number(raw),
                  });
                }}
              />
              <p className="mt-0.5 text-[10px] text-slate-500">{formatCommissionDisplay(row)}</p>
            </div>
          );
        },
      },
      {
        key: "status",
        label: "Status",
        render: (row) => {
          const cfg = draft.configs[row.id] || {};
          const r = publishReadinessOf(row, cfg.clientFacing, {
            selectedSourceId: cfg.selectedSourceId,
            clientSharePercent: selectedClient?.clientSharePercent,
            hasTrackingLink: Boolean(cfg.trackingLinkId) || cfg.createTrackingLink !== false,
          });
          return (
            <StatusPill status={r.ready ? "READY" : "NEEDS_REVIEW"} label={r.ready ? "Ready" : "Needs review"} />
          );
        },
      },
    ],
    [draft.configs, selectedClient],
  );

  const detailConfig = detailId ? draft.configs[detailId] : null;
  const incompleteCount = selectedRows.filter((row) => {
    const cfg = draft.configs[row.id] || {};
    return !publishReadinessOf(row, cfg.clientFacing, {
      selectedSourceId: cfg.selectedSourceId,
      clientSharePercent: selectedClient?.clientSharePercent,
      hasTrackingLink: Boolean(cfg.trackingLinkId) || cfg.createTrackingLink !== false,
    }).ready;
  }).length;

  function setClientId(clientId) {
    persist({ ...draft, clientId });
    const copy = new URLSearchParams(params);
    if (clientId) copy.set("clientId", clientId);
    else copy.delete("clientId");
    if (step === "configure") copy.set("step", "configure");
    setParams(copy, { replace: true });
  }

  return (
    <PageLayout
      eyebrow="Master"
      title="Assign Campaigns"
      subtitle="Select and configure campaigns, then save drafts into Assignment Review for validation and publish."
      actions={
        <div className="flex gap-2">
          <Link
            to={
              draft.clientId
                ? `/master/review?clientId=${encodeURIComponent(draft.clientId)}`
                : "/master/review"
            }
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Assignment Review
          </Link>
          {step !== "select" ? (
            <Button variant="secondary" onClick={() => setStep("select")}>
              + Add More Campaigns
            </Button>
          ) : null}
        </div>
      }
    >
      <AssignmentStepper
        current={step === "configure" ? "configure" : "select"}
        selectedCount={draft.campaignIds.length}
      />

      {message ? (
        <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      {step === "select" ? (
        <>
          <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Client</h2>
            <div className="max-w-md">
              <Select
                label="Select Client"
                value={draft.clientId}
                onChange={(e) => setClientId(e.target.value)}
                options={[
                  { value: "", label: "Choose a client" },
                  ...clients.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>
          </section>
          <FilterBar
            values={filters}
            onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onReset={() => setFilters({ q: "", networkSource: "", assignable: "true" })}
            filters={SELECT_FILTERS}
          />
          <div className="-mt-2 mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <button
              type="button"
              className="font-medium text-indigo-600 hover:text-indigo-800 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={!visibleRowIds.length || allVisibleSelected}
              onClick={selectAllVisible}
            >
              Select all on page
            </button>
            <button
              type="button"
              className="font-medium text-indigo-600 hover:text-indigo-800 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={!anyVisibleSelected}
              onClick={deselectAllVisible}
            >
              Deselect all on page
            </button>
            {draft.campaignIds.length ? (
              <button
                type="button"
                className="font-medium text-slate-600 hover:text-slate-900"
                onClick={clearAllSelections}
              >
                Clear all selections ({draft.campaignIds.length})
              </button>
            ) : null}
          </div>
          <DataTable
            columns={selectColumns}
            rows={selectTableRows}
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
            emptyDescription="Select campaigns from the master catalog to assign them to a client."
          />
          <div className="mt-4 flex items-center justify-end">
            <Button variant="primary" disabled={!draft.campaignIds.length} onClick={continueToConfigure}>
              Continue to Configure Assignment
            </Button>
          </div>
        </>
      ) : null}

      {step === "configure" ? (
        <>
          <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Client</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <Select
                label="Select Client"
                value={draft.clientId}
                onChange={(e) => setClientId(e.target.value)}
                options={[
                  { value: "", label: "Choose a client" },
                  ...clients.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
              <Select
                label="Commercial Rule"
                value={commercialRuleLabel(selectedClient)}
                onChange={() => {}}
                options={[{ value: commercialRuleLabel(selectedClient), label: commercialRuleLabel(selectedClient) }]}
              />
              <Select
                label="Status"
                value={selectedClient?.status || ""}
                onChange={() => {}}
                options={[{ value: selectedClient?.status || "", label: selectedClient?.status || "—" }]}
              />
            </div>
          </section>

          <h2 className="mb-1 text-sm font-semibold text-slate-900">Selected Campaigns</h2>
          <p className="mb-3 text-xs text-slate-500">
            Saving creates unpublished drafts and opens Assignment Review. Publish happens on that page.
          </p>
          <DataTable
            columns={configureColumns}
            rows={selectedRows}
            emptyTitle="No campaigns selected"
            emptyDescription="Go back and select master campaigns first."
            showColumnPicker
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              {incompleteCount ? `${incompleteCount} still need client-facing fields. ` : ""}
              {lastSavedCount ? `${lastSavedCount} draft(s) saved last run. ` : ""}
              Drafts appear on Assignment Review after a successful save.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep("select")}>
                Back
              </Button>
              <Button
                variant="primary"
                disabled={busy || !draft.clientId || !selectedRows.length || !canManage}
                onClick={() => continueToReview()}
              >
                {busy ? "Saving drafts…" : "Save & open Assignment Review"}
              </Button>
            </div>
          </div>
        </>
      ) : null}

      <CampaignDetailsPanel
        open={Boolean(detailConfig)}
        campaign={detailConfig?.campaign}
        clientFacing={detailConfig?.clientFacing}
        sources={detailConfig?.sources || []}
        selectedSourceId={detailConfig?.selectedSourceId}
        client={selectedClient}
        resetKey={detailId}
        canEdit={canManage}
        onClose={() => setDetailId(null)}
        onSave={(clientFacing) => {
          const campaign = draft.configs[detailId]?.campaign;
          patchConfig(detailId, { clientFacing: seedClientFacing(campaign, clientFacing) });
          setDetailId(null);
        }}
      />
    </PageLayout>
  );
}
