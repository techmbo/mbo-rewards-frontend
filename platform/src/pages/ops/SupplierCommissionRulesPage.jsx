import { useMemo, useState } from "react";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { postApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { StatusPill } from "../../components/ui/StatusPill";
import {
  NetworkCampaignFilterBar,
  NETWORK_CAMPAIGN_EMPTY_FILTERS,
  updateNetworkCampaignFilter,
} from "../../components/ops/NetworkCampaignFilterBar";
import { buildSharedNetworkQuery } from "./networkCampaignFilters";
import { displayText } from "../../utils/display";
import { formatDateShort } from "../helpers";
import { SUPPLIER_COMMISSION_RULE_COLUMNS } from "./networkFieldCatalog";

function HeaderCell({ label, technical }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-slate-700">
        {label}
      </span>
      <span className="whitespace-nowrap font-mono text-[10px] font-normal normal-case tracking-normal text-slate-400">
        {technical}
      </span>
    </span>
  );
}

/**
 * Network Operations — Supplier Commission Rules registry (CSV Commission Rules entity).
 * Separate from client /commission-rules commercial splits.
 */
export function SupplierCommissionRulesPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.COMMISSION_MANAGE);
  const [filters, setFilters] = useState(NETWORK_CAMPAIGN_EMPTY_FILTERS);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const queryFilters = useMemo(() => buildSharedNetworkQuery(filters), [filters]);

  const { rows, loading, error, reload, page, setPage, pagination } = usePagedQuery(
    "/ops/admin/supplier-commission-rules",
    queryFilters,
    { pageSize: 25 },
  );

  async function addTestRule() {
    if (!canManage) return;
    setBusy(true);
    setMsg("");
    try {
      await postApi("/ops/admin/supplier-commission-rules/test", {
        networkSource: filters.network || "IMPACT",
        brandName: "Test Brand",
        campaignName: "Test Campaign CPS",
        commissionType: "PERCENT",
        ratePercent: 5,
        currency: "USD",
        customerType: "New Customer",
        categoryProductGoal: "All Products",
      });
      setMsg("Test rule created.");
      await reload();
    } catch (err) {
      setMsg(err.message || "Failed to create test rule");
    } finally {
      setBusy(false);
    }
  }

  const columns = useMemo(
    () =>
      SUPPLIER_COMMISSION_RULE_COLUMNS.map((col) => ({
        key: col.key,
        label: <HeaderCell label={col.label} technical={col.technical} />,
        minWidth: 120,
        render: (row) => {
          if (col.key === "ruleStatus" || col.key === "mappingStatus" || col.key === "fieldMappingOutcome") {
            return row[col.key] != null ? <StatusPill status={row[col.key]} /> : "—";
          }
          if (col.key === "effectiveFrom" || col.key === "effectiveUntil") {
            return formatDateShort(row[col.key]) || "—";
          }
          if (col.key === "networkSource") {
            return displayText(row.networkSource);
          }
          return (
            <span className="block max-w-[200px] truncate" title={displayText(row[col.key])}>
              {displayText(row[col.key])}
            </span>
          );
        },
      })),
    [],
  );

  return (
    <PageLayout
      title="Supplier Commission Rules"
      subtitle="One row per supplier/network commission rule. Campaign Commission stays a summary only; detailed payout rules remain separate records and are never used as a single grouped asset."
      actions={
        canManage ? (
          <Button variant="primary" disabled={busy} onClick={addTestRule}>
            + Add Test Rule
          </Button>
        ) : null
      }
    >
      <div className="mb-4">
        <NetworkCampaignFilterBar
          values={filters}
          onChange={(key, value) => setFilters((prev) => updateNetworkCampaignFilter(prev, key, value))}
          onReset={() => setFilters(NETWORK_CAMPAIGN_EMPTY_FILTERS)}
          excludeKeys={["recordType", "sourceStatus", "issue", "preset"]}
        />
      </div>

      {msg ? <p className="mb-3 text-sm text-slate-600">{msg}</p> : null}
      {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Supplier Commission Rule Registry</h2>
          <Badge variant="purple" className="text-[10px]">
            Admin Only
          </Badge>
        </div>
        <div className="p-3">
          <DataTable
            columns={columns}
            rows={rows}
            loading={loading}
            showColumnPicker={false}
            onRefresh={reload}
            page={page}
            totalPages={pagination?.totalPages}
            total={pagination?.total}
            pageSize={pagination?.pageSize}
            onPageChange={setPage}
            emptyTitle="No supplier commission rules"
            emptyDescription="No SupplierCommissionRule rows or campaign commission summaries were found."
          />
        </div>
        <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-700">
          <div className="rounded-lg border-l-4 border-sky-500 bg-sky-50 px-3 py-2">
            <strong>MBO rule:</strong> final client payable commission must be based on the{" "}
            <strong>Network Final Actual Commission</strong> and the approved client commission rule.
            Do not calculate payout from &quot;Up to&quot; or campaign summary text.
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
