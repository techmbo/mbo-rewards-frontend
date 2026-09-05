/**
 * Portal vs external Client API route separation.
 *
 * The backend enforces delivery channels separately (API_ONLY / PORTAL_ONLY / API_AND_PORTAL):
 * external API clients call /v1/client/*, client portal screens must call /portal/v1/*.
 * Run from the platform directory: node --test src/portalApiRoutes.test.js
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { CLIENT_API, PORTAL_API, joinApiPath } from "./apiUrl.js";

function pageSource(name) {
  return readFileSync(fileURLToPath(new URL(`./pages/portal/${name}.jsx`, import.meta.url)), "utf8");
}

describe("CLIENT_API stays scoped to the external Client API", () => {
  it("every CLIENT_API route is under /v1/client/", () => {
    for (const [key, value] of Object.entries(CLIENT_API)) {
      const path = typeof value === "function" ? value("abc 1") : value;
      assert.match(path, /^\/v1\/client\//, key);
      assert.doesNotMatch(path, /^\/portal\//, key);
    }
    assert.equal(CLIENT_API.campaigns, "/v1/client/campaigns");
    assert.equal(CLIENT_API.campaign("c-1"), "/v1/client/campaigns/c-1");
    assert.equal(CLIENT_API.performance, "/v1/client/performance");
    assert.equal(CLIENT_API.orders, "/v1/client/orders");
    assert.equal(CLIENT_API.products, "/v1/client/products");
    assert.equal(CLIENT_API.payments, "/v1/client/payments");
  });
});

describe("PORTAL_API points at the portal delivery channel", () => {
  it("every PORTAL_API route is under /portal/v1/ and never /v1/client/", () => {
    for (const [key, value] of Object.entries(PORTAL_API)) {
      const path = typeof value === "function" ? value("abc 1") : value;
      assert.match(path, /^\/portal\/v1\//, key);
      assert.doesNotMatch(path, /\/v1\/client\//, key);
    }
  });

  it("exposes the verified portal routes", () => {
    assert.equal(PORTAL_API.campaigns, "/portal/v1/campaigns");
    assert.equal(PORTAL_API.campaign("asg 1"), "/portal/v1/campaigns/asg%201");
    assert.equal(PORTAL_API.performance, "/portal/v1/performance");
    assert.equal(PORTAL_API.orders, "/portal/v1/orders");
    assert.equal(PORTAL_API.products, "/portal/v1/products");
    assert.equal(PORTAL_API.paymentStatus, "/portal/v1/payment-status");
    assert.equal(PORTAL_API.payments, "/portal/v1/payments");
  });

  it("payment-status and payments remain distinct contracts", () => {
    assert.notEqual(PORTAL_API.paymentStatus, PORTAL_API.payments);
    assert.equal(PORTAL_API.paymentStatus, "/portal/v1/payment-status");
    assert.equal(PORTAL_API.payments, "/portal/v1/payments");
  });

  it("joins under the /api base without a double prefix", () => {
    assert.equal(joinApiPath("https://host.example/api", PORTAL_API.campaigns).pathname, "/api/portal/v1/campaigns");
    assert.equal(joinApiPath("https://host.example/api", PORTAL_API.paymentStatus).pathname, "/api/portal/v1/payment-status");
  });

  it("is re-exported by the api module next to CLIENT_API", () => {
    // api.js needs Vite's import.meta.env, so the re-export is checked at source level.
    const source = readFileSync(fileURLToPath(new URL("./api.js", import.meta.url)), "utf8");
    assert.match(source, /export \{[^}]*\bCLIENT_API\b[^}]*\bPORTAL_API\b[^}]*\}/);
  });
});

describe("client portal screens request the portal channel", () => {
  const cases = [
    { page: "PortalCampaignsPage", uses: ["PORTAL_API.campaigns", "PORTAL_API.campaign(", "PORTAL_API.performance"] },
    { page: "PortalPerformancePage", uses: ["PORTAL_API.performance", "PORTAL_API.orders"] },
    { page: "PortalProductsPage", uses: ["PORTAL_API.products"] },
    { page: "PortalPaymentStatusPage", uses: ["PORTAL_API.paymentStatus"] },
  ];

  for (const { page, uses } of cases) {
    it(`${page} uses PORTAL_API and never CLIENT_API`, () => {
      const source = pageSource(page);
      for (const token of uses) assert.ok(source.includes(token), `${page} must use ${token}`);
      assert.equal(source.includes("CLIENT_API"), false, `${page} must not import or use CLIENT_API`);
      // No request path may be hard-coded to the external Client API channel.
      assert.doesNotMatch(source, /fetchApi\(\s*["'`]\/v1\/client\//, `${page} must not fetch /v1/client/*`);
    });
  }

  it("PortalOrdersPage keeps the portal orders route", () => {
    const source = pageSource("PortalOrdersPage");
    assert.ok(source.includes('fetchApi("/portal/v1/orders"'));
    assert.equal(source.includes("/v1/client/"), false);
  });
});
