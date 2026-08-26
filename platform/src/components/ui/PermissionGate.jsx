import { hasAnyPermission } from "../../auth/permissions";

export function PermissionGate({ user, permissions = [], fallback = null, children }) {
  if (!hasAnyPermission(user, permissions)) return fallback;
  return children;
}
