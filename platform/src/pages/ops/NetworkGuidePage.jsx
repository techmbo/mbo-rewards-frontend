import { PageLayout } from "../../components/layout/PageLayout";

const SECTIONS = [
  {
    id: "boundary",
    title: "System Boundary",
    tag: "14A_Network_Control_Overview",
    body: (
      <>
        <p className="text-sm text-slate-700">
          Network API / Manual Import → Raw Payload Store → Network Adapter → MBO Standard Records →
          Network Operation Portal → MBO Rewards Master Catalog
        </p>
        <p className="mt-2 text-sm font-medium text-slate-900">
          This portal is Network → MBO only. No client campaign assignment, client payable commission,
          client API or client payout workflow belongs here. Network account always means MBO&apos;s
          network/API account.
        </p>
      </>
    ),
  },
  {
    id: "campaign",
    title: "Campaign Rules",
    body: (
      <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
        <li>
          Campaign source is MBO-ready when:{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">campaign_status = ACTIVE</code> AND{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            relationship_status = JOINED / APPROVED / ACTIVE
          </code>{" "}
          AND brand mapping is complete AND{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">mapping_status = MAPPED</code> AND
          commission data exists AND at least one usable asset exists AND source is not hidden.
        </li>
        <li>
          <code className="rounded bg-slate-100 px-1 text-xs">relationship_status</code> and{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">campaign_status</code> are separate
          concepts.
        </li>
        <li>
          Approval in Network Campaigns only makes the source available to the separate MBO Master
          Catalog.
        </li>
      </ul>
    ),
  },
  {
    id: "coupon",
    title: "Coupon Pool & Refresh Rules",
    body: (
      <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
        <li>
          Code arrives from API / email / Excel / account manager / brand → store/update
          CouponCodeMaster → calculate total / assigned / remaining → detect new code → create
          new_code_alert → show alert in Network Coupon Pool → do not silently modify downstream
          assignments.
        </li>
        <li>
          <code className="rounded bg-slate-100 px-1 text-xs">assigned_quantity</code> represents MBO
          platform allocation usage, not network redemption count.
        </li>
        <li>
          New codes can later upgrade shared/reused downstream assignments, but that workflow is
          outside this portal.
        </li>
      </ul>
    ),
  },
  {
    id: "order-context",
    title: "Order Context Rule",
    tag: "14F / 14G / 14H / 14I",
    body: (
      <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
        <li>
          Wherever order/payment data is shown, keep Brand + Campaign + Campaign Source + Coupon Code
          + Network Tracking Link + MBO Tracking Link available where the data exists.
        </li>
        <li>
          Never invent a network tracking link. Coupon-code-only campaigns may legitimately show —
          for network tracking link.
        </li>
        <li>
          Order detail/export should retain tracking_link_id, network_click_id, mbo_click_id, and sub
          IDs when supplied.
        </li>
        <li>
          Order data should never be displayed without enough attribution context to understand the
          originating campaign.
        </li>
      </ul>
    ),
  },
  {
    id: "performance",
    title: "Raw Performance Data Model",
    tag: "14E_Raw_Network_Performance",
    body: (
      <div className="space-y-3 text-sm text-slate-700">
        <div>
          <p className="font-semibold text-slate-900">Identity</p>
          <p>
            Network, account, report ID, campaign source ID, network campaign ID, brand, campaign,
            categories, country, currency and campaign type.
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Tracking</p>
          <p>
            Coupon ID/code/source/scope, network tracking link, MBO tracking link, tracking link ID,
            network click ID, MBO click ID and sub IDs.
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Traffic</p>
          <p>
            Impressions, network clicks, MBO link clicks and unique clicks. Network clicks and MBO
            clicks remain separate metrics.
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Orders & commission</p>
          <p>
            Gross / pending / confirmed / cancelled / rejected / paid order counts and value
            lifecycle. Gross / pending / confirmed / payable / paid / MBO receivable / MBO actually
            received commission.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "lifecycle",
    title: "Order & Payment Lifecycle",
    body: (
      <p className="text-sm text-slate-700">
        Raw network order → raw_network_status → MappingRule → mbo_standard_status → OrderValidation →
        Confirmed Order → Network Payment / Payable → MBO actual received amount → Reconciliation
      </p>
    ),
  },
  {
    id: "security",
    title: "Security Rules",
    body: (
      <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
        <li>Raw payloads, network IDs, raw links, mapping rules and credentials remain internal.</li>
        <li>Actual secrets/tokens/passwords are never rendered in the UI.</li>
        <li>Network tracking links shown here are internal traceability data.</li>
        <li>
          MBO tracking links shown here are attribution traceability records; this does not turn the
          Network Operation Portal into a client module.
        </li>
      </ul>
    ),
  },
  {
    id: "qa",
    title: "QA Checklist",
    tag: "14M_Network_Control_QA",
    body: (
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Area</th>
              <th className="px-3 py-2">Required Check</th>
              <th className="px-3 py-2">Expected Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {[
              ["Scope", "No client-specific operational workflow appears in this portal.", "Network → MBO only."],
              ["Guide Separation", "Reading and implementation material is only in Guide / Tech Notes.", "Main dashboards remain operational."],
              ["Campaign Status", "Relationship and campaign status remain separate.", "No status confusion."],
              ["Coupon Pool", "Total, assigned and remaining quantities are visible.", "MBO inventory logic is auditable."],
              ["New Codes", "New codes create alerts without silent downstream changes.", "Admin review required."],
              ["Raw Performance", "Complete tracking, clicks, order and commission lifecycle available.", "Full export/audit possible."],
              ["Click Separation", "Network clicks and MBO link clicks are separate.", "No silent substitution."],
              ["Order Context", "Brand, campaign, coupon and links follow order/payment records.", "Orders are understandable without external lookup."],
              ["No Invented Links", "Missing network links display blank/—.", "Source accuracy maintained."],
              ["Paid Orders", "Network payable and MBO actual received remain separate.", "Partial payments are visible."],
              ["Freshness", "Operational records show last synced/updated timestamps.", "Stale data is identifiable."],
              ["Credentials", "Secrets are never displayed.", "Only status/expiry/actions visible."],
            ].map(([area, check, expected]) => (
              <tr key={area}>
                <td className="px-3 py-2 font-medium text-slate-900">{area}</td>
                <td className="px-3 py-2">{check}</td>
                <td className="px-3 py-2">{expected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
];

/**
 * Network Operation Portal — Guide / Tech Notes.
 * Reading and implementation material stays here, separate from operational dashboards.
 */
export function NetworkGuidePage() {
  return (
    <PageLayout
      eyebrow="Network Operation Portal"
      title="Guide / Tech Notes"
      subtitle="All reading material, architecture rules, implementation guidance and QA are kept here, separate from the operational dashboards."
    >
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
          >
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">{section.title}</h2>
              {section.tag ? (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {section.tag}
                </span>
              ) : null}
            </div>
            {section.body}
          </section>
        ))}
      </div>
    </PageLayout>
  );
}
