import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchApi, postApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { displayText } from "../../utils/display";
import { loadAssignDraft, saveAssignDraft } from "./assignDraftStore";
import { formatCouponScope, parseClientsResponse, recommendedAlertAction } from "./masterCampaignHelpers";

export function NewCodeAlertsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canWrite = hasPermission(user, PERMISSIONS.COUPONS_WRITE);
  const canAssign = hasPermission(user, PERMISSIONS.CLIENTS_MANAGE);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");
  const [clients, setClients] = useState([]);
  const [assignClientId, setAssignClientId] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/admin/coupons/pool",
    { newCodeAlert: "true" },
    { pageSize: 25 },
  );

  useEffect(() => {
    fetchApi("/clients", { page: 1, pageSize: 200 })
      .then((res) => setClients(parseClientsResponse(res)))
      .catch(() => setClients([]));
  }, []);

  async function review(id) {
    setBusyId(id);
    setMessage("");
    try {
      await postApi(`/admin/coupons/pool/${id}/review-alert`, {});
      await reload();
      setMessage("Marked as reviewed.");
    } catch (err) {
      setMessage(err?.message || "Review failed.");
    } finally {
      setBusyId(null);
    }
  }

  function addCouponToAssignDraft(row) {
    const draft = loadAssignDraft();
    const campaignKey = row.supplierCampaignRowId || row.supplierCampaignId || row.campaignId;
    if (campaignKey) {
      if (!draft.campaignIds.includes(campaignKey)) {
        draft.campaignIds = [campaignKey, ...draft.campaignIds];
      }
      draft.configs[campaignKey] = {
        ...(draft.configs[campaignKey] || {}),
        campaign: {
          ...(draft.configs[campaignKey]?.campaign || {}),
          id: campaignKey,
          campaignName: row.campaignName || row.campaign,
          couponCode: row.couponCode,
          networkSource: row.supplier || row.network,
        },
        clientFacing: {
          ...(draft.configs[campaignKey]?.clientFacing || {}),
          couponCode: row.couponCode,
        },
        supplierCouponId: row.supplierCouponId || row.id,
        createTrackingLink: true,
      };
      saveAssignDraft(draft);
    }
    navigate("/master/assign?step=configure");
  }

  async function assignCouponToClient() {
    if (!canAssign || !selectedCoupon || !assignClientId) return;
    setBusyId(selectedCoupon.id);
    setMessage("");
    try {
      const listed = await fetchApi("/client-assignments", {
        clientId: assignClientId,
        pageSize: 100,
      });
      const match =
        (listed?.data || []).find(
          (item) =>
            item.supplierCampaignId === selectedCoupon.supplierCampaignRowId ||
            item.supplierCampaignId === selectedCoupon.supplierCampaignId ||
            String(item.clientFacing?.couponCode || "").toUpperCase() ===
              String(selectedCoupon.couponCode || "").toUpperCase() ||
            String(item.canonicalCampaign?.displayName || "")
              .toLowerCase()
              .includes(String(selectedCoupon.campaignName || "").toLowerCase()),
        ) || null;

      if (!match?.id) {
        setMessage(
          "No existing assignment for this client/campaign. Use “Add to assign draft” to create one first.",
        );
        return;
      }

      await postApi("/coupon-assignments", {
        assignmentId: match.id,
        supplierCouponId: selectedCoupon.supplierCouponId || undefined,
        clientCouponCode: selectedCoupon.couponCode,
      });
      await postApi(`/admin/coupons/pool/${selectedCoupon.id}/review-alert`, {});
      setSelectedCoupon(null);
      setAssignClientId("");
      await reload();
      setMessage(`Coupon ${selectedCoupon.couponCode} assigned to client assignment and marked reviewed.`);
    } catch (err) {
      setMessage(err?.message || "Coupon assignment failed.");
    } finally {
      setBusyId(null);
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "brand",
        label: "Brand",
        render: (row) => displayText(row.brandName || row.brand),
      },
      {
        key: "campaign",
        label: "Campaign",
        render: (row) => displayText(row.campaignName || row.campaign || row.supplierCampaignId),
      },
      {
        key: "network",
        label: "Network",
        render: (row) => displayText(row.supplier || row.network),
      },
      {
        key: "sourceId",
        label: "Source ID",
        render: (row) => (
          <span className="font-mono text-xs">{displayText(row.campaignSourceId || row.campaignSource || row.supplierCampaignId)}</span>
        ),
      },
      {
        key: "newCoupon",
        label: "New Coupon",
        render: (row) => <span className="font-medium">{displayText(row.couponCode)}</span>,
      },
      {
        key: "scope",
        label: "Scope",
        render: (row) => displayText(formatCouponScope(row.scope)),
      },
      {
        key: "shared",
        label: "Shared/Reused Assignments",
        render: (row) =>
          displayText(
            row.sharedReusedAssignments ?? row.assignedQuantity ?? null,
          ),
      },
      {
        key: "recommended",
        label: "Recommended Action",
        minWidth: 180,
        render: (row) => displayText(recommendedAlertAction(row)),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => (
          <StatusPill
            status={row.newCodeAlert ? "OPEN" : row.status}
            label={row.newCodeAlert ? "Open" : row.status || "—"}
          />
        ),
      },
      {
        key: "actions",
        label: "Action",
        render: (row) => (
          <div className="flex flex-wrap gap-2">
            {canWrite ? (
              <Button size="sm" disabled={busyId === row.id} onClick={() => review(row.id)}>
                Mark reviewed
              </Button>
            ) : null}
            <Button size="sm" variant="secondary" onClick={() => addCouponToAssignDraft(row)}>
              Add to assign draft
            </Button>
            {canAssign ? (
              <Button size="sm" variant="secondary" onClick={() => setSelectedCoupon(row)}>
                Assign to client
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [busyId, canAssign, canWrite],
  );

  return (
    <PageLayout
      eyebrow="Master"
      title="New Code Alerts"
      subtitle="New coupon codes from network syncs. Review them, attach to an assignment draft, or assign onto an existing client campaign."
      actions={
        <Link
          to="/master/assign"
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Assign Campaigns
        </Link>
      }
    >
      {message ? (
        <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      {selectedCoupon ? (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
          <div>
            <p className="text-xs font-semibold uppercase text-indigo-700">Assign coupon</p>
            <p className="text-sm font-medium text-slate-900">{selectedCoupon.couponCode}</p>
            <p className="text-xs text-slate-600">{displayText(selectedCoupon.campaignName)}</p>
          </div>
          <Select
            label="Client"
            value={assignClientId}
            onChange={(e) => setAssignClientId(e.target.value)}
            options={[
              { value: "", label: "Choose a client" },
              ...clients.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <Button
            variant="primary"
            disabled={!assignClientId || busyId === selectedCoupon.id}
            onClick={assignCouponToClient}
          >
            Confirm assign
          </Button>
          <Button variant="secondary" onClick={() => setSelectedCoupon(null)}>
            Cancel
          </Button>
        </div>
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
        pageSize={pagination.pageSize}
        onPageChange={setPage}
        emptyTitle="No new code alerts"
        emptyDescription="Alerts appear here when a newly detected coupon code still needs review."
      />
    </PageLayout>
  );
}
