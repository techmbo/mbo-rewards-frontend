import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((message, { type = "info", duration = 4000 } = {}) => {
    const id = ++toastId;
    setToasts((current) => [...current, { id, message, type }]);
    if (duration > 0) {
      window.setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const value = useMemo(
    () => ({
      toasts,
      dismiss,
      success: (message, opts) => push(message, { ...opts, type: "success" }),
      error: (message, opts) => push(message, { ...opts, type: "error" }),
      info: (message, opts) => push(message, { ...opts, type: "info" }),
      warn: (message, opts) => push(message, { ...opts, type: "warn" }),
    }),
    [toasts, dismiss, push],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
