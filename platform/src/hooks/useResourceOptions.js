import { useCallback, useEffect, useState } from "react";
import { fetchApi } from "../api";

/**
 * Load a paged list endpoint into select options.
 * @param {string} path
 * @param {(row: object) => { value: string, label: string }} mapRow
 * @param {{ enabled?: boolean, params?: object }} options
 */
export function useResourceOptions(path, mapRow, { enabled = true, params = {} } = {}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!enabled || !path) return;
    setLoading(true);
    try {
      const response = await fetchApi(path, { page: 1, pageSize: 200, ...params });
      const rows = response.data ?? response.rows ?? [];
      setOptions(rows.map(mapRow).filter((o) => o?.value));
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [path, enabled, JSON.stringify(params)]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { options, loading, reload };
}
