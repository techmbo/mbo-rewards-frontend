import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { fetchApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useNavigationWarmup } from "../../hooks/useNavigationWarmup";
import { PortalSidebar } from "./PortalSidebar";
import { PortalTopBar } from "./PortalTopBar";
import { unwrap } from "../../pages/portal/portalUtils";

export function PortalShell() {
  const { user } = useAuth();
  useNavigationWarmup(user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [client, setClient] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const { pathname } = useLocation();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetchApi("/portal/v1/me");
        if (!active) return;
        const data = unwrap(res);
        setClient(data?.client || null);
      } catch {
        if (active) setClient(null);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setUpdatedAt(new Date().toISOString());
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <PortalSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} client={client} />
      <div className="flex min-h-screen min-w-0 flex-col">
        <PortalTopBar pathname={pathname} onMenuClick={() => setMobileOpen(true)} client={client} />
        <main className="portal-content mx-auto w-full max-w-[1650px] flex-1 px-5 pb-14 pt-7 text-sm md:px-8">
          <Outlet context={{ client, setClient, updatedAt }} />
        </main>
      </div>
    </div>
  );
}
