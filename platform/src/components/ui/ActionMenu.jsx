import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

export function ActionMenu({ items = [] }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const visible = items.filter((item) => item.visible !== false);
  if (!visible.length) return null;

  function toggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 192;
      const estimatedHeight = visible.length * 40 + 8;
      const left = Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8);
      const openUp = rect.bottom + estimatedHeight > window.innerHeight - 8;
      const top = openUp ? Math.max(8, rect.top - estimatedHeight - 4) : rect.bottom + 4;
      setCoords({ top, left: Math.max(8, left) });
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return undefined;
    function onScroll() {
      setOpen(false);
    }
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [open]);

  return (
    <div className="relative inline-flex">
      <Button ref={buttonRef} variant="ghost" size="sm" onClick={toggle} aria-expanded={open}>
        ⋯
      </Button>
      {open &&
        createPortal(
          <>
            <button type="button" className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} aria-label="Close menu" />
            <div
              className="fixed z-[70] w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
              style={{ top: coords.top, left: coords.left }}
            >
              {visible.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                    item.danger ? "text-rose-600" : "text-slate-700"
                  }`}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
