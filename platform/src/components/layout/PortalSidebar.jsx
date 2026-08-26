import { NavLink, useLocation } from "react-router-dom";
import { PLATFORM_NAME } from "../../config/brand";
import { PORTAL_NAV } from "../../config/navigation";
import { useAuth } from "../../context/AuthContext";
import { prefetchOnIntent } from "../../routes/routePrefetch";

const NAV_ICONS = {
  overview: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  campaigns: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  performance: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  payments: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  withdrawals: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  finance: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  ),
};

function NavIcon({ name }) {
  return NAV_ICONS[name] || (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export function PortalSidebar({ open, onClose, client }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const clientName = client?.name || user?.clientName || "Your Organisation";
  const clientCode = client?.clientCode || client?.slug || "Client Account";

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] shrink-0 flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-sm font-black text-white shadow-sm">
            M
          </div>
          <div>
            <strong className="block text-base font-bold text-slate-900 leading-tight">MBO Rewards</strong>
            <span className="text-xs text-slate-400">Client Portal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {PORTAL_NAV.map((item) => {
            const end = item.path === "/portal";
            const active = end
              ? pathname === item.path
              : pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={end}
                onClick={onClose}
                onMouseEnter={() => prefetchOnIntent(item.path)}
                onFocus={() => prefetchOnIntent(item.path)}
                onMouseDown={() => prefetchOnIntent(item.path)}
                onTouchStart={() => prefetchOnIntent(item.path)}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className={active ? "text-blue-600" : "text-slate-400"}>
                  <NavIcon name={item.icon} />
                </span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Client info at bottom */}
        <div className="border-t border-slate-100 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {String(clientName).slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-sm font-semibold text-slate-800">{clientName}</strong>
              <span className="text-xs text-slate-400">{clientCode}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
