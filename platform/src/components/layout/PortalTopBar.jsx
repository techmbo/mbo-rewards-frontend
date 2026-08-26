import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchApi } from "../../api";
import { unwrap } from "../../pages/portal/portalUtils";

const PAGE_TITLES = {
  "/portal": "Dashboard",
  "/portal/campaigns": "Campaigns",
  "/portal/performance": "Performance",
  "/portal/payable-statements": "Payable Statements",
  "/portal/withdrawal-requests": "Withdrawal Requests",
  "/portal/payments": "Payments",
  "/portal/settings": "Profile",
  "/portal/support": "Support",
  "/portal/orders": "Orders",
  "/portal/products": "Products",
  "/portal/payment-status": "Payment Status",
};

export function PortalTopBar({ pathname, onMenuClick, client }) {
  const { user } = useAuth();
  const pageTitle = PAGE_TITLES[pathname] || "Portal";
  const clientName = client?.name || user?.clientName || "";
  const role = "Admin";
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetchApi("/portal/v1/notifications");
        if (!active) return;
        const data = unwrap(res);
        setItems(data?.items || []);
        setUnread(Number(data?.unread) || (data?.items || []).length || 0);
      } catch {
        if (active) {
          setItems([]);
          setUnread(0);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function onDoc(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 flex min-h-[64px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center gap-2.5 text-sm text-slate-500">
        <button
          type="button"
          className="mr-1 grid h-10 w-10 place-items-center rounded-lg border border-slate-200 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Link to="/portal" className="text-slate-400 hover:text-slate-600">MBO Rewards Client Portal</Link>
        {pageTitle !== "Dashboard" && (
          <>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-700">{pageTitle}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </button>
          {open ? (
            <div className="absolute right-0 top-10 z-40 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                Notifications
              </div>
              {items.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-slate-400">No notifications yet.</p>
              ) : (
                <ul className="max-h-72 space-y-1 overflow-y-auto">
                  {items.map((n) => (
                    <li key={n.id} className="rounded-lg px-3 py-2.5 hover:bg-slate-50">
                      <div className="text-sm font-semibold text-slate-800">{n.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{n.body}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-1 border-t border-slate-100 px-2 pt-2">
                <Link
                  to="/portal/settings"
                  onClick={() => setOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Notification preferences
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        {clientName && (
          <div className="hidden items-center gap-2 text-sm sm:flex">
            <span className="font-semibold text-slate-800">{clientName}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{role}</span>
          </div>
        )}
      </div>
    </header>
  );
}
