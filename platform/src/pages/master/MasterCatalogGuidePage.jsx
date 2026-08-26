import { Link } from "react-router-dom";
import { PageLayout } from "../../components/layout/PageLayout";

const FLOW = [
  { label: "Network Operation Portal", to: "/" },
  { label: "Brand Master", to: "/master/brands" },
  { label: "Network Campaign Sources", to: "/master/campaigns" },
  { label: "Master Campaigns", to: "/master/campaigns" },
  { label: "Assignment", to: "/master/assign" },
  { label: "Client Operations", to: "/clients" },
];

const CARDS = [
  {
    title: "Brand Master",
    body: "MBO-editable canonical brand record. Editing it never overwrites raw network campaign/source data.",
  },
  {
    title: "Brand Workspace",
    body: "Contextual tabs load Overview, Network Campaigns, Master Campaigns, Coupons, Links and Products separately.",
  },
  {
    title: "Scale",
    body: "Brand campaigns/products use server-side filtering, sorting and pagination. Never load thousands of rows into one page.",
  },
  {
    title: "Network Campaigns",
    body: "Each source keeps its own commission, terms, coupon/link/feed assets, statuses and sync history.",
  },
  {
    title: "Master Campaigns",
    body: "Normalized MBO records group eligible sources without losing source-specific information.",
  },
  {
    title: "Assignment",
    body: "Only approved/ready master campaigns can be assigned; coupon and MBO-link logic is created downstream.",
  },
];

export function MasterCatalogGuidePage() {
  return (
    <PageLayout
      eyebrow="Master Catalog"
      title="Guide / Tech Notes"
      subtitle="All architecture, reading and implementation material stays here, separate from operations."
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Full Master Catalog Flow</h2>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {FLOW.map((step, index) => (
            <div key={step.label} className="flex flex-wrap items-center gap-2">
              <Link
                to={step.to}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {step.label}
              </Link>
              {index < FLOW.length - 1 ? (
                <span className="text-slate-400" aria-hidden>
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.body}</p>
          </article>
        ))}
      </div>
    </PageLayout>
  );
}
