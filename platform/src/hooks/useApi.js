import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchApi } from "../api";
import {
  buildCacheKey,
  DEFAULT_CACHE_TTL_MS,
  hasCachedData,
  isCacheFresh,
  readCacheEntry,
} from "../apiCache";

export function useApi(path, params = {}, { enabled = true, cacheTtlMs = DEFAULT_CACHE_TTL_MS } = {}) {
  const paramsKey = JSON.stringify(params);
  const stableParams = useMemo(() => params, [paramsKey]);
  const cacheKey = path ? buildCacheKey(path, stableParams) : null;
  const cachedEntry = cacheKey ? readCacheEntry(cacheKey) : null;

  const [data, setData] = useState(() => cachedEntry?.data ?? null);
  const [loading, setLoading] = useState(Boolean(enabled && path && !cachedEntry?.data));
  const [error, setError] = useState(null);

  const reload = useCallback(
    async ({ skipCache = false, extraParams = {}, forceLoading = false } = {}) => {
      if (!enabled || !path) return null;
      const requestParams = { ...stableParams, ...extraParams };
      const key = buildCacheKey(path, stableParams);
      const entry = readCacheEntry(key);
      const canUseCache = !skipCache && isCacheFresh(entry, cacheTtlMs);
      if (canUseCache) {
        setData(entry.data);
        setLoading(false);
        setError(null);
        return entry.data;
      }

      if (forceLoading) {
        setLoading(true);
      } else if (entry?.data && !skipCache) {
        setData(entry.data);
        setLoading(false);
      } else if (!hasCachedData(key)) {
        setLoading(true);
      }
      setError(null);
      try {
        const result = await fetchApi(path, requestParams, { cacheTtlMs, skipCache });
        setData(result);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [path, paramsKey, enabled, cacheTtlMs, stableParams],
  );

  const refresh = useCallback(
    () => reload({ skipCache: true, forceLoading: true }),
    [reload],
  );

  useEffect(() => {
    if (!enabled || !path) {
      setLoading(false);
      return;
    }
    const entry = cacheKey ? readCacheEntry(cacheKey) : null;
    if (entry?.data) {
      setData(entry.data);
      setLoading(false);
    }
    reload().catch(() => {});
  }, [path, paramsKey, enabled, reload, cacheKey]);

  return { data, loading, error, reload, refresh };
}
