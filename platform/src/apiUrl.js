/**
 * Centralized API URL joining — never produce /api/api/...
 * Pure helpers (no Vite / browser deps) so Node can unit-test them.
 */

export function resolveApiBaseUrl(raw, { origin = null } = {}) {
  const value = String(raw ?? "").trim().replace(/\/+$/, "");
  if (!value) {
    throw new Error(
      "Missing VITE_API_BASE_URL. Set it to your backend URL including /api (e.g. https://your-api.example.com/api).",
    );
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  if (value.startsWith("/")) {
    const baseOrigin =
      origin ||
      (typeof window !== "undefined" && window.location?.origin ? window.location.origin : null);
    if (baseOrigin) {
      return `${baseOrigin}${value}`.replace(/\/+$/, "");
    }
    throw new Error(
      "VITE_API_BASE_URL is a relative path; use a full URL (https://...) for production builds.",
    );
  }

  return `https://${value}`;
}

/**
 * Join API base + path without double /api prefix.
 */
export function joinApiPath(baseUrl, path) {
  const base = String(baseUrl || "").trim().replace(/\/+$/, "");
  let p = String(path || "").trim();

  if (!base) {
    throw new Error("API base URL is required.");
  }

  if (/^https?:\/\//i.test(p)) {
    const absolute = new URL(p);
    absolute.pathname = absolute.pathname.replace(/\/api\/+api(\/|$)/gi, "/api$1");
    return { href: absolute.toString(), pathname: absolute.pathname };
  }

  p = p.replace(/^\/+/, "");

  const baseEndsWithApi = /\/api$/i.test(base);
  if (baseEndsWithApi && /^api(\/|$)/i.test(p)) {
    p = p.replace(/^api\/?/i, "");
  }

  const url = new URL(p, `${base}/`);
  url.pathname = url.pathname.replace(/\/api\/+api(\/|$)/gi, "/api$1");
  return { href: url.toString(), pathname: url.pathname };
}

export function buildUrl(baseUrl, path, params = {}) {
  const { href } = joinApiPath(baseUrl, path);
  const url = new URL(href);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

/** Canonical workbook client campaign catalog (06C). Relative to API base. */
export const CLIENT_API = {
  account: "/v1/client/account",
  campaigns: "/v1/client/campaigns",
  campaign: (id) => `/v1/client/campaigns/${encodeURIComponent(id)}`,
  performance: "/v1/client/performance",
  performanceSummary: "/v1/client/performance/summary",
  performanceCampaigns: "/v1/client/performance/campaigns",
  performanceAffiliateLinks: "/v1/client/performance/affiliate-links",
  performanceCoupons: "/v1/client/performance/coupons",
  performanceOrders: "/v1/client/performance/orders",
  orders: "/v1/client/orders",
  payments: "/v1/client/payments",
  payouts: "/v1/client/payouts",
  statements: "/v1/client/statements",
  statement: (id) => `/v1/client/statements/${encodeURIComponent(id)}`,
  withdrawalRequests: "/v1/client/withdrawal-requests",
  products: "/v1/client/products",
};
