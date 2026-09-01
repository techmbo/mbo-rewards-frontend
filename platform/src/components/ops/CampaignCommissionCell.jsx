import { Link } from "react-router-dom";

/**
 * Network Operations table/drawer renderer for campaign commissions.
 * Shows every parsed commission rate stacked; summary string is fallback only.
 */

function expandCommissionText(text) {
  const raw = String(text || "").trim();
  if (!raw || raw === "[object Object]") return [];
  const chunks = raw.split(/\s*·\s*/).map((part) => part.trim()).filter(Boolean);
  const out = [];
  for (const chunk of chunks) {
    const mixed = chunk.match(
      /^((?:up\s*to\s*)?-?\d+(?:[.,]\d+)?\s*%)\s+((?:[A-Z]{3}|S\$|HK\$|US\$|A\$|C\$|Rp|[$£€])\s*-?\d[\d.,]*)$/i,
    );
    if (mixed) {
      out.push(mixed[1], mixed[2]);
    } else {
      out.push(chunk);
    }
  }
  return out;
}

export function campaignCommissionSummary(row) {
  return (
    row?.campaignCommissionSummary ||
    row?.commissionDisplay ||
    row?.commercial?.campaignCommissionSummary ||
    null
  );
}

export function campaignCommissionItems(row) {
  const operations = Array.isArray(row?.commissionOperations) ? row.commissionOperations : [];
  if (operations.length) {
    return operations.flatMap((op) =>
      (op.commissions || [])
        .map((item) => (item && typeof item === "object" ? item.display : item))
        .flatMap((text) => expandCommissionText(text)),
    );
  }

  const source = row?.commercial || row || {};
  const listed = Array.isArray(source.commissions)
    ? source.commissions
    : Array.isArray(row?.commissions)
      ? row.commissions
      : [];
  const fromList = listed
    .map((item) => (item && typeof item === "object" ? item.display : item))
    .flatMap((text) => expandCommissionText(text));
  if (fromList.length) return fromList;

  const raw =
    source.commissionFactsDisplay ??
    row?.commissionFactsDisplay ??
    source.commissionDisplay ??
    row?.commissionDisplay ??
    row?.commission;
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => (item && typeof item === "object" ? item.display : item))
      .flatMap((text) => expandCommissionText(text));
  }
  if (typeof raw === "object") {
    const display =
      raw.display ||
      raw.label ||
      (raw.percent != null ? `${raw.percent}%` : null) ||
      (raw.ratePercent != null ? `${raw.ratePercent}%` : null) ||
      (raw.amount != null && raw.currency ? `${raw.currency} ${raw.amount}` : null);
    return expandCommissionText(display);
  }
  // Skip summary-only strings like "Up to 8% · 3 rules" when no detailed facts exist.
  const text = String(raw).trim();
  if (/rule/i.test(text)) return [];
  return expandCommissionText(text);
}

function operationDisplays(op) {
  return (op?.commissions || [])
    .map((item) => (item && typeof item === "object" ? item.display : item))
    .flatMap((text) => expandCommissionText(text));
}

function OperationStack({ operations, renderSection, className = "" }) {
  return (
    <span className={`inline-flex min-w-[7.5rem] max-w-[16rem] flex-col overflow-hidden rounded-md border border-slate-200 bg-slate-50 ${className}`}>
      {operations.map((op, idx) => {
        const rates = operationDisplays(op);
        const lines = Math.max(1, rates.length);
        return (
          <span
            key={op.id || `${op.campaign || "op"}-${idx}`}
            className="flex flex-col justify-center border-b border-slate-200 px-2 py-1 last:border-b-0"
            style={{ minHeight: `${lines * 1.35}rem` }}
          >
            {renderSection(op, rates, idx)}
          </span>
        );
      })}
    </span>
  );
}

export function CampaignNameCell({ row, className = "" }) {
  const operations = Array.isArray(row?.commissionOperations) ? row.commissionOperations : [];
  if (operations.length > 1) {
    return (
      <OperationStack
        className={className}
        operations={operations}
        renderSection={(op) => (
          <span className="truncate text-xs text-slate-800" title={op.campaign || ""}>
            {op.campaign || "—"}
          </span>
        )}
      />
    );
  }
  const name = operations[0]?.campaign || row?.campaign;
  if (!name) return <span className="text-slate-400">—</span>;
  return (
    <span className={`block max-w-[200px] truncate ${className}`} title={name}>
      {name}
    </span>
  );
}

export function CampaignCommissionCell({ row, className = "" }) {
  const summary = campaignCommissionSummary(row);
  const ruleCount = Number(row?.commissionRuleCount ?? 0);

  const operations = Array.isArray(row?.commissionOperations) ? row.commissionOperations : [];
  if (operations.length > 1) {
    return (
      <OperationStack
        className={className}
        operations={operations}
        renderSection={(_op, rates) =>
          rates.length ? (
            rates.map((item, idx) => (
              <span key={`${item}-${idx}`} className="text-xs tabular-nums text-slate-800">
                {item}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )
        }
      />
    );
  }

  const items = campaignCommissionItems(row);
  if (items.length) {
    return (
      <span className={`inline-flex min-w-[7.5rem] max-w-[16rem] flex-col gap-1 ${className}`}>
        <span
          className="inline-flex min-w-[7.5rem] max-w-[16rem] flex-col overflow-hidden rounded-md border border-slate-200 bg-slate-50"
          title={items.join(" · ")}
        >
          {items.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="border-b border-slate-200 px-2 py-1 text-xs tabular-nums text-slate-800 last:border-b-0"
            >
              {item}
            </span>
          ))}
        </span>
        {ruleCount > items.length ? (
          <Link
            to="/ops/network/supplier-commission-rules"
            className="text-[10px] font-medium text-sky-700 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View {ruleCount} rules
          </Link>
        ) : null}
      </span>
    );
  }

  if (summary) {
    return (
      <span className={`inline-flex min-w-[7.5rem] max-w-[16rem] flex-col gap-1 ${className}`}>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs tabular-nums text-slate-800">
          {summary}
        </span>
        {ruleCount > 1 ? (
          <Link
            to="/ops/network/supplier-commission-rules"
            className="text-[10px] font-medium text-sky-700 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View {ruleCount} rules
          </Link>
        ) : null}
      </span>
    );
  }

  return <span className="text-slate-400">—</span>;
}
