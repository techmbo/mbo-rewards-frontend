import { htmlToPlainText } from "../../utils/display";

/** Long legal / description text in drawers — fixed height, inner scroll. */
export function ScrollableLongText({ value, className = "" }) {
  const text = htmlToPlainText(value);
  if (!text) return "—";
  return (
    <div
      tabIndex={0}
      className={`max-h-40 overflow-y-auto overscroll-contain rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap break-words ${className}`}
    >
      {text}
    </div>
  );
}
