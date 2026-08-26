import { Button } from "./Button";

export function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
      <h3 className="text-lg font-semibold text-rose-900">{title}</h3>
      {message && <p className="mt-2 text-sm text-rose-700">{message}</p>}
      {onRetry && (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
