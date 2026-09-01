import { StatusPill } from "../ui/StatusPill";

const STATE_KEY_MAP = {
  linkSupport: "linkSupportState",
  couponSupport: "couponSupportState",
  deeplinkSupport: "deeplinkSupportState",
  feedSupport: "feedSupportState",
  commissionRules: "commissionRulesState",
  commissionRuleCount: "commissionRulesState",
};

const CAPABILITY_KEY_MAP = {
  linkSupport: "trackingLink",
  couponSupport: "coupon",
  deeplinkSupport: "deeplink",
  feedSupport: "productFeed",
  commissionRules: "commissionRules",
};

export function capabilityStateFromRow(row, columnKey) {
  const stateKey = STATE_KEY_MAP[columnKey];
  if (stateKey && row?.[stateKey]) return row[stateKey];
  const capKey = CAPABILITY_KEY_MAP[columnKey];
  const entry = row?.capabilities?.[capKey];
  if (entry?.state) return entry.state;
  if (row?.[columnKey] === true) return "SUPPORTED";
  if (row?.[columnKey] === false) return "NOT_SUPPORTED";
  return null;
}

export function CampaignCapabilityCell({ row, columnKey }) {
  const state = capabilityStateFromRow(row, columnKey);
  if (!state) return <span className="text-slate-400">—</span>;
  const capKey = CAPABILITY_KEY_MAP[columnKey];
  const syncedCount = row?.capabilities?.[capKey]?.syncedCount;
  const showCount =
    state === "SUPPORTED" && syncedCount != null && syncedCount > 0 && columnKey !== "linkSupport";
  return (
    <span className="inline-flex flex-col gap-0.5">
      <StatusPill status={state} />
      {showCount ? (
        <span className="text-[10px] text-slate-500 tabular-nums">{syncedCount} synced</span>
      ) : null}
    </span>
  );
}
