import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assignabilityOf,
  completenessOf,
  completenessOfAssignment,
  formatOffer,
  isAffiliateLinkType,
  masterCampaignCouponCode,
  masterCampaignLinkUrl,
  mergeFacing,
  assignmentAsCampaignRow,
  publishReadinessOf,
  publishReadinessOfAssignment,
  seedClientFacing,
  sourceTagForField,
} from "./masterCampaignHelpers.js";

describe("masterCampaignHelpers", () => {
  it("formats an offer from discount percent", () => {
    assert.equal(formatOffer({ discountPercent: 30 }), "30% Off");
  });

  it("maps coupon code and link url by campaign type", () => {
    const affiliate = {
      campaignChannelType: "AFFILIATE_LINK_ONLY",
      trackingUrl: "https://network.example/click/123",
      couponCode: null,
    };
    assert.equal(isAffiliateLinkType(affiliate), true);
    assert.equal(masterCampaignLinkUrl(affiliate), "https://network.example/click/123");
    assert.equal(masterCampaignCouponCode(affiliate), null);

    const coupon = {
      campaignChannelType: "COUPON",
      campaignType: "COUPON",
      couponCode: "SAVE20",
      trackingUrl: "https://network.example/click/456",
    };
    assert.equal(masterCampaignCouponCode(coupon), "SAVE20");
    assert.equal(masterCampaignLinkUrl(coupon), null);

    const both = {
      campaignChannelType: "COUPON_LINK",
      couponCode: "SAVE10",
      trackingUrl: "https://network.example/click/789",
    };
    assert.equal(masterCampaignCouponCode(both), "SAVE10");
    assert.equal(masterCampaignLinkUrl(both), "https://network.example/click/789");
  });

  it("treats operator overrides as the assignment copy, not the network base", () => {
    const { network, merged } = mergeFacing(
      { campaignName: "Network name", campaignDescription: "From network" },
      { campaignName: "Client name" },
    );
    assert.equal(network.campaignName, "Network name");
    assert.equal(merged.campaignName, "Client name");
    assert.equal(merged.offerDescription, "From network");
  });

  it("marks T&C missing when neither network nor override has terms", () => {
    const result = completenessOf(
      { country: ["IN"], discountPercent: 10, campaignEndDate: "2026-09-15", campaignChannelType: "AFFILIATE_LINK_ONLY" },
      {},
    );
    assert.equal(result.complete, false);
    assert.ok(result.missing.some((f) => f.key === "termsAndConditions"));
  });

  it("is complete when required client-facing fields are present", () => {
    const result = completenessOf(
      {
        country: ["IN"],
        discountPercent: 30,
        campaignEndDate: "2026-09-15",
        campaignChannelType: "AFFILIATE_LINK_ONLY",
        trackingUrl: "https://network.example/click/123",
      },
      { termsAndConditions: "Valid for new users only." },
    );
    assert.equal(result.complete, true);
    assert.equal(result.status, "Ready");
  });

  it("does not require coupon for affiliate link campaigns with synced tracking url", () => {
    const result = completenessOf(
      {
        country: ["SA"],
        discountPercent: 10,
        campaignEndDate: "2026-12-12",
        campaignChannelType: "AFFILIATE_LINK_ONLY",
        trackingUrl: "https://prf.hn/click/?camref=1100",
        campaignDescription: "Terms apply.",
      },
      {},
    );
    assert.equal(result.missing.some((field) => field.key === "couponCode"), false);
    assert.equal(result.missing.some((field) => field.key === "trackingUrl"), false);
  });

  it("resolves supplier tracking url on assignment review rows", () => {
    const row = {
      clientFacing: {
        campaignType: "Affiliate Link",
        campaignName: "CPS",
        customerOffer: "CPS mother care",
        expiry: "2026-12-12",
        countries: ["AE"],
      },
      supplierTrackingUrl: "https://prf.hn/click/?camref=1100",
      campaignChannelType: "AFFILIATE_LINK_ONLY",
    };
    const campaign = assignmentAsCampaignRow(row);
    assert.equal(campaign.trackingUrl, "https://prf.hn/click/?camref=1100");
    const complete = completenessOfAssignment(row);
    assert.equal(complete.missing.some((field) => field.key === "trackingUrl"), false);
    assert.equal(complete.missing.some((field) => field.key === "couponCode"), false);
  });

  it("strips HTML from network descriptions used as T&C and offer copy", () => {
    const facing = mergeFacing(
      {
        campaignDescription:
          '<p style="margin:0">Name: <b>Kapiva</b></p><p>Channel: Web+mWeb</p>',
      },
      {},
    );
    assert.equal(facing.merged.offerDescription.includes("<p"), false);
    assert.equal(facing.merged.offerDescription.includes("Kapiva"), true);
    assert.equal(facing.merged.termsAndConditions.includes("<p"), false);
    assert.equal(facing.merged.termsAndConditions.includes("Channel: Web+mWeb"), true);
  });

  it("tags brand fields as brand master and missing T&C as missing", () => {
    const facing = mergeFacing({ brandName: "Myntra", brandLogoLink: "https://logo" }, {});
    assert.equal(sourceTagForField("brandName", facing).label, "MBO Brand Master");
    assert.equal(sourceTagForField("termsAndConditions", facing).label, "Missing");
  });

  it("seeds clientFacing snapshot for Assignment Review persistence", () => {
    const facing = seedClientFacing(
      {
        country: ["AE"],
        discountPercent: 10,
        campaignEndDate: "2026-12-12",
        campaignChannelType: "AFFILIATE_LINK_ONLY",
        trackingUrl: "https://network.example/click/atlys",
        campaignTermsAndCondition: "Valid for new users.",
        campaignName: "Atlys CPS",
        brandName: "Atlys",
      },
      {},
    );
    assert.equal(facing.customerOffer, "10% Off");
    assert.ok(facing.termsAndConditions.includes("Valid for new users"));
    const complete = completenessOfAssignment({
      clientFacing: facing,
      trackingUrl: "https://network.example/click/atlys",
      canonicalCampaign: { displayName: "Atlys CPS", countries: ["AE"] },
    });
    assert.equal(complete.complete, true);
  });

  it("derives assignability from ACTIVE + JOINED + channel + commission", () => {
    const ok = assignabilityOf({
      campaignStatus: "ACTIVE",
      sources: [
        {
          id: "src-1",
          isPrimary: true,
          relationshipStatus: "JOINED",
          supportsLink: true,
          grossCommission: "12.5",
        },
      ],
    });
    assert.equal(ok.assignable, true);
    assert.equal(ok.blockers.length, 0);

    const blocked = assignabilityOf({
      campaignStatus: "ACTIVE",
      sources: [
        {
          id: "src-2",
          relationshipStatus: "PENDING",
          supportsLink: true,
          grossCommission: "10",
        },
      ],
    });
    assert.equal(blocked.assignable, false);
    assert.ok(blocked.blockers.some((b) => b.includes("Relationship")));
  });

  it("publish readiness requires commission and coupon for coupon campaigns", () => {
    const readiness = publishReadinessOf(
      {
        campaignStatus: "ACTIVE",
        campaignChannelType: "COUPON",
        campaignType: "COUPON",
        country: ["IN"],
        discountPercent: 20,
        campaignEndDate: "2026-12-01",
        sources: [
          {
            id: "src-1",
            relationshipStatus: "JOINED",
            supportsCoupon: true,
            grossCommission: "8",
          },
        ],
      },
      {
        termsAndConditions: "T&C",
        clientCommissionPercent: 70,
      },
      { hasTrackingLink: true },
    );
    assert.equal(readiness.ready, false);
    assert.ok(readiness.missing.some((f) => f.key === "couponCode"));
  });

  it("assignment publish readiness uses persisted tracking and commission fields", () => {
    const ready = publishReadinessOfAssignment({
      clientFacing: {
        campaignName: "Nike",
        campaignType: "Affiliate Link",
        customerOffer: "10% Off",
        termsAndConditions: "T&C",
        expiry: "2026-12-01",
        countries: ["AE"],
        clientCommissionPercent: 70,
      },
      hasTrackingUrl: true,
      trackingUrl: "https://mborewards.com/t/x",
      clientSharePercent: 70,
    });
    assert.equal(ready.ready, true);

    const blocked = publishReadinessOfAssignment({
      clientFacing: {
        campaignName: "Nike",
        campaignType: "Affiliate Link",
        customerOffer: "10% Off",
        termsAndConditions: "T&C",
        expiry: "2026-12-01",
        countries: ["AE"],
      },
      hasTrackingUrl: false,
      clientSharePercent: 70,
    });
    assert.equal(blocked.ready, false);
    assert.ok(blocked.missing.some((f) => f.key === "tracking"));
  });

  it("assignment publish readiness accepts supplier network link before MBO tracking exists", () => {
    const ready = publishReadinessOfAssignment({
      clientFacing: {
        campaignName: "Mothercare CPS",
        campaignType: "Affiliate Link",
        customerOffer: "CPS mother care",
        termsAndConditions: "T&C",
        expiry: "2026-12-12",
        countries: ["AE"],
        clientCommissionPercent: 0.4,
      },
      supplierTrackingUrl: "https://prf.hn/click/?camref=1100",
      campaignChannelType: "AFFILIATE_LINK_ONLY",
      clientSharePercent: 0.4,
      hasTrackingUrl: false,
    });
    assert.equal(ready.checks.tracking, true);
    assert.equal(ready.ready, true);
    assert.equal(ready.missing.some((field) => field.key === "tracking"), false);
  });
});
