/**
 * P1.7 Wave 2 — Client Catalog presentation helpers.
 * Run: node --test frontend/src/pages/clients/catalogHelpers.test.js
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAllocationQuery,
  catalogPrimaryAction,
  channelLabel,
  commercialModelLabel,
  countryDisplay,
  currencyDisplay,
  eligibilityPresentation,
  emptyCatalogMessage,
  offerDisplay,
  parseAllocationListResponse,
  relationshipPresentation,
  supplierCommissionDisplay,
} from "./catalogHelpers.js";
import { deriveEligibilityLifecycle } from "./assignmentLifecycle.js";

describe("parseAllocationListResponse", () => {
  it("reads nested data.items + client (Wave 2 shape)", () => {
    const parsed = parseAllocationListResponse({
      ok: true,
      data: { items: [{ id: "1" }], client: { id: "c1", name: "Hello" }, summary: { pageEligible: 1 } },
      pagination: { page: 1, total: 1 },
    });
    assert.equal(parsed.items.length, 1);
    assert.equal(parsed.client.name, "Hello");
    assert.equal(parsed.summary.pageEligible, 1);
  });

  it("does not treat API error payload as empty success", () => {
    const parsed = parseAllocationListResponse(null);
    assert.equal(parsed.error, true);
    assert.deepEqual(parsed.items, []);
  });
});

describe("commercial vs channel", () => {
  it("keeps commercial model separate from channel", () => {
    const row = {
      campaignType: "CPS",
      commercialModel: "CPS",
      channelType: "COUPON_LINK",
      channels: { link: true, coupon: true, deeplink: false },
    };
    assert.equal(commercialModelLabel(row), "CPS");
    assert.equal(channelLabel(row), "Link + Coupon");
    assert.notEqual(commercialModelLabel(row), channelLabel(row));
  });

  it("does not treat LINK as commercial model", () => {
    assert.equal(commercialModelLabel({ campaignType: "LINK", channelType: "LINK" }), "—");
  });
});

describe("relationship + eligibility", () => {
  it("maps UNKNOWN relationship to Needs review", () => {
    const rel = relationshipPresentation({ relationshipStatus: "UNKNOWN" });
    assert.equal(rel.code, "NEEDS_REVIEW");
    assert.equal(rel.label, "Needs review");
  });

  it("shows JOINED relationship", () => {
    const rel = relationshipPresentation({ relationshipStatus: "JOINED" });
    assert.equal(rel.code, "JOINED");
  });

  it("shows eligibility reason for blocked rows", () => {
    const elig = eligibilityPresentation({
      eligibilityOk: false,
      isAssignable: false,
      allocationState: "BLOCKED",
      issue: "Currency mismatch",
      eligibilityLabels: ["Currency mismatch", "Other"],
    });
    assert.equal(elig.code, "BLOCKED");
    assert.equal(elig.label, "Blocked");
    assert.equal(elig.primaryReason, "Currency mismatch");
  });

  it("already assigned is not Assignable action", () => {
    const action = catalogPrimaryAction(
      { allocationState: "ASSIGNED", assignmentId: "a1", isAssignable: false },
      { canManage: true },
    );
    assert.equal(action.kind, "assigned");
    assert.equal(action.allowAssign, false);
  });

  it("eligible shows Assign when canManage", () => {
    const action = catalogPrimaryAction(
      { isAssignable: true, eligibilityOk: true, allocationState: "AVAILABLE" },
      { canManage: true },
    );
    assert.equal(action.kind, "assign");
    assert.equal(action.allowAssign, true);
  });

  it("blocked does not show Assign", () => {
    const action = catalogPrimaryAction(
      {
        isAssignable: false,
        eligibilityOk: false,
        allocationState: "BLOCKED",
        issue: "Campaign inactive",
      },
      { canManage: true },
    );
    assert.equal(action.allowAssign, false);
    assert.equal(action.kind, "reason");
  });
});

describe("commission + offer + nulls", () => {
  it("uses backend commission text and does not invent 0%", () => {
    assert.equal(supplierCommissionDisplay({}).label, "Not available");
    assert.equal(
      supplierCommissionDisplay({ campaignCommission: "5%", commissionRuleCount: 1 }).label,
      "5% · 1 rule",
    );
    assert.equal(supplierCommissionDisplay({ campaignCommission: "0%" }).label, "0%");
  });

  it("never uses campaign name as offer", () => {
    assert.equal(
      offerDisplay({ campaignName: "Klook Staycation", coupon: { discount: "Klook Staycation" } }),
      "Not available",
    );
    assert.equal(offerDisplay({ campaignName: "Klook Staycation" }), "Not available");
    assert.equal(offerDisplay({ coupon: { discount: "20% OFF" } }), "20% OFF");
  });

  it("missing country/currency remain em dash", () => {
    assert.equal(countryDisplay(null), "—");
    assert.equal(countryDisplay([]), "—");
    assert.equal(countryDisplay(["AE", "SA"]), "AE, SA");
    assert.equal(
      countryDisplay(["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AR"]),
      "All",
    );
    assert.equal(currencyDisplay(null), "—");
  });
});

describe("filters sent to backend", () => {
  it("buildAllocationQuery maps UI filters to API params", () => {
    const q = buildAllocationQuery({
      page: 2,
      mode: "available",
      filters: {
        search: "klook",
        network: "OPTIMISE",
        commercialModel: "CPS",
        channel: "COUPON_LINK",
        country: "IN",
        currency: "INR",
        relationship: "JOINED",
        eligibility: "ELIGIBLE",
      },
    });
    assert.equal(q.page, 2);
    assert.equal(q.search, "klook");
    assert.equal(q.network, "OPTIMISE");
    assert.equal(q.commercialModel, "CPS");
    assert.equal(q.channel, "COUPON_LINK");
    assert.equal(q.country, "IN");
    assert.equal(q.currency, "INR");
    assert.equal(q.relationship, "JOINED");
    assert.equal(q.eligibility, "ELIGIBLE");
    assert.equal(q.assignmentStatus, "AVAILABLE");
  });

  it("available mode defaults eligibility to ELIGIBLE", () => {
    const q = buildAllocationQuery({ page: 1, mode: "available", filters: {} });
    assert.equal(q.assignmentStatus, "AVAILABLE");
    assert.equal(q.eligibility, "ELIGIBLE");
  });
});

describe("empty vs error messaging", () => {
  it("differentiates error from empty assigned", () => {
    assert.match(emptyCatalogMessage("assigned", { hasError: true }), /Unable to load/);
    assert.match(emptyCatalogMessage("assigned", { hasError: false }), /No campaigns are assigned/);
  });
});

describe("assignment lifecycle projection from catalog row", () => {
  it("uses assignmentStatus + published from list row", () => {
    const life = deriveEligibilityLifecycle({
      allocationState: "ASSIGNED",
      assignmentStatus: "ACTIVE",
      assignmentPublished: true,
      hasTrackingUrl: true,
      couponAssigned: true,
    });
    assert.equal(life.code, "CLIENT_VISIBLE");
    assert.equal(life.clientVisible, true);
  });

  it("does not label Assigned as Active", () => {
    const life = deriveEligibilityLifecycle({
      allocationState: "ASSIGNED",
      assignmentStatus: "ASSIGNED",
      assignmentPublished: false,
    });
    assert.equal(life.code, "ASSIGNED");
    assert.notEqual(life.label, "Active");
  });
});
