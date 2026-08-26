import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assignmentStatusLabel,
  channelLabel,
  classifyCampaignLoadError,
  commercialModelLabel,
  commissionLabel,
  offerLabel,
  trackingState,
  couponState,
  couponLinkPrimary,
  brandWebsiteUrl,
  brandLogoUrl,
} from "./portalCampaignHelpers.js";

describe("portalCampaignHelpers — commercial vs channel", () => {
  it("keeps commercial model separate from channel", () => {
    const row = { commercialModel: "CPS", campaignType: "LINK", channelType: "LINK" };
    assert.equal(commercialModelLabel(row), "CPS");
    assert.equal(channelLabel(row), "Link");
  });

  it("does not treat LINK as commercial model", () => {
    assert.equal(commercialModelLabel({ commercialModel: "LINK" }), "—");
  });

  it("does not treat CPS as channel", () => {
    assert.equal(channelLabel({ campaignType: "CPS" }), "—");
  });
});

describe("portalCampaignHelpers — offer / tracking / coupon", () => {
  it("never uses campaign name as offer", () => {
    assert.equal(
      offerLabel({ campaignName: "Klook Staycation", discountDisplay: "Klook Staycation" }),
      null,
    );
    assert.equal(offerLabel({ campaignName: "Klook Staycation", offer: null }), null);
    assert.equal(offerLabel({ discountDisplay: "20% OFF" }), "20% OFF");
  });

  it("tracking states are honest", () => {
    assert.equal(trackingState({ link: "https://mbo.example/t/1" }).code, "ready");
    assert.equal(trackingState({ tracking: { status: "PENDING" } }).code, "pending");
    assert.equal(trackingState({}).code, "unavailable");
    assert.equal(trackingState({}).label, "Tracking not available");
  });

  it("coupon states distinguish assigned vs not required", () => {
    assert.equal(couponState({ couponCode: "SAVE10" }).code, "assigned");
    assert.equal(couponState({ couponAvailability: "NOT_SUPPORTED" }).code, "not_supported");
    assert.equal(couponState({}).label, "Not available");
  });

  it("coupon/link presentation follows channel type", () => {
    const linkRow = {
      channelType: "LINK",
      link: "https://go.mbo.example/r/klook/client",
    };
    const couponRow = {
      channelType: "COUPON",
      couponCode: "SAVE10",
    };
    assert.equal(couponLinkPrimary(linkRow)?.kind, "link");
    assert.equal(couponLinkPrimary(linkRow)?.value, "https://go.mbo.example/r/klook/client");
    assert.equal(couponLinkPrimary(couponRow)?.kind, "coupon");
    assert.equal(couponLinkPrimary(couponRow)?.value, "SAVE10");
  });
});

describe("portalCampaignHelpers — assignment labels", () => {
  it("maps CLIENT_VISIBLE to Live without inferring from published alone", () => {
    assert.equal(assignmentStatusLabel({ assignmentStatus: "CLIENT_VISIBLE" }), "Live");
    assert.equal(assignmentStatusLabel({ published: true }), "—");
    assert.equal(assignmentStatusLabel({ assignmentStatus: "PROVISIONED" }), "Ready to publish");
  });
});

describe("portalCampaignHelpers — brand / commission / errors", () => {
  it("website and logo stay independent and nullable", () => {
    assert.equal(brandWebsiteUrl({ brandWebsiteUrl: null, brandLogoUrl: "https://x/l.png" }), null);
    assert.equal(brandLogoUrl({ brandLogoUrl: null }), null);
    assert.equal(brandWebsiteUrl({ brand: { websiteUrl: "https://brand.example" } }), "https://brand.example");
  });

  it("commission uses client-safe projection only", () => {
    assert.equal(commissionLabel({ commission: { commissionDisplay: "3.5%" } }), "3.5%");
    assert.equal(commissionLabel({ commission: null }), "—");
    assert.equal(commissionLabel({}), "—");
  });

  it("classifies API errors distinctly from empty", () => {
    class FakeApiError extends Error {
      constructor(status) {
        super("x");
        this.status = status;
        this.path = "/v1/client/campaigns";
        this.correlationId = "c1";
      }
    }
    const e401 = classifyCampaignLoadError(new FakeApiError(401), FakeApiError, "/v1/client/campaigns");
    assert.equal(e401.kind, "api_error");
    assert.match(e401.message, /credential|sign in/i);
    const e403 = classifyCampaignLoadError(new FakeApiError(403), FakeApiError, "/v1/client/campaigns");
    assert.match(e403.message, /not authorized/i);
    const e500 = classifyCampaignLoadError(new FakeApiError(500), FakeApiError, "/v1/client/campaigns");
    assert.match(e500.message, /Unable to load/i);
  });
});
