import { useState } from "react";
import { Link } from "react-router-dom";
import { ROLE_LABELS } from "../../auth/permissions";
import { useAuth } from "../../context/AuthContext";
import { Breadcrumbs } from "./Breadcrumbs";
import { GlobalSearch } from "./GlobalSearch";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

export function TopNav({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Icon name="menu" size={20} />
          </Button>
          <div className="hidden min-w-0 md:block">
            <Breadcrumbs />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <GlobalSearch />
          <button
            type="button"
            className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600"
            title="Notifications"
            aria-label="Notifications"
          >
            <Icon name="notifications" size={18} />
          </button>
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              onClick={() => setProfileOpen((v) => !v)}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800">
                {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-left md:block">
                <span className="block font-medium text-slate-900">{user?.name || user?.email}</span>
                <span className="block text-xs text-slate-500">{ROLE_LABELS[user?.role] || user?.role}</span>
              </span>
            </button>
            {profileOpen && (
              <>
                <button type="button" className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  <Link to="/profile" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                    Profile
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-slate-50"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                  >
                    <Icon name="logout" size={16} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
