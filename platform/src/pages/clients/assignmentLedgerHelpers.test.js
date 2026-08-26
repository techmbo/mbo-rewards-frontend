/**
 * P1.7 Wave 3 — assignment ledger helpers.
 * Run: node --test frontend/src/pages/clients/assignmentLedgerHelpers.test.js
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAssignmentListQuery,
  channelLabel,
  commercialModelLabel,
  couponPresentation,
  emptyAssignmentsMessage,
  ledgerLifecycle,
  ledgerPrimaryAction,
  pageScopedLifecycleCounts,
  trackingPresentation,
} from "./assignmentLedgerHelpers.js";

describe("ledger lifecycle projection", () => {
  it("Assigned != Published / Client visible", () => {
    const life = ledgerLifecycle({
      status: "ASSIGNED",
      published: false,
      assignmentStatus: "ASSIGNED",
    });
    assert.equal(life.code, "ASSIGNED");
    assert.equal(life.clientVisible, false);
  });

  it("CLIENT_VISIBLE only when backend/projection says so", () => {
    const life = ledgerLifecycle({
      status: "ACTIVE",
      published: true,
      hasTrackingUrl: true,
      commissionRuleStatus: "EFFECTIVE",
      assignmentStatus: "CLIENT_VISIBLE",
    });
    assert.equal(life.code, "CLIENT_VISIBLE");
    assert.equal(life.clientVisible, true);
  });

  it("does not upgrade PROVISIONED when published=false", () => {
    const life = ledgerLifecycle({
      status: "ACTIVE",
      published: false,
      hasTrackingUrl: true,
      commissionRuleStatus: "EFFECTIVE",
      assignmentStatus: "PROVISIONED",
    });
    assert.equal(life.code, "PROVISIONED");
    assert.equal(life.clientVisible, false);
  });

  it("Commission ready / Tracking ready / Paused / Revoked", () => {
    assert.equal(
      ledgerLifecycle({
        status: "ASSIGNED",
        commissionRuleStatus: "EFFECTIVE",
        assignmentStatus: "COMMISSION_READY",
      }).code,
      "COMMISSION_READY",
    );
    assert.equal(
      ledgerLifecycle({
        status: "ASSIGNED",
        hasTrackingUrl: true,
        assignmentStatus: "TRACKING_READY",
      }).code,
      "TRACKING_READY",
    );
    assert.equal(ledgerLifecycle({ status: "PAUSED", assignmentStatus: "PAUSED" }).code, "PAUSED");
    assert.equal(ledgerLifecycle({ status: "REVOKED", assignmentStatus: "REVOKED" }).code, "REVOKED");
  });
});

describe("tracking vs assignment independence", () => {
  it("COMMISSION_READY can still have tracking Pending", () => {
    const row = {
      status: "ASSIGNED",
      published: false,
      commissionRuleStatus: "EFFECTIVE",
      hasTrackingUrl: false,
      assignmentStatus: "COMMISSION_READY",
      provisioning: { code: "TRACKING_PENDING" },
    };
    assert.equal(ledgerLifecycle(row).code, "COMMISSION_READY");
    assert.equal(trackingPresentation(row).code, "PENDING");
  });
});

describe("coupon independence", () => {
  it("does not invent coupon from campaign name", () => {
    assert.equal(
      couponPresentation({
        canonicalCampaign: { displayName: "SAVE20 Deal" },
        couponAssigned: false,
      }).code,
      "NOT_AVAILABLE",
    );
    assert.equal(
      couponPresentation({ couponAssigned: true, couponCode: "SAVE20", couponStatus: "ACTIVE" }).code,
      "ASSIGNED",
    );
  });
});

describe("commercial vs channel", () => {
  it("keeps CPS separate from channel", () => {
    const row = { commercialModel: "CPS", channelType: "COUPON_LINK" };
    assert.equal(commercialModelLabel(row), "CPS");
    assert.equal(channelLabel(row), "Link + Coupon");
    assert.notEqual(commercialModelLabel(row), channelLabel(row));
  });
});

describe("actions + empty states + filters", () => {
  it("blocked/issue shows View issue; provisioned links to activate", () => {
    assert.equal(
      ledgerPrimaryAction({
        assignmentStatus: "COMMISSION_READY",
        status: "ASSIGNED",
        blocker: "Tracking pending",
      }).kind,
      "issue",
    );
    assert.equal(
      ledgerPrimaryAction(
        {
          assignmentStatus: "PROVISIONED",
          status: "ACTIVE",
          published: false,
          clientId: "c1",
          commissionRuleId: "rule-1",
          hasTrackingUrl: true,
          commissionRuleStatus: "EFFECTIVE",
        },
        { canManage: true },
      ).kind,
      "publish",
    );
  });

  it("publish-ready tracking row gets Publish, not only Provision link", () => {
    const action = ledgerPrimaryAction(
      {
        assignmentStatus: "TRACKING_READY",
        status: "ASSIGNED",
        published: false,
        hasTrackingUrl: true,
        trackingUrl: "https://mborewards.com/t/x",
        commissionRuleId: "rule-1",
        clientSharePercent: 70,
        clientFacing: {
          campaignName: "Nike",
          campaignType: "Affiliate Link",
          customerOffer: "10% Off",
          termsAndConditions: "T&C",
          expiry: "2026-12-01",
          countries: ["AE"],
          clientCommissionPercent: 70,
        },
        channelType: "LINK",
      },
      { canManage: true },
    );
    assert.equal(action.kind, "publish");
    assert.equal(action.label, "Publish");
  });

  it("not publish-ready tracking row still links to activation", () => {
    const action = ledgerPrimaryAction(
      {
        assignmentStatus: "TRACKING_READY",
        status: "ASSIGNED",
        published: false,
        hasTrackingUrl: true,
      },
      { canManage: true },
    );
    assert.equal(action.kind, "activate");
    assert.equal(action.label, "Provision");
  });

  it("API error message differs from empty", () => {
    assert.match(emptyAssignmentsMessage({ hasError: true }), /Unable to load/);
    assert.match(emptyAssignmentsMessage({ hasError: false }), /No assignments yet/);
  });

  it("buildAssignmentListQuery sends backend filters", () => {
    const q = buildAssignmentListQuery({
      search: "hello",
      network: "OPTIMISE",
      commercialModel: "CPS",
      channel: "LINK",
      lifecycle: "PROVISIONED",
      trackingStatus: "READY",
      published: "false",
    });
    assert.equal(q.search, "hello");
    assert.equal(q.network, "OPTIMISE");
    assert.equal(q.commercialModel, "CPS");
    assert.equal(q.channel, "LINK");
    assert.equal(q.lifecycle, "PROVISIONED");
    assert.equal(q.trackingStatus, "READY");
    assert.equal(q.published, "false");
  });

  it("page counts are page-scoped", () => {
    const counts = pageScopedLifecycleCounts([
      { assignmentStatus: "ASSIGNED", status: "ASSIGNED" },
      { assignmentStatus: "CLIENT_VISIBLE", status: "ACTIVE", published: true, hasTrackingUrl: true },
    ]);
    assert.equal(counts.total, 2);
    assert.equal(counts.ASSIGNED, 1);
    assert.equal(counts.CLIENT_VISIBLE, 1);
  });
});
