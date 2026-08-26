import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasAnyPermission } from "../auth/permissions";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ permissions = [], children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-8">
        <p className="text-slate-600">Loading session...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  if (user?.role === "CLIENT") {
    const onPortal = location.pathname.startsWith("/portal");
    if (!onPortal && location.pathname !== "/profile") {
      return <Navigate replace to="/portal" />;
    }
  }

  if (permissions.length > 0 && !hasAnyPermission(user, permissions)) {
    return <Navigate replace to={user?.role === "CLIENT" ? "/portal" : "/"} />;
  }

  if (children) {
    return children;
  }

  return <Outlet />;
}
