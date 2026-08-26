import { useEffect } from "react";
import { warmNavigationCache } from "../navigationCache";

/** Fire once after login — preload every route chunk and list API in parallel. */
export function useNavigationWarmup(user) {
  useEffect(() => {
    if (!user) return;
    warmNavigationCache({ isPortal: user.role === "CLIENT" });
  }, [user]);
}
