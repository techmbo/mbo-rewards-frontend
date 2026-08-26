import { useEffect, useState } from "react";
import { fetchApi } from "../../api";
import { PageLayout } from "../../components/layout/PageLayout";
import { LoadingState } from "../../components/ui/LoadingState";

export function SystemHealthPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [health, suppliers, jobs] = await Promise.all([
          fetchApi("/ops/system-health"),
          fetchApi("/ops/supplier-health"),
          fetchApi("/ops/job-health"),
        ]);
        setData({ health: health.data, suppliers: suppliers.data, jobs: jobs.data });
      } catch (err) {
        setError(err.message || "Failed to load health");
      }
    })();
  }, []);

  if (!data && !error) {
    return (
      <PageLayout eyebrow="Network Operation Portal" title="Network Health">
        <LoadingState label="Loading health..." />
      </PageLayout>
    );
  }
  if (error) {
    return (
      <PageLayout eyebrow="Network Operation Portal" title="Network Health">
        <p className="text-red-600">{error}</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      eyebrow="Network Operation Portal"
      title="Network Health"
      subtitle="Network and sync health signals for MBO network accounts."
    >
      <div className="mb-4 rounded border bg-white p-4">
        Overall: <strong>{data.health.overall}</strong>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <pre className="overflow-auto rounded border bg-white p-3 text-xs">{JSON.stringify(data.health, null, 2)}</pre>
        <pre className="overflow-auto rounded border bg-white p-3 text-xs">{JSON.stringify({ suppliers: data.suppliers, jobs: data.jobs }, null, 2)}</pre>
      </div>
    </PageLayout>
  );
}

export function DataQualityPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [dq, coverage] = await Promise.all([
          fetchApi("/ops/data-quality"),
          fetchApi("/ops/assignment-coverage"),
        ]);
        setData({ dq: dq.data, coverage: coverage.data });
      } catch (err) {
        setError(err.message || "Failed to load data quality");
      }
    })();
  }, []);

  if (!data && !error) return <PageLayout title="Data Quality"><LoadingState label="Loading..." /></PageLayout>;
  if (error) return <PageLayout title="Data Quality"><p className="text-red-600">{error}</p></PageLayout>;

  return (
    <PageLayout title="Data Quality" subtitle="Assignments, conversions, finance, exceptions">
      <pre className="overflow-auto rounded border bg-white p-3 text-xs">{JSON.stringify(data, null, 2)}</pre>
    </PageLayout>
  );
}
