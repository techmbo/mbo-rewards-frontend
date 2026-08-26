/**
 * Semantic icon keys → Google Material Symbols Outlined names.
 * @see https://fonts.google.com/icons
 */
export const NAV_ICON_MAP = {
  overview: "dashboard",
  campaigns: "campaign",
  networks: "hub",
  data: "database",
  brands: "storefront",
  master: "inventory_2",
  review: "fact_check",
  alerts: "notifications",
  clients: "groups",
  assignments: "assignment_turned_in",
  performance: "monitoring",
  reports: "summarize",
  clicks: "ads_click",
  conversions: "check_circle",
  links: "link",
  orders: "receipt_long",
  payments: "payments",
  withdrawals: "account_balance_wallet",
  finance: "account_balance",
  products: "inventory_2",
  rules: "percent",
  coupons: "sell",
  issues: "error",
  sync: "sync",
  health: "monitor_heart",
  quality: "verified",
  users: "manage_accounts",
  integrations: "extension",
  logs: "history",
  support: "support_agent",
  settings: "settings",
  products_alt: "inventory_2",
  description: "menu_book",
  guide: "menu_book",
};

/** Common UI action icons */
export const UI_ICONS = {
  menu: "menu",
  close: "close",
  search: "search",
  notifications: "notifications",
  chevronLeft: "chevron_left",
  chevronRight: "chevron_right",
  expand: "keyboard_double_arrow_right",
  collapse: "keyboard_double_arrow_left",
  check: "check",
  copy: "content_copy",
  openInNew: "open_in_new",
  warning: "warning",
  cancel: "cancel",
  add: "add",
  mail: "mail",
  description: "description",
  person: "person",
  trendingUp: "trending_up",
  schedule: "schedule",
  logout: "logout",
};

export function resolveMaterialIcon(nameOrKey) {
  if (!nameOrKey) return "circle";
  const key = String(nameOrKey);
  return NAV_ICON_MAP[key] || UI_ICONS[key] || key;
}
