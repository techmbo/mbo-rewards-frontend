import { useToast } from "../../context/ToastContext";

const styles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  warn: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
};

export function ToastContainer() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg ${styles[toast.type] || styles.info}`}
        >
          <div className="flex items-start justify-between gap-3">
            <span>{toast.message}</span>
            <button type="button" className="text-xs opacity-70" onClick={() => dismiss(toast.id)}>
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
