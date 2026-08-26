import { useCallback, useState } from "react";
import { deleteApi, patchApi, postApi, putApi } from "../api";
import { useToast } from "../context/ToastContext";

const writers = {
  POST: postApi,
  PUT: putApi,
  PATCH: patchApi,
  DELETE: deleteApi,
};

export function useMutation(method = "POST", { successMessage, onSuccess } = {}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (path, body) => {
      setLoading(true);
      setError(null);
      try {
        const writer = writers[method.toUpperCase()] || postApi;
        const result = await writer(path, body);
        if (successMessage) toast.success(successMessage);
        onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [method, successMessage, onSuccess, toast],
  );

  return { mutate, loading, error };
}
