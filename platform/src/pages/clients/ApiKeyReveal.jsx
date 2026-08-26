import { useState } from "react";

async function copyText(value) {
  if (!value || !navigator?.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

/** One-time API key reveal — never persist the secret. */
export function ApiKeyReveal({ apiKey, warning }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyText(apiKey);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!apiKey) return null;

  return (
    <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
      <p className="font-medium">{warning || "Copy this API key now. It will not be shown again."}</p>
      <div className="flex min-w-0 items-center gap-2">
        <code className="min-w-0 flex-1 break-all font-mono text-xs" title={apiKey}>
          {apiKey}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded border border-amber-300 bg-white px-2 py-1 text-[11px] font-medium text-amber-900 hover:bg-amber-100"
        >
          {copied ? "Copied" : "Copy key"}
        </button>
      </div>
    </div>
  );
}
