export const PERMISSIONS = {
  CAMPAIGNS_READ: "campaigns:read",
  PERFORMANCE_READ: "performance:read",
  PAYMENTS_READ: "payments:read",
  CONVERSIONS_READ: "conversions:read",
  COMMISSION_READ: "commission:read",
  EXPORT_DATA: "export:data",
  INTEGRATIONS_READ: "integrations:read",
  INTEGRATIONS_MANAGE: "integrations:manage",
  SYNC_TRIGGER: "sync:trigger",
  USERS_MANAGE: "users:manage",
  LOGS_READ: "logs:read",
  SYSTEM_READ: "system:read",
  COUPONS_READ: "coupons:read",
  COUPONS_WRITE: "coupons:write",
  COUPON_COLUMNS_MANAGE: "coupon_columns:manage",
  MERCHANTS_READ: "merchants:read",
  MERCHANTS_MANAGE: "merchants:manage",
  CATALOG_READ: "catalog:read",
  CATALOG_MANAGE: "catalog:manage",
  CLIENTS_READ: "clients:read",
  CLIENTS_MANAGE: "clients:manage",
  TRACKING_READ: "tracking:read",
  TRACKING_MANAGE: "tracking:manage",
  COUPON_ASSIGN_READ: "coupon:read",
  COUPON_ASSIGN_MANAGE: "coupon:manage",
  COMMISSION_MANAGE: "commission:manage",
  OPS_READ: "ops:read",
  OPS_MANAGE: "ops:manage",
  EXCEPTIONS_READ: "exceptions:read",
  EXCEPTIONS_MANAGE: "exceptions:manage",
  FINANCE_OPS_READ: "finance_ops:read",
  PRODUCTS_READ: "products:read",
  PORTAL_CAMPAIGNS_READ: "portal:campaigns:read",
  PORTAL_PERFORMANCE_READ: "portal:performance:read",
  PORTAL_PAYMENTS_READ: "portal:payments:read",
  PORTAL_PAYMENTS_MANAGE: "portal:payments:manage",
  PORTAL_SETTINGS_READ: "portal:settings:read",
  PORTAL_SUPPORT: "portal:support",
};

export const ROLE_LABELS = {
  ADMIN: "Admin",
  OPERATIONS: "Operations",
  ANALYST: "Analyst",
  TECH: "Tech",
  SUPPORT: "Support",
  CLIENT: "Client",
};

export function hasPermission(user, permission) {
  return Boolean(user?.permissions?.includes(permission));
}

export function hasAnyPermission(user, permissions = []) {
  if (!permissions.length) return true;
  return permissions.some((permission) => hasPermission(user, permission));
}

export function canViewCommission(user) {
  return (
    hasPermission(user, PERMISSIONS.COMMISSION_READ) ||
    hasPermission(user, PERMISSIONS.COMMISSION_MANAGE) ||
    user?.role === "ADMIN"
  );
}

