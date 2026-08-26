import { useEffect, useState } from "react";
import { fetchApi } from "../../api";
import { PageLayout } from "../../components/layout/PageLayout";
import { LoadingState } from "../../components/ui/LoadingState";

function Money({ value }) {
  return <span className="tabular-nums">{Number(value || 0).toFixed(2)}</span>;
}

export function FinanceOpsPage() {
  const [data, setData] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [dash, portal, daily] = await Promise.all([
          fetchApi("/ops/finance/dashboard"),
          fetchApi("/ops/finance/portal-cutover-readiness"),
          fetchApi("/ops/finance/daily-report-cutover-readiness"),
        ]);
        setData(dash.data);
        setReadiness({ portal: portal.data, daily: daily.data });
      } catch (err) {
        setError(err.message || "Failed to load finance ops");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <PageLayout title="Finance"><LoadingState label="Loading finance..." /></PageLayout>;
  if (error) return <PageLayout title="Finance"><p className="text-red-600">{error}</p></PageLayout>;

  return (
    <PageLayout title="Finance" subtitle="Internal financial operations and cutover readiness">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border bg-white p-4">
          <div className="text-xs uppercase text-slate-500">Supplier receivable</div>
          <div className="text-xl font-semibold"><Money value={data?.totals?.supplierReceivable} /></div>
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-xs uppercase text-slate-500">Client payable</div>
          <div className="text-xl font-semibold"><Money value={data?.totals?.clientPayable} /></div>
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-xs uppercase text-slate-500">MBO margin</div>
          <div className="text-xl font-semibold"><Money value={data?.totals?.mboMargin} /></div>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded border bg-white p-4 text-sm">
          <h3 className="mb-2 font-semibold">Counts</h3>
          <pre className="text-xs">{JSON.stringify(data?.counts, null, 2)}</pre>
          <p className="mt-2">Consumer mode: <strong>{data?.consumerMode}</strong></p>
          <p>Reconciles: <strong>{String(data?.totals?.reconciles)}</strong></p>
        </div>
        <div className="rounded border bg-white p-4 text-sm">
          <h3 className="mb-2 font-semibold">Cutover readiness</h3>
          <p>Portal ready: <strong>{String(readiness?.portal?.readyForFinanceCutover)}</strong></p>
          <p>DailyReport ready: <strong>{String(readiness?.daily?.readyForFinanceDimensionWrites)}</strong></p>
          <pre className="mt-2 max-h-64 overflow-auto text-xs">{JSON.stringify(readiness, null, 2)}</pre>
        </div>
      </div>
    </PageLayout>
  );
}
