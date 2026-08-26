import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApi } from "../../api";
import { buildCacheKey, readCacheEntry } from "../../apiCache";
import { canViewCommission, hasPermission, PERMISSIONS } from "../../auth/permissions";
import { useAuth } from "../../context/AuthContext";
import { PageLayout } from "../../components/layout/PageLayout";
import { StatCard } from "../../components/ui/Card";
import { Card } from "../../components/ui/Card";
import { BarChart } from "../../components/ui/Chart";
import { AuditTimeline } from "../../components/ui/AuditTimeline";
import { ErrorState } from "../../components/ui/ErrorState";
import { PermissionGate } from "../../components/ui/PermissionGate";
import { extractTotal } from "../helpers";
import { formatCommission } from "../../utils/commissionDisplay";

function sumCommission(rows, key) {
  return rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
}

function dailyClicksFromReports(rows) {
  return (rows || []).map((row) => ({
    reportDate: row.reportDate,
    clickCount: Number(row.clickCount) || 0,
  }));
}

const SOURCE_LAYER_LINKS = {
  campaign: "/ops/network/all-data",
  commission: "/ops/network/supplier-commission-rules",
  coupon: "/ops/network/coupon-pool",
  link: "/tracking-links",
  offer: "/ops/network/all-data",
  product: "/ops/products",
  performance: "/ops/admin/performance",
  order: "/ops/admin/orders",
  payment: "/ops/admin/payment-status",
};

function DataFlowDiagram({ stages = [] }) {
  if (!stages.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
      {stages.map((stage, index) => (
        <span key={stage.key} className="flex items-center gap-2">
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-800">
            {stage.label}
          </span>
          {index < stages.length - 1 ? <span className="text-slate-400">→</span> : null}
        </span>
      ))}
    </div>
  );
}

function readDashboardCache() {
  const opsDash = readCacheEntry(buildCacheKey("/ops/network/dashboard"))?.data;
  const reports = readCacheEntry(buildCacheKey("/reports/daily", { page: 1, pageSize: 30 }))?.data;
  const logs = readCacheEntry(buildCacheKey("/logs/access", { page: 1, pageSize: 8 }))?.data;
  const ops = readCacheEntry(buildCacheKey("/ops/metrics"))?.data;
  const dailyRows = reports?.data ?? [];
  return {
    networkOps: opsDash?.data ?? opsDash ?? null,
    kpis: {
      grossCommission: sumCommission(dailyRows, "grossCommission"),
      clientCommission: sumCommission(dailyRows, "clientCommission"),
      mboCommission: sumCommission(dailyRows, "mboCommission"),
    },
    opsMetrics: ops?.data ?? ops ?? null,
    accessLogs: (logs?.rows ?? logs?.data ?? []).map((row) => ({
      id: row.id,
      action: row.action,
      createdAt: row.createdAt,
      actorEmail: row.user?.email,
      aggregateType: row.resource,
    })),
    reportRows: dailyRows,
    dailyClicks: dailyClicksFromReports(dailyRows),
    hasData: Boolean(opsDash || reports || logs || ops),
  };
}

export function ExecutiveDashboardPage() {
  const { user } = useAuth();
  const initial = readDashboardCache();
  const [error, setError] = useState(null);
  const [networkOps, setNetworkOps] = useState(initial.networkOps);
  const [kpis, setKpis] = useState(initial.kpis);
  const [opsMetrics, setOpsMetrics] = useState(initial.opsMetrics);
  const [accessLogs, setAccessLogs] = useState(initial.accessLogs);
  const [reportRows, setReportRows] = useState(initial.reportRows);
  const [dailyClicks, setDailyClicks] = useState(initial.dailyClicks);

  const canOps = hasPermission(user, PERMISSIONS.OPS_READ);
  const canLogs = hasPermission(user, PERMISSIONS.LOGS_READ);
  const canCampaigns = hasPermission(user, PERMISSIONS.CAMPAIGNS_READ);
  const canReports = hasPermission(user, PERMISSIONS.PERFORMANCE_READ);
  const showCommission = canViewCommission(user);

  useEffect(() => {
    let active = true;

    async function load() {
      setError(null);
      try {
        const requests = [];

        if (canCampaigns) {
          requests.push(fetchApi("/ops/network/dashboard").catch(() => null));
        } else {
          requests.push(Promise.resolve(null));
        }

        if (canReports) {
          requests.push(fetchApi("/reports/daily", { page: 1, pageSize: 30 }).catch(() => null));
        } else {
          requests.push(Promise.resolve(null));
        }

        if (canLogs) {
          requests.push(fetchApi("/logs/access", { page: 1, pageSize: 8 }).catch(() => null));
        }
        if (canOps) {
          requests.push(fetchApi("/ops/metrics").catch(() => null));
        }

        const results = await Promise.all(requests);
        if (!active) return;

        let idx = 0;
        const opsDash = results[idx++];
        const reports = results[idx++];
        let logs = null;
        let ops = null;

        if (canLogs) logs = results[idx++];
        if (canOps) ops = results[idx];

        const dailyRows = reports?.data ?? [];
        setNetworkOps(opsDash?.data ?? null);
        setKpis({
          grossCommission: sumCommission(dailyRows, "grossCommission"),
          clientCommission: sumCommission(dailyRows, "clientCommission"),
          mboCommission: sumCommission(dailyRows, "mboCommission"),
        });
        setOpsMetrics(ops?.data ?? null);
        setAccessLogs((logs?.rows ?? logs?.data ?? []).map((row) => ({
          id: row.id,
          action: row.action,
          createdAt: row.createdAt,
          actorEmail: row.user?.email,
          aggregateType: row.resource,
        })));
        setReportRows(dailyRows);
        setDailyClicks(dailyClicksFromReports(dailyRows));
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [canOps, canLogs, canCampaigns, canReports]);

  const chartData = useMemo(
    () =>
      dailyClicks.slice(-7).map((row) => ({
        label: row.reportDate?.slice(5) || "—",
        value: row.clickCount ?? 0,
      })),
    [dailyClicks],
  );

  const commissionChartData = useMemo(
    () =>
      reportRows
        .slice()
        .reverse()
        .slice(-7)
        .map((row) => ({
          label: row.reportDate?.slice(5) || "—",
          client: Number(row.clientCommission) || 0,
          mbo: Number(row.mboCommission) || 0,
        })),
    [reportRows],
  );

  const opsKpis = networkOps?.kpis;

  if (error && !networkOps && !reportRows.length) {
    return (
      <PageLayout
        eyebrow="Network Operations"
        title="Dashboard"
        subtitle="Daily operational view — MBO Rewards naming, separated source layers"
      >
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      eyebrow="Network Operations"
      title="Dashboard"
      subtitle="Daily operational view — MBO Rewards naming, separated source layers"
    >
      {opsKpis ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Network Sources"
            value={opsKpis.networkSources?.count?.toLocaleString?.() ?? opsKpis.networkSources?.count ?? "—"}
            hint={opsKpis.networkSources?.hint}
            to="/suppliers"
          />
          <StatCard
            label="Supplier Commission Rules"
            value={
              opsKpis.supplierCommissionRules?.count?.toLocaleString?.() ??
              opsKpis.supplierCommissionRules?.count ??
              "—"
            }
            hint={opsKpis.supplierCommissionRules?.hint}
            to="/ops/network/supplier-commission-rules"
          />
          <StatCard
            label="Open Mapping Exceptions"
            value={
              opsKpis.openMappingExceptions?.count?.toLocaleString?.() ??
              opsKpis.openMappingExceptions?.count ??
              "—"
            }
            hint={opsKpis.openMappingExceptions?.hint}
            to="/ops/mapping-review"
          />
        </div>
      ) : (
        <Card title="Network Operations" subtitle="Insufficient permissions for daily ops KPIs">
          <p className="text-sm text-slate-500">
            Campaign read access is required to load network source counts.
          </p>
        </Card>
      )}

      {networkOps?.dataFlow ? (
        <Card title="MBO Network Operations Data Flow" subtitle="Raw supplier data is never discarded">
          <DataFlowDiagram stages={networkOps.dataFlow.stages} />
          <p className="mt-4 text-sm text-slate-600">{networkOps.dataFlow.operationalRule}</p>
          <p className="mt-2 text-xs text-slate-500">
            Evidence: {networkOps.evidence?.rawPayloads?.toLocaleString?.() ?? "—"} raw payloads ·{" "}
            {networkOps.evidence?.importedEntities?.toLocaleString?.() ?? "—"} imported entities
            {networkOps.evidence?.rawPayloads != null ? (
              <>
                {" "}
                ·{" "}
                <Link to="/ops/network/raw-payload" className="text-sky-700 hover:underline">
                  Full Raw Payload
                </Link>
              </>
            ) : null}
          </p>
        </Card>
      ) : null}

      {networkOps?.sourceLayers?.length ? (
        <Card
          title="Source record layers"
          subtitle="Campaign, commission, coupon, link, offer, product, performance, order and payment — not grouped into one asset field"
        >
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
            {networkOps.sourceLayers.map((layer) => {
              const to = SOURCE_LAYER_LINKS[layer.key];
              const cell = (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {layer.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
                    {layer.count?.toLocaleString?.() ?? layer.count ?? "—"}
                  </p>
                </>
              );
              return to ? (
                <Link
                  key={layer.key}
                  to={to}
                  className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5 transition hover:border-sky-200 hover:bg-sky-50/50"
                >
                  {cell}
                </Link>
              ) : (
                <div key={layer.key} className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5">
                  {cell}
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {showCommission ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Gross Commission"
            value={formatCommission(kpis.grossCommission)}
            hint="Sum from recent daily reports"
          />
          <StatCard
            label="Client Commission"
            value={formatCommission(kpis.clientCommission)}
            hint="Share paid to clients"
          />
          <StatCard
            label="MBO Commission"
            value={formatCommission(kpis.mboCommission)}
            hint="Platform share (gross − client)"
          />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Daily Clicks (7 days)" subtitle="From supplier performance data">
          {chartData.length ? <BarChart data={chartData} labelKey="label" valueKey="value" height={180} /> : (
            <p className="text-sm text-slate-500">No click data available.</p>
          )}
        </Card>

        {showCommission ? (
          <Card title="Commissions (7 days)" subtitle="Client vs MBO commission">
            {commissionChartData.length ? (
              <div className="space-y-4">
                <BarChart data={commissionChartData} labelKey="label" valueKey="client" height={100} />
                <p className="text-xs text-slate-500">Client commission (top) · MBO commission (bottom)</p>
                <BarChart data={commissionChartData} labelKey="label" valueKey="mbo" height={100} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">No commission data available.</p>
            )}
          </Card>
        ) : (
          <PermissionGate user={user} permissions={[PERMISSIONS.LOGS_READ]}>
            <Card title="Recent Access" subtitle="Latest platform activity">
              <AuditTimeline events={accessLogs} />
            </Card>
          </PermissionGate>
        )}
      </div>

      {showCommission ? (
        <PermissionGate user={user} permissions={[PERMISSIONS.LOGS_READ]}>
          <Card title="Recent Access" subtitle="Latest platform activity">
            <AuditTimeline events={accessLogs} />
          </Card>
        </PermissionGate>
      ) : null}

      <PermissionGate user={user} permissions={[PERMISSIONS.OPS_READ]}>
        <Card title="System Metrics" subtitle="Ops telemetry (admin)">
          {opsMetrics ? (
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs text-slate-500">Uptime</dt>
                <dd className="text-lg font-semibold">{Math.floor((opsMetrics.uptimeSeconds || 0) / 60)}m</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Outbox Pending</dt>
                <dd className="text-lg font-semibold">{opsMetrics.outboxPending ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Redis</dt>
                <dd className="text-lg font-semibold">{opsMetrics.redisEnabled ? "Enabled" : "Disabled"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Node</dt>
                <dd className="text-lg font-semibold">{opsMetrics.nodeVersion ?? "—"}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-500">Ops metrics unavailable.</p>
          )}
        </Card>
      </PermissionGate>
    </PageLayout>
  );
}
