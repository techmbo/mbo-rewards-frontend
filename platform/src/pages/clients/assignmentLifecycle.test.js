/**
 * P1 Client Module — assignment lifecycle labels (frontend surface).
 * Run: node --test frontend/src/pages/clients/assignmentLifecycle.test.js
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deriveAssignmentLifecycle,
  deriveEligibilityLifecycle,
  commercialDisplayLabel,
} from "./assignmentLifecycle.js";

describe("deriveAssignmentLifecycle", () => {
  it("ASSIGNED is not client-visible", () => {
    const life = deriveAssignmentLifecycle({ status: "ASSIGNED", published: false });
    assert.equal(life.code, "ASSIGNED");
    assert.equal(life.clientVisible, false);
  });

  it("CLIENT_VISIBLE requires published + ACTIVE + tracking or coupon", () => {
    const life = deriveAssignmentLifecycle({
      status: "ACTIVE",
      published: true,
      hasTrackingUrl: true,
      commissionRuleStatus: "EFFECTIVE",
    });
    assert.equal(life.code, "CLIENT_VISIBLE");
    assert.equal(life.clientVisible, true);
  });

  it("published alone without tracking/coupon is not CLIENT_VISIBLE", () => {
    const life = deriveAssignmentLifecycle({
      status: "ACTIVE",
      published: true,
      hasTrackingUrl: false,
      couponAssigned: false,
      commissionRuleStatus: "EFFECTIVE",
    });
    assert.notEqual(life.code, "CLIENT_VISIBLE");
    assert.equal(life.clientVisible, false);
  });

  it("PROVISIONED when commission+tracking ready but not published", () => {
    const life = deriveAssignmentLifecycle({
      status: "ACTIVE",
      published: false,
      hasTrackingUrl: true,
      commissionRuleStatus: "EFFECTIVE",
    });
    assert.equal(life.code, "PROVISIONED");
    assert.equal(life.clientVisible, false);
  });

  it("TRACKING_READY when tracking present but commission not EFFECTIVE", () => {
    const life = deriveAssignmentLifecycle({
      status: "ASSIGNED",
      published: false,
      hasTrackingUrl: true,
      commissionRuleStatus: "DRAFT",
    });
    assert.equal(life.code, "TRACKING_READY");
  });

  it("PAUSED and REVOKED", () => {
    assert.equal(deriveAssignmentLifecycle({ status: "PAUSED" }).code, "PAUSED");
    assert.equal(deriveAssignmentLifecycle({ status: "REVOKED" }).code, "REVOKED");
  });

  it("COMMISSION_READY when EFFECTIVE but no tracking/coupon", () => {
    const life = deriveAssignmentLifecycle({
      status: "ASSIGNED",
      published: false,
      commissionRuleStatus: "EFFECTIVE",
      hasTrackingUrl: false,
    });
    assert.equal(life.code, "COMMISSION_READY");
    assert.equal(life.clientVisible, false);
  });
});

describe("deriveEligibilityLifecycle", () => {
  it("eligible catalog row", () => {
    const life = deriveEligibilityLifecycle({ eligibilityOk: true, isAssignable: true });
    assert.equal(life.code, "ELIGIBLE");
  });

  it("blocked ineligible row", () => {
    const life = deriveEligibilityLifecycle({
      eligibilityOk: false,
      isAssignable: false,
      issue: "Merchant not joined",
    });
    assert.equal(life.code, "BLOCKED");
    assert.match(life.issue || "", /Merchant/);
  });
});

describe("commercialDisplayLabel", () => {
  it("labels estimates only — no fabricated payable", () => {
    assert.match(commercialDisplayLabel("OFFERS_ONLY"), /0%/);
    assert.match(commercialDisplayLabel("OFFERS_PLUS_COMMISSION", 70), /estimate/i);
    assert.equal(commercialDisplayLabel(null), "Not configured");
  });
});
