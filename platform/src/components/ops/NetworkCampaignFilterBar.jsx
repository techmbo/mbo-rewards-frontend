import { useMemo } from "react";
import { FilterBar } from "../ui/FilterBar";
import { useApi } from "../../hooks/useApi";
import {
  NETWORK_CAMPAIGN_EMPTY_FILTERS,
  NETWORK_CAMPAIGN_FILTER_DEFINITIONS,
  mergeFilterDefinitionsWithFacets,
} from "../../pages/ops/networkCampaignFilters";

export { NETWORK_CAMPAIGN_EMPTY_FILTERS };

export function NetworkCampaignFilterBar({
  values,
  onChange,
  onReset,
  excludeKeys = [],
}) {
  const facetParams = useMemo(
    () => ({
      entityType: "campaign",
      ...(values?.network ? { network: values.network } : {}),
    }),
    [values?.network],
  );
  const facetsApi = useApi("/ops/imported-records/facets", facetParams);
  const facets = facetsApi.data?.data ?? {};

  const filters = useMemo(() => {
    const merged = mergeFilterDefinitionsWithFacets(
      NETWORK_CAMPAIGN_FILTER_DEFINITIONS,
      facets,
    );
    return merged.filter((f) => !excludeKeys.includes(f.key));
  }, [facets, excludeKeys]);

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
