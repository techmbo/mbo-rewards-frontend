import { useEffect, useState } from "react";
import { fetchApi } from "../../api";
import { PageLayout } from "../../components/layout/PageLayout";
import { NetworkFilter, useClientOpsNetworkFilter } from "./NetworkFilter";

function unwrap(res) {
  return res?.data ?? res;
}

/**
 * Client Ops v5 — Guide / Tech Notes (live contract + nav counts from API).
 */
export function ClientOpsGuidePage() {
  const [network, setNetwork] = useClientOpsNetworkFilter();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchApi("/ops/client/guide", {}, { skipCache: true });
        if (!cancelled) setGuide(unwrap(res));
      } catch (err) {
        if (!cancelled) {
          setGuide(null);
          setError(err?.message || "Unable to load guide.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const boundary = guide?.boundary;
  const fields = guide?.clientSafeFields || [];
  const forbidden = guide?.contract?.forbiddenKeys || [];

  return (
    <PageLayout
      title="Guide / Tech Notes"
      subtitle="Operational logic and implementation rules kept outside the main admin workflows."
      actions={
        <NetworkFilter id="client-ops-guide-network" value={network} onChange={setNetwork} className="min-w-[180px]" />
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading guide…</p>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">{boundary?.title || "Locked Client Operations boundary"}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{boundary?.body}</p>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-bold text-slate-900">Client-safe campaign fields</h2>
              <p className="mt-1 text-xs text-slate-500">
                Authoritative 06C partner DTO contract — {fields.length} published fields exposed to clients after
                assignment publish.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {fields.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-2 px-5 py-3 text-sm sm:grid-cols-[minmax(160px,220px)_minmax(0,1fr)] sm:gap-4"
                >
                  <div className="font-semibold text-slate-900">{row.label}</div>
                  <div className="text-slate-600">
                    {row.description}
                    {row.dtoKey ? (
                      <span className="mt-1 block font-mono text-[10px] text-slate-400">{row.dtoKey}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {forbidden.length ? (
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-sm font-bold text-slate-900">Never exposed to clients</h2>
              <p className="mt-2 text-xs text-slate-500">
                Forbidden keys stripped from all client-facing campaign responses.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {forbidden.map((key) => (
                  <code key={key} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700">
                    {key}
                  </code>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </PageLayout>
  );
}
