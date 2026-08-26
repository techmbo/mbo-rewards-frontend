/**
 * P1.7 Wave 4 — activation helper presentation tests.
 * Run: node --test frontend/src/pages/clients/activationHelpers.test.js
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  activationSummaryCounts,
  buildAssignmentActivationChecklist,
  collectAssignmentBlockers,
  normalizeActivationBlocks,
  readinessPresentation,
  buildV5ActivationChecks,
} from "./activationHelpers.js";

const client = {
  status: "ACTIVE",
  country: "IN",
  currency: "INR",
  commercialModel: "OFFERS_PLUS_COMMISSION",
  clientSharePercent: 70,
};

function baseRow(overrides = {}) {
  return {
    id: "a1",
    status: "ASSIGNED",
    published: false,
    assignmentStatus: "ASSIGNED",
    commissionRuleStatus: null,
    hasTrackingUrl: false,
    couponAssigned: false,
    relationshipStatus: "JOINED",
    merchantId: "m1",
    campaignStatus: "ACTIVE",
    campaignCountries: ["IN"],
    campaignCurrency: "INR",
    channels: { link: true, coupon: false, deeplink: false },
    ...overrides,
  };
}

describe("activation checklist + readiness", () => {
  it("currency mismatch is blocked", () => {
    const row = baseRow({
      campaignCurrency: "USD",
      commissionRuleStatus: "EFFECTIVE",
      hasTrackingUrl: true,
      assignmentStatus: "PROVISIONED",
    });
    const checks = buildAssignmentActivationChecklist(row, client);
    const currency = checks.find((c) => c.code === "CURRENCY_COMPAT");
    assert.equal(currency.status, "blocked");
    assert.match(currency.explanation, /INR/);
    assert.match(currency.explanation, /USD/);
    assert.equal(readinessPresentation(row, client).code, "BLOCKED");
  });

  it("missing commission is blocked", () => {
    const row = baseRow({ commissionRuleStatus: null, hasTrackingUrl: true });
    const blockers = collectAssignmentBlockers(row, client);
    assert.ok(blockers.some((b) => b.code === "COMMISSION_RULE"));
  });

  it("missing tracking is pending/blocked correctly", () => {
    const row = baseRow({
      commissionRuleStatus: "EFFECTIVE",
      hasTrackingUrl: false,
      assignmentStatus: "COMMISSION_READY",
      provisioning: { code: "TRACKING_PENDING" },
    });
    const tracking = buildAssignmentActivationChecklist(row, client).find((c) => c.code === "TRACKING");
    assert.equal(tracking.status, "pending");
  });

  it("relationship unknown → needs review", () => {
    const row = baseRow({
      relationshipStatus: "UNKNOWN",
      commissionRuleStatus: "EFFECTIVE",
      hasTrackingUrl: true,
    });
    const rel = buildAssignmentActivationChecklist(row, client).find((c) => c.code === "RELATIONSHIP");
    assert.equal(rel.status, "needs_review");
  });

  it("merchant missing → needs review", () => {
    const row = baseRow({ merchantId: null, commissionRuleStatus: "EFFECTIVE", hasTrackingUrl: true });
    const m = buildAssignmentActivationChecklist(row, client).find((c) => c.code === "MERCHANT_LINKED");
    assert.equal(m.status, "needs_review");
  });

  it("already published + visible → client visible", () => {
    const row = baseRow({
      status: "ACTIVE",
      published: true,
      assignmentStatus: "CLIENT_VISIBLE",
      commissionRuleStatus: "EFFECTIVE",
      hasTrackingUrl: true,
    });
    assert.equal(readinessPresentation(row, client).code, "CLIENT_VISIBLE");
  });

  it("revoked cannot activate", () => {
    assert.equal(readinessPresentation(baseRow({ status: "REVOKED" }), client).code, "REVOKED");
  });

  it("paused state", () => {
    assert.equal(readinessPresentation(baseRow({ status: "PAUSED" }), client).code, "PAUSED");
  });

  it("does not invent coupon discount from campaign name", () => {
    const checks = buildAssignmentActivationChecklist(
      baseRow({ canonicalCampaign: { displayName: "20% OFF Staycation" }, couponAssigned: false }),
      client,
    );
    const coupon = checks.find((c) => c.code === "COUPON");
    assert.equal(coupon.status, "not_required");
  });
});

describe("activation blocks + summary", () => {
  it("normalizes 409 ACTIVATION_BLOCKED structured details", () => {
    const blocks = normalizeActivationBlocks(["Commercial model"], [
      { code: "COMMERCIAL_MISSING", message: "Commercial model is not configured.", severity: "blocked" },
    ]);
    assert.equal(blocks[0].code, "COMMERCIAL_MISSING");
    assert.match(blocks[0].message, /Commercial/);
  });

  it("summary counts are assignment-scoped", () => {
    const counts = activationSummaryCounts(
      [
        baseRow({ assignmentStatus: "CLIENT_VISIBLE", status: "ACTIVE", published: true, hasTrackingUrl: true, commissionRuleStatus: "EFFECTIVE" }),
        baseRow({ id: "a2", assignmentStatus: "PROVISIONED", status: "ACTIVE", published: false, hasTrackingUrl: true, commissionRuleStatus: "EFFECTIVE" }),
        baseRow({ id: "a3", campaignCurrency: "USD", commissionRuleStatus: "EFFECTIVE", hasTrackingUrl: true }),
      ],
      client,
    );
    assert.equal(counts.totalAssigned, 3);
    assert.equal(counts.clientVisible, 1);
    assert.equal(counts.provisioned, 1);
    assert.equal(counts.blocked, 1);
  });
});

describe("v5 activation review checks", () => {
  it("marks API checks not required for Portal Only", () => {
    const { checks, blocked } = buildV5ActivationChecks({
      client: {
        name: "ICICI Bank",
        country: "IN",
        deliveryMethod: "PORTAL_ONLY",
        agreementStatus: "SIGNED",
        commercialModel: "CPS",
      },
      checklist: {
        agreementSigned: true,
        commercialConfigured: true,
        assignmentsPublished: true,
        sandboxConfigured: false,
        apiKeyIssued: false,
        administratorConfigured: true,
        needsApi: false,
        needsPortal: true,
      },
      assignments: [{ id: "a1", status: "ACTIVE", published: true }],
      apiKeys: [],
      portalUsers: [{ id: "u1", isActive: true }],
    });
    const sandbox = checks.find((c) => c.title === "Sandbox API");
    const production = checks.find((c) => c.title === "Production API");
    const portal = checks.find((c) => c.title === "Portal Admin");
    assert.equal(sandbox.status, "not_required");
    assert.equal(production.status, "not_required");
    assert.equal(portal.status, "passed");
    assert.equal(blocked, false);
  });

  it("blocks when production API is required but missing", () => {
    const { checks, blocked } = buildV5ActivationChecks({
      client: {
        name: "ICICI Bank",
        country: "IN",
        deliveryMethod: "API_AND_PORTAL",
        agreementStatus: "SIGNED",
        commercialModel: "CPS",
      },
      checklist: {
        agreementSigned: true,
        commercialConfigured: true,
        assignmentsPublished: true,
        sandboxConfigured: true,
        apiKeyIssued: false,
        administratorConfigured: true,
        needsApi: true,
        needsPortal: true,
      },
      assignments: [{ id: "a1", status: "ACTIVE", published: true }],
      apiKeys: [{ environment: "SANDBOX", isActive: true }],
      portalUsers: [{ id: "u1", isActive: true }],
    });
    const production = checks.find((c) => c.title === "Production API");
    assert.equal(production.status, "pending");
    assert.match(production.description, /Production must be active/);
    assert.equal(blocked, true);
  });

  it("uses live assignment / key counts in descriptions", () => {
    const { checks } = buildV5ActivationChecks({
      client: {
        name: "HDFC Bank",
        country: "IN",
        currency: "INR",
        deliveryMethod: "API_AND_PORTAL",
        agreementStatus: "SIGNED",
        commercialModel: "OFFERS_PLUS_COMMISSION",
        clientSharePercent: 70,
      },
      checklist: {
        agreementSigned: true,
        commercialConfigured: true,
        assignmentsPublished: true,
        sandboxConfigured: true,
        apiKeyIssued: true,
        administratorConfigured: true,
        needsApi: true,
        needsPortal: true,
      },
      assignments: [
        { id: "a1", status: "ACTIVE", published: true },
        { id: "a2", status: "ACTIVE", published: true },
        { id: "a3", status: "REVOKED", published: true },
      ],
      apiKeys: [
        { environment: "SANDBOX", isActive: true },
        { environment: "PRODUCTION", isActive: true },
      ],
      portalUsers: [{ id: "u1", isActive: true }, { id: "u2", isActive: false }],
    });
    assert.match(checks.find((c) => c.title === "Campaigns").description, /2 published of 2/);
    assert.match(checks.find((c) => c.title === "Sandbox API").description, /1 active sandbox/);
    assert.match(checks.find((c) => c.title === "Production API").description, /1 active production/);
    assert.match(checks.find((c) => c.title === "Portal Admin").description, /1 active portal/);
  });
});
