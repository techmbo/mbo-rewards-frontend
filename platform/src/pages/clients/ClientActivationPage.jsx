import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchApi, patchApi, postApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { Modal } from "../../components/ui/Modal";
import { BrandIdentity, brandFromRow } from "../../components/brand/BrandIdentity";
import { Drawer } from "../../components/ui/Drawer";
import { ClientModuleShell } from "./ClientModuleShell";
import { ApiKeyReveal } from "./ApiKeyReveal";
import {
  activationSummaryCounts,
  buildAssignmentActivationChecklist,
  channelLabel,
  checklistStatusLabel,
  checklistStatusTone,
  collectAssignmentBlockers,
  commercialModelLabel,
  couponPresentation,
  filterActivationAssignments,
  ledgerLifecycle,
  normalizeActivationBlocks,
  readinessPresentation,
  trackingPresentation,
} from "./activationHelpers";
import { assignmentPublishReadiness, publishAssignmentRow } from "./assignmentPublishActions";
import { useClientOpsNetworkFilter } from "./NetworkFilter";

function unwrap(res) {
  return res?.data ?? res;
}

function Field({ label, children }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <div className="mt-1 text-sm text-slate-800">{children}</div>
    </div>
  );
}

const EMPTY_FILTERS = {
  search: "",
  network: "",
  commercialModel: "",
  channel: "",
  lifecycle: "",
  trackingStatus: "",
  couponStatus: "",
  published: "",
  relationship: "",
  readiness: "",
};

/**
 * Activation Review — operations console over existing onboarding/provision/activate APIs.
 */
export function ClientActivationPage() {
  const { clientId } = useParams();
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.CLIENTS_MANAGE);

  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [blockDetails, setBlockDetails] = useState([]);
  const [revealedKey, setRevealedKey] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [opsOpen, setOpsOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [network] = useClientOpsNetworkFilter();
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    network,
  }));
  const [publishingId, setPublishingId] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setFilters((prev) => (prev.network === network ? prev : { ...prev, network }));
  }, [network]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi(`/clients/${clientId}/onboarding`);
      setOnboarding(unwrap(res));
    } catch (err) {
      setError(err?.message || "Unable to load activation state.");
      setOnboarding(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [clientId]);

  const client = onboarding?.client;
  const checklist = onboarding?.checklist || {};
  const allAssignments = useMemo(
    () => (onboarding?.assignments || []).filter((a) => String(a.status || "").toUpperCase() !== "REVOKED"),
    [onboarding],
  );
  const activationBlocks = normalizeActivationBlocks(
    onboarding?.activationBlocks,
    onboarding?.activationBlockDetails,
  );
  const apiKeys = onboarding?.apiKeys || [];
  const portalUsers = onboarding?.portalUsers || [];

  const summary = useMemo(
    () => activationSummaryCounts(allAssignments, client || {}),
    [allAssignments, client],
  );

  const assignments = useMemo(
    () => filterActivationAssignments(allAssignments, filters, client || {}),
    [allAssignments, filters, client],
  );

  const clientChecklist = useMemo(
    () => [
      {
        check: "Client profile",
        requirement: "Organisation record exists",
        done: Boolean(checklist.clientCreated ?? client?.id),
      },
      {
        check: "Agreement",
        requirement: "Signed agreement on file",
        done: Boolean(checklist.agreementSigned),
      },
      {
        check: "Commercial configuration",
        requirement: "Commercial model set (07A)",
        done: Boolean(checklist.commercialConfigured),
      },
      {
        check: "Campaign allocation",
        requirement: "At least one campaign allotted in Catalog",
        done: Boolean(checklist.campaignsAllotted),
      },
      {
        check: "Commission rules",
        requirement: "Commission rules prepared for allotments",
        done: Boolean(checklist.commissionRulesPrepared),
      },
      {
        check: "Tracking readiness",
        requirement: "MBO tracking links where required",
        done: Boolean(checklist.trackingLinksGenerated),
      },
      {
        check: "Published campaigns",
        requirement: "≥1 assignment published (provision gates)",
        done: Boolean(checklist.assignmentsPublished),
      },
      {
        check: "Production API",
        requirement: checklist.needsApi === false
          ? "Not required (Portal Only delivery)"
          : "Production API key issued",
        done: checklist.needsApi === false ? true : Boolean(checklist.apiKeyIssued),
      },
      {
        check: "Sandbox API",
        requirement: checklist.needsApi === false
          ? "Not required"
          : "Sandbox key recommended for integration testing",
        done: checklist.needsApi === false ? true : Boolean(checklist.sandboxConfigured),
      },
      {
        check: "Portal login",
        requirement: checklist.needsPortal === false
          ? "Not required (API Only delivery)"
          : "Portal administrator required",
        done: checklist.needsPortal === false ? true : Boolean(checklist.administratorConfigured),
      },
      {
        check: "Client activated",
        requirement: "Client status ACTIVE",
        done: Boolean(checklist.activated),
      },
    ],
    [checklist, client],
  );

  async function publishAssignment(row) {
    if (!canManage || !row?.id || row.published) return;
    setPublishingId(row.id);
    setMessage("");
    try {
      await publishAssignmentRow(row, { patchApi, postApi });
      setMessage(`Published "${row.canonicalCampaign?.displayName || "assignment"}".`);
      await load();
    } catch (err) {
      setMessage(err?.message || "Publish failed.");
    } finally {
      setPublishingId(null);
    }
  }

  async function runProvision() {
    if (!canManage) return;
    setBusy(true);
    setMessage("");
    setBlockDetails([]);
    setSuccessInfo(null);
    try {
      const res = await postApi(`/clients/${clientId}/onboarding/provision`);
      const data = unwrap(res);
      const results = data?.provisionResults;
      const pending = results?.trackingPending?.length || 0;
      const failed = results?.failures?.length || 0;
      const ok = results?.provisioned?.length || 0;
      setMessage(`Provision complete: ${ok} published, ${pending} tracking pending, ${failed} blocked.`);
      if (Array.isArray(results?.failures) && results.failures.length) {
        setBlockDetails(
          results.failures.map((f) => ({
            code: f.code || "PROVISION_FAILED",
            message: f.message || String(f),
            severity: "blocked",
          })),
        );
      }
      if (data?.newApiCredential?.apiKey) {
        setRevealedKey({
          apiKey: data.newApiCredential.apiKey,
          warning: "API key created during provision. Copy now — it will not be shown again.",
        });
      }
      await load();
    } catch (err) {
      setMessage(err?.message || "Provisioning failed.");
      setBlockDetails(
        normalizeActivationBlocks(
          err?.details?.activationBlocks,
          err?.details?.activationBlockDetails,
        ).length
          ? normalizeActivationBlocks(
              err?.details?.activationBlocks,
              err?.details?.activationBlockDetails,
            )
          : [{ code: "PROVISION_FAILED", message: err?.message || "Provisioning failed.", severity: "blocked" }],
      );
    } finally {
      setBusy(false);
    }
  }

  async function runActivate() {
    if (!canManage) return;
    setBusy(true);
    setMessage("");
    setBlockDetails([]);
    setSuccessInfo(null);
    try {
      const res = await postApi(`/clients/${clientId}/onboarding/activate`);
      const data = unwrap(res);
      setConfirmOpen(false);
      setMessage("Client activated successfully.");
      setSuccessInfo({
        clientStatus: data?.client?.status || data?.checklist?.activated ? "ACTIVE" : null,
        published: data?.checklist?.assignmentsPublished,
        provisioned: data?.checklist?.provisioned,
        note: "Published campaigns remain gated by Client API visibility (published + ACTIVE + usable asset).",
      });
      await load();
    } catch (err) {
      const structured = normalizeActivationBlocks(
        err?.details?.activationBlocks,
        err?.details?.activationBlockDetails,
      );
      setMessage("Activation blocked");
      setBlockDetails(
        structured.length
          ? structured
          : activationBlocks.length
            ? activationBlocks
            : [{ code: "ACTIVATION_BLOCKED", message: err?.message || "Activation blocked.", severity: "blocked" }],
      );
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function issueApiKey() {
    if (!canManage) return;
    setBusy(true);
    try {
      const res = await postApi(`/clients/${clientId}/api-keys`, {
        name: "Production",
        environment: "PRODUCTION",
      });
      const data = unwrap(res);
      const key = data?.apiKey || data?.credential?.apiKey || null;
      setRevealedKey(key ? { apiKey: key } : null);
      await load();
    } catch (err) {
      setMessage(err?.message || "API key creation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function addPortalUser(e) {
    e.preventDefault();
    if (!canManage) return;
    if (inviteForm.password !== inviteForm.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await postApi(`/clients/${clientId}/portal-users`, {
        email: inviteForm.email.trim(),
        name: inviteForm.name.trim() || null,
        password: inviteForm.password,
      });
      setInviteForm({ email: "", name: "", password: "", confirmPassword: "" });
      setMessage("Portal user added.");
      await load();
    } catch (err) {
      setMessage(err?.message || "Portal user creation failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <ClientModuleShell active="activation" title="Activation Review" subtitle="Loading…">
        <p className="text-sm text-slate-500">Loading activation state…</p>
      </ClientModuleShell>
    );
  }

  if (error || !client) {
    return (
      <ClientModuleShell active="activation" title="Activation Review" subtitle="Error">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
          <span>{error || "Client not found."}</span>
          <Button type="button" onClick={() => load()}>
            Retry
          </Button>
        </div>
      </ClientModuleShell>
    );
  }

  const detailChecks = detail ? buildAssignmentActivationChecklist(detail, client) : [];
  const detailBlockers = detail ? collectAssignmentBlockers(detail, client) : [];
  const detailLife = detail ? ledgerLifecycle(detail) : null;

  return (
    <ClientModuleShell
      client={client}
      active="activation"
      title="Activation Review"
      subtitle="Final go-live checks. Requirements change with Delivery Method (API Only / Portal Only / API + Portal)."
      actions={
        canManage ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={busy} onClick={runProvision}>
              Run provision
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={busy || checklist.activated}
              onClick={() => setConfirmOpen(true)}
            >
              {checklist.activated ? "Client already active" : "Activate client"}
            </Button>
          </div>
        ) : null
      }
    >
      <p className="mb-3 text-[11px] text-slate-500">
        Progress: Assigned → Commission ready → Tracking/Coupon ready → Provisioned → Published → Client visible.
        Client activation (status ACTIVE) is separate from per-assignment client visibility.
      </p>

      <div className="mb-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Assigned", summary.totalAssigned],
          ["In progress", summary.readyForActivation],
          ["Needs review", summary.needsReview],
          ["Blocked", summary.blocked],
          ["Provisioned", summary.provisioned],
          ["Client visible", summary.clientVisible],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
            <strong className="mt-1 block text-lg tabular-nums text-slate-900">{value}</strong>
          </div>
        ))}
      </div>
      <p className="mb-4 text-[10px] text-slate-400">
        Counts are for this client&apos;s loaded assignments (up to 200 from onboarding API) — not a global DB total.
      </p>

      {message ? (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            blockDetails.length || /blocked|failed/i.test(message)
              ? "border-rose-200 bg-rose-50 text-rose-900"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          <p className="font-semibold">{message}</p>
          {successInfo ? (
            <ul className="mt-2 space-y-1 text-xs">
              <li>Client status: {successInfo.clientStatus || "—"}</li>
              <li>Published campaigns gate: {successInfo.published ? "Yes" : "No"}</li>
              <li>Provisioned gate: {successInfo.provisioned ? "Yes" : "No"}</li>
              <li>{successInfo.note}</li>
            </ul>
          ) : null}
          {blockDetails.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              {blockDetails.map((b) => (
                <li key={`${b.code}-${b.message}`}>
                  <span className="font-semibold">{b.code}</span> — {b.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {activationBlocks.length && !checklist.activated ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">Still required before client activation</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            {activationBlocks.map((item) => (
              <li key={`${item.code}-${item.message}`}>
                <span className="font-mono text-[10px]">{item.code}</span> — {item.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Client go-live checklist</h2>
          <p className="text-xs text-slate-500">Backend checklist from onboarding state — not a second engine.</p>
        </div>
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase text-slate-400">
              <th className="px-3 py-2">Check</th>
              <th className="px-3 py-2">Requirement</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {clientChecklist.map((row) => (
              <tr key={row.check} className="border-t border-slate-100">
                <td className="px-3 py-3 font-medium text-slate-800">{row.check}</td>
                <td className="px-3 py-3 text-slate-500">{row.requirement}</td>
                <td className="px-3 py-3">
                  <StatusPill
                    status={row.done ? "ACTIVE" : "PENDING"}
                    label={row.done ? "Complete" : "Pending"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-3 grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <input
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          placeholder="Search brand or campaign"
          value={filters.search}
          onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
        />
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          value={filters.commercialModel}
          onChange={(e) => setFilters((p) => ({ ...p, commercialModel: e.target.value }))}
        >
          <option value="">Commercial model</option>
          <option value="CPS">CPS</option>
          <option value="CPA">CPA</option>
          <option value="CPL">CPL</option>
          <option value="CPI">CPI</option>
        </select>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          value={filters.channel}
          onChange={(e) => setFilters((p) => ({ ...p, channel: e.target.value }))}
        >
          <option value="">Channel</option>
          <option value="LINK">Link</option>
          <option value="COUPON">Coupon</option>
          <option value="DEEPLINK">Deeplink</option>
          <option value="COUPON_LINK">Link + Coupon</option>
        </select>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          value={filters.readiness}
          onChange={(e) => setFilters((p) => ({ ...p, readiness: e.target.value }))}
        >
          <option value="">Readiness</option>
          <option value="BLOCKED">Blocked</option>
          <option value="NEEDS_REVIEW">Needs review</option>
          <option value="PENDING">Pending</option>
          <option value="PROVISIONED">Provisioned</option>
          <option value="CLIENT_VISIBLE">Client visible</option>
        </select>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          value={filters.lifecycle}
          onChange={(e) => setFilters((p) => ({ ...p, lifecycle: e.target.value }))}
        >
          <option value="">Assignment status</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="COMMISSION_READY">Commission ready</option>
          <option value="TRACKING_READY">Tracking ready</option>
          <option value="PROVISIONED">Provisioned</option>
          <option value="CLIENT_VISIBLE">Client visible</option>
          <option value="PAUSED">Paused</option>
        </select>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          value={filters.trackingStatus}
          onChange={(e) => setFilters((p) => ({ ...p, trackingStatus: e.target.value }))}
        >
          <option value="">Tracking</option>
          <option value="READY">Ready</option>
          <option value="PENDING">Pending</option>
          <option value="MISSING">Missing</option>
        </select>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          value={filters.couponStatus}
          onChange={(e) => setFilters((p) => ({ ...p, couponStatus: e.target.value }))}
        >
          <option value="">Coupon</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="NOT_AVAILABLE">Not available</option>
        </select>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          value={filters.published}
          onChange={(e) => setFilters((p) => ({ ...p, published: e.target.value }))}
        >
          <option value="">Published</option>
          <option value="true">Published</option>
          <option value="false">Not published</option>
        </select>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          value={filters.relationship}
          onChange={(e) => setFilters((p) => ({ ...p, relationship: e.target.value }))}
        >
          <option value="">Relationship</option>
          <option value="JOINED">Joined</option>
          <option value="NOT_JOINED">Not joined</option>
          <option value="PENDING">Pending</option>
          <option value="NEEDS_REVIEW">Needs review</option>
        </select>
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
          onClick={() => setFilters(EMPTY_FILTERS)}
        >
          Clear filters
        </button>
      </div>
      <p className="mb-3 text-[10px] text-slate-400">
        Filters apply to this client&apos;s loaded assignment list (onboarding payload). Not a global search API.
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Assignment activation</h2>
            <p className="text-xs text-slate-500">
              Allotted ≠ published ≠ client-visible.{" "}
              <Link className="text-blue-600" to={`/clients/${clientId}/catalog`}>
                Open catalog
              </Link>
            </p>
          </div>
        </div>
        <table className="w-full min-w-[1200px] border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
              <th className="px-3 py-2.5">Brand</th>
              <th className="px-3 py-2.5">Campaign</th>
              <th className="px-3 py-2.5">Network</th>
              <th className="px-3 py-2.5">Commercial</th>
              <th className="px-3 py-2.5">Channel</th>
              <th className="px-3 py-2.5">Assignment</th>
              <th className="px-3 py-2.5">Commission</th>
              <th className="px-3 py-2.5">Tracking</th>
              <th className="px-3 py-2.5">Coupon</th>
              <th className="px-3 py-2.5">Readiness</th>
              <th className="px-3 py-2.5">Published</th>
              <th className="px-3 py-2.5">Action</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-3 py-10 text-center text-slate-400">
                  {allAssignments.length === 0
                    ? "No assignments. Allot campaigns in Client Catalog first."
                    : "No assignments match the current filters."}
                </td>
              </tr>
            ) : (
              assignments.map((row) => {
                const life = ledgerLifecycle(row);
                const ready = readinessPresentation(row, client);
                const brand = brandFromRow(row);
                const tracking = trackingPresentation(row);
                const coupon = couponPresentation(row);
                return (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/90"
                    onClick={() => {
                      setDetail(row);
                      setOpsOpen(false);
                    }}
                  >
                    <td className="px-3 py-3">
                      <BrandIdentity
                        name={brand.name || row.brandName}
                        logoUrl={brand.logoUrl || row.brandLogoLink}
                      />
                    </td>
                    <td className="max-w-[160px] px-3 py-3 font-medium text-slate-800">
                      {row.canonicalCampaign?.displayName || "—"}
                    </td>
                    <td className="px-3 py-3">{row.networkSource || "—"}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-md border border-slate-200 px-2 py-0.5 font-semibold">
                        {commercialModelLabel(row)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 font-semibold text-blue-800">
                        {channelLabel(row)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill status={life.code} label={life.label} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill
                        status={row.commissionRuleStatus}
                        label={row.commissionRuleStatus || "Not available"}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill status={tracking.code} label={tracking.label} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill status={coupon.code} label={coupon.label} />
                    </td>
                    <td className="max-w-[150px] px-3 py-3">
                      <StatusPill status={ready.code} label={ready.label} />
                      {ready.primary?.explanation || ready.primary?.label ? (
                        <p className="mt-1 line-clamp-2 text-[10px] text-rose-600">
                          {ready.primary.explanation || ready.primary.label}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      {row.published ? (
                        <StatusPill status="PUBLISHED" label="Published" />
                      ) : (
                        <StatusPill status="NOT_AVAILABLE" label="Not published" />
                      )}
                    </td>
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold"
                          onClick={() => {
                            setDetail(row);
                            setOpsOpen(false);
                          }}
                        >
                          Review
                        </button>
                        {canManage && !row.published && assignmentPublishReadiness(row).ready ? (
                          <button
                            type="button"
                            disabled={busy || publishingId === row.id}
                            className="rounded-lg border border-slate-900 bg-slate-900 px-2.5 py-1.5 text-[10px] font-semibold text-white disabled:opacity-50"
                            onClick={() => publishAssignment(row)}
                          >
                            {publishingId === row.id ? "Publishing…" : "Publish"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold">Portal users</h2>
          <p className="mt-1 text-xs text-slate-500">Separate from API keys.</p>
          <ul className="mt-3 space-y-2 text-xs">
            {portalUsers.map((u) => (
              <li key={u.id || u.email} className="rounded-lg border border-slate-100 px-3 py-2">
                {u.name || "User"} · {u.email}
              </li>
            ))}
            {!portalUsers.length ? <li className="text-slate-400">None yet</li> : null}
          </ul>
          {canManage ? (
            <form onSubmit={addPortalUser} className="mt-3 grid gap-2">
              <Input
                placeholder="Name"
                value={inviteForm.name}
                onChange={(e) => setInviteForm((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                type="email"
                required
                placeholder="Email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
              />
              <Input
                type="password"
                required
                placeholder="Temporary password"
                value={inviteForm.password}
                onChange={(e) => setInviteForm((p) => ({ ...p, password: e.target.value }))}
              />
              <Input
                type="password"
                required
                placeholder="Confirm password"
                value={inviteForm.confirmPassword}
                onChange={(e) => setInviteForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              />
              <Button type="submit" disabled={busy}>
                Add portal user
              </Button>
            </form>
          ) : null}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold">API handover</h2>
          <p className="mt-1 text-xs text-slate-500">Generate internally; never show key hash in UI.</p>
          <dl className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-100 py-2">
              <dt className="text-slate-500">API key status</dt>
              <dd>{checklist.apiKeyIssued ? "Configured" : "Not created"}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-2">
              <dt className="text-slate-500">Active keys</dt>
              <dd>{apiKeys.filter((k) => !k.revokedAt).length}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-2">
              <dt className="text-slate-500">Assignments</dt>
              <dd>{allAssignments.length}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-slate-500">Published</dt>
              <dd>{allAssignments.filter((a) => a.published).length}</dd>
            </div>
          </dl>
          {revealedKey?.apiKey ? (
            <div className="mt-3">
              <ApiKeyReveal apiKey={revealedKey.apiKey} warning={revealedKey.warning} />
            </div>
          ) : null}
          {canManage ? (
            <Button className="mt-3" type="button" disabled={busy} onClick={issueApiKey}>
              Generate API key internally
            </Button>
          ) : null}
        </section>
      </div>

      <Modal open={confirmOpen} title="Activate client" onClose={() => setConfirmOpen(false)}>
        <div className="space-y-3 text-sm">
          <p>
            Activate <strong>{client.name}</strong>? Backend will re-validate commercial configuration, published
            campaigns, provisioning, and API key gates.
          </p>
          <ul className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <li>Country: {client.country || "—"}</li>
            <li>Currency: {client.currency || "—"}</li>
            <li>Commercial: {client.commercialModel || "Not configured"}</li>
            <li>Published assignments: {allAssignments.filter((a) => a.published).length}</li>
            <li>Client-visible assignments (projection): {summary.clientVisible}</li>
          </ul>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            Activating the client does not invent tracking or commission. Unpublished assignments stay unpublished.
            Client API visibility still requires the P0 published + asset contract.
          </p>
          {activationBlocks.length ? (
            <ul className="list-disc pl-5 text-xs text-rose-700">
              {activationBlocks.map((b) => (
                <li key={`${b.code}-${b.message}`}>
                  {b.code}: {b.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-700">Checklist looks ready — backend will still enforce gates.</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" disabled={busy} onClick={runActivate}>
              Confirm & activate
            </Button>
          </div>
        </div>
      </Modal>

      <Drawer
        open={Boolean(detail)}
        title="Activation assignment detail"
        width="max-w-2xl"
        onClose={() => {
          setDetail(null);
          setOpsOpen(false);
        }}
      >
        {detail ? (
          <div className="space-y-4 text-xs">
            <section className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Overview</h3>
              <BrandIdentity
                name={brandFromRow(detail).name || detail.brandName}
                logoUrl={brandFromRow(detail).logoUrl || detail.brandLogoLink}
                size="md"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Campaign">{detail.canonicalCampaign?.displayName || "—"}</Field>
                <Field label="Network">{detail.networkSource || "—"}</Field>
                <Field label="Commercial model">{commercialModelLabel(detail)}</Field>
                <Field label="Channel">{channelLabel(detail)}</Field>
                <Field label="Client country">{client.country || "—"}</Field>
                <Field label="Client currency">{client.currency || "—"}</Field>
                <Field label="Campaign countries">
                  {(detail.campaignCountries || []).length
                    ? detail.campaignCountries.join(", ")
                    : "—"}
                </Field>
                <Field label="Campaign currency">{detail.campaignCurrency || "—"}</Field>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Assignment</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Assignment status">
                  <StatusPill status={detailLife.code} label={detailLife.label} />
                </Field>
                <Field label="Published">{detail.published ? "Yes" : "No"}</Field>
                <Field label="Client visible">{detailLife.clientVisible ? "Yes" : "No"}</Field>
                <Field label="DB status">{detail.status || "—"}</Field>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Commercial</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Client commercial model">
                  {detail.clientCommercialModel || client.commercialModel || "Not configured"}
                </Field>
                <Field label="Client share (estimate)">
                  {detail.clientSharePercent != null
                    ? `${detail.clientSharePercent}%`
                    : client.clientSharePercent != null
                      ? `${client.clientSharePercent}%`
                      : "—"}
                </Field>
                <Field label="Commission rule status">
                  {detail.commissionRuleStatus || "Not available"}
                </Field>
                <Field label="Commission rule type">{detail.commissionType || "—"}</Field>
              </div>
              <p className="text-[10px] text-slate-400">
                Client share is not supplier receivable or MBO margin.
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

            <section className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Activation checklist
              </h3>
              <ul className="space-y-2">
                {detailChecks.map((c) => (
                  <li key={c.code} className="rounded-lg border border-slate-100 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">{c.label}</span>
                      <StatusPill
                        status={checklistStatusTone(c.status)}
                        label={checklistStatusLabel(c.status)}
                      />
                    </div>
                    {c.explanation ? (
                      <p className="mt-1 text-[11px] text-slate-500">{c.explanation}</p>
                    ) : null}
                    {c.source ? (
                      <p className="mt-0.5 font-mono text-[10px] text-slate-400">{c.source}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            {detailBlockers.length ? (
              <section className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Blockers</h3>
                <ul className="space-y-2">
                  {detailBlockers.map((b) => (
                    <li
                      key={b.code}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900"
                    >
                      <strong>{b.label}</strong>
                      {b.explanation ? <p className="mt-1 text-[11px]">{b.explanation}</p> : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {canManage && detail && !detail.published && assignmentPublishReadiness(detail).ready ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="primary"
                  disabled={busy || publishingId === detail.id}
                  onClick={() => publishAssignment(detail)}
                >
                  {publishingId === detail.id ? "Publishing…" : "Publish assignment"}
                </Button>
              </div>
            ) : null}

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
    </ClientModuleShell>
  );
}
