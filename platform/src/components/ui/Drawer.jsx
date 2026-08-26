import { createPortal } from "react-dom";
import { Button } from "./Button";
import { Icon } from "./Icon";

export function Drawer({ open, title, children, footer, onClose, width = "max-w-xl" }) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true">
      {/* Full-bleed scrim — avoids 1px top hairline from subpixel gaps */}
      <button
        type="button"
        className="absolute -inset-px bg-slate-900/50"
        onClick={onClose}
        aria-label="Close drawer"
      />
      <aside
        className={`relative z-10 flex h-full max-h-[100dvh] w-full ${width} flex-col bg-white shadow-2xl`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">{children}</div>
        {footer ? <div className="shrink-0 border-t border-slate-100 px-5 py-4">{footer}</div> : null}
      </aside>
    </div>,
    document.body,
  );
}
