import { useState } from "react";
import { Icon } from "./Icon";

async function copyText(value) {
  if (!value || !navigator?.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

/** Single-line truncated text with full value on hover. */
export function Truncate({ children, title, className = "" }) {
  const text = children == null || children === "" ? "—" : String(children);
  return (
    <span className={`block max-w-full truncate whitespace-nowrap ${className}`} title={title ?? (text === "—" ? undefined : text)}>
      {text}
    </span>
  );
}

/**
 * Long multi-line copy (descriptions / terms): show first line only,
 * expand in-place to read the full text.
 */
export function ExpandableText({
  text,
  empty = "—",
  className = "",
  maxWidthClass = "max-w-[240px]",
  charThreshold = 72,
  showToggleLabel = true,
}) {
  const [expanded, setExpanded] = useState(false);

  if (text == null || text === "") {
    return <span className="text-slate-400">{empty}</span>;
  }

  const full = String(text).replace(/\r\n/g, "\n").trim();
  if (!full) return <span className="text-slate-400">{empty}</span>;

  const lines = full.split("\n").map((line) => line.trim()).filter(Boolean);
  const firstLine = lines[0] || full;
  const needsExpand =
    lines.length > 1 || full.length > charThreshold || firstLine.length > charThreshold;

  return (
    <div className={`min-w-0 ${maxWidthClass} ${className}`}>
      {expanded ? (
        <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-700">{full}</p>
      ) : (
        <p className="truncate whitespace-nowrap text-xs leading-5 text-slate-700" title={full}>
          {firstLine}
        </p>
      )}
      {needsExpand ? (
        <button
          type="button"
          className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-800"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setExpanded((value) => !value);
          }}
          aria-expanded={expanded}
        >
          <span aria-hidden className="text-[9px]">
            {expanded ? "▲" : "▼"}
          </span>
          {showToggleLabel ? (expanded ? "Show less" : "Show more") : null}
        </button>
      ) : null}
    </div>
  );
}

function shortenUrl(url) {
  try {
    const parsed = new URL(url);
    const path = `${parsed.pathname}${parsed.search}`.replace(/\/$/, "") || "/";
    const shortPath = path.length > 22 ? `${path.slice(0, 20)}…` : path;
    return `${parsed.host}${shortPath}`;
  } catch {
    return url.length > 32 ? `${url.slice(0, 30)}…` : url;
  }
}

/**
 * Compact link cell: one-line preview + icon copy/open.
 * Never wraps long URLs across multiple lines.
 */
export function UrlCell({
  url,
  label,
  missingLabel = "Missing",
  tone = "slate",
  showCopy = true,
  showOpen = true,
}) {
  const [copied, setCopied] = useState(false);

  if (!url) {
    return <span className="text-xs font-medium text-rose-600">{missingLabel}</span>;
  }

  const display = label || shortenUrl(url);
  const linkTone =
    tone === "indigo" ? "text-indigo-600 hover:text-indigo-800" : "text-slate-600 hover:text-slate-900";

  async function handleCopy(event) {
    event.preventDefault();
    event.stopPropagation();
    const ok = await copyText(url);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function handleOpen(event) {
    event.preventDefault();
    event.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex max-w-full items-center gap-1">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        title={url}
        className={`min-w-0 flex-1 truncate font-mono text-[11px] leading-5 ${linkTone}`}
        onClick={(e) => e.stopPropagation()}
      >
        {display}
      </a>
      {showCopy ? (
        <button
          type="button"
          title={copied ? "Copied" : "Copy URL"}
          aria-label={copied ? "Copied" : "Copy URL"}
          onClick={handleCopy}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-[11px] text-slate-500 hover:border-slate-300 hover:text-slate-800"
        >
          {copied ? <Icon name="check" size={14} /> : <Icon name="copy" size={14} />}
        </button>
      ) : null}
      {showOpen ? (
        <button
          type="button"
          title="Open"
          aria-label="Open URL"
          onClick={handleOpen}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
        >
          <Icon name="openInNew" size={14} />
        </button>
      ) : null}
    </div>
  );
}

/** Compact monospace chip for tokens/slugs. */
export function MonoChip({ value, className = "" }) {
  if (!value) return <span className="text-slate-400">—</span>;
  return (
    <span
      className={`inline-block max-w-full truncate rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 ${className}`}
      title={String(value)}
    >
      {value}
    </span>
  );
}

/** Date/time on one line for table cells. */
export function DateCell({ value, withTime = true }) {
  if (!value) return <span className="text-slate-400">—</span>;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <span className="text-slate-400">—</span>;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  if (!withTime) {
    return <span className="whitespace-nowrap text-xs text-slate-600">{`${day}/${month}/${year}`}</span>;
  }
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return (
    <span className="whitespace-nowrap text-xs text-slate-600" title={date.toLocaleString()}>
      {`${day}/${month}/${year} ${hours}:${minutes}`}
    </span>
  );
}
