import { useCallback, useState } from "react";
import { fetchApi } from "../api";

export function useImportedRecordDetail() {
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const openDetail = useCallback(async (row) => {
    setDetailLoading(true);
    setDetailError("");
    try {
      const json = await fetchApi(`/ops/imported-records/${row.id}`);
      setDetail(json?.data ?? json);
    } catch (err) {
      setDetailError(err?.message || "Failed to load record");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetail(null);
    setDetailError("");
  }, []);

  const refreshDetail = useCallback(async () => {
    if (!detail?.id) return;
    try {
      const json = await fetchApi(`/ops/imported-records/${detail.id}`);
      setDetail(json?.data ?? json);
    } catch (err) {
      setDetailError(err?.message || "Failed to load record");
    }
  }, [detail?.id]);

  return {
    detail,
    setDetail,
    detailLoading,
    detailError,
    openDetail,
    closeDetail,
    refreshDetail,
  };
}
