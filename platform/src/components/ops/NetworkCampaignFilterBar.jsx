import { FilterBar } from "../ui/FilterBar";
import {
  NETWORK_CAMPAIGN_EMPTY_FILTERS,
  NETWORK_CAMPAIGN_FILTER_DEFINITIONS,
} from "../../pages/ops/networkCampaignFilters";

export { NETWORK_CAMPAIGN_EMPTY_FILTERS };

export function NetworkCampaignFilterBar({
  values,
  onChange,
  onReset,
  excludeKeys = [],
}) {
  const filters = NETWORK_CAMPAIGN_FILTER_DEFINITIONS.filter(
    (f) => !excludeKeys.includes(f.key),
  );

  return (
    <FilterBar
      values={values}
      onChange={onChange}
      onReset={onReset}
      filters={filters}
    />
  );
}

/** Hook-friendly filter updater; clears preset when a dimensional filter changes. */
export function updateNetworkCampaignFilter(prev, key, value) {
  if (key === "__reset__") return { ...NETWORK_CAMPAIGN_EMPTY_FILTERS };
  return {
    ...prev,
    [key]: value,
    ...(key !== "preset" && key !== "search" ? { preset: "" } : {}),
  };
}
