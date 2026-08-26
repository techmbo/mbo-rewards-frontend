/**
 * Run: node --test frontend/src/pages/ops/adminPerformanceHelpers.test.js
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  attributionTone,
  campaignTypeLabel,
  csvRowsFromPerformance,
  customerTypeLabel,
  networkDisplayName,
  PERFORMANCE_04A_DEFAULT_HEADERS,
  PERFORMANCE_CSV_HEADERS,
} from "./adminPerformanceHelpers.js";

describe("adminPerformanceHelpers", () => {
  it("maps 04A campaign types", () => {
    assert.equal(campaignTypeLabel("COUPON_AND_LINK"), "Link + Coupon");
    assert.equal(campaignTypeLabel("COUPON_CODE_ONLY"), "Coupon");
    assert.equal(campaignTypeLabel("AFFILIATE_LINK_ONLY"), "Link");
    assert.equal(campaignTypeLabel("CPS"), null);
    assert.equal(campaignTypeLabel(null), null);
  });

  it("does not invent network display names", () => {
    assert.equal(networkDisplayName("OPTIMISE"), "Optimise");
    assert.equal(networkDisplayName(null), null);
  });

  it("maps attribution tones", () => {
    assert.equal(attributionTone("Matched"), "MATCHED");
    assert.equal(attributionTone("Coupon + Click"), "COUPON_CLICK");
    assert.equal(attributionTone(null), null);
  });

  it("exports 04A default columns first", () => {
    for (const h of PERFORMANCE_04A_DEFAULT_HEADERS) {
      assert.ok(PERFORMANCE_CSV_HEADERS.includes(h), h);
    }
    assert.equal(PERFORMANCE_CSV_HEADERS[0], "Network Source");
    assert.equal(PERFORMANCE_CSV_HEADERS[4], "Link Clicks");
    assert.equal(PERFORMANCE_CSV_HEADERS[10], "Net Commission");
    const [row] = csvRowsFromPerformance([
      {
        network: "OPTIMISE",
        brandName: "Ubuy",
        campaignType: "Link + Coupon",
        couponCode: "SAVE10",
        networkClicks: 1245,
        grossOrders: 320,
        grossOrderValue: 12500,
        grossCommission: 625,
        confirmedOrders: 290,
        confirmedOrderValue: 11200,
        confirmedCommission: 560,
        currency: "USD",
        reportDate: "2026-07-31",
      },
    ]);
    assert.equal(row[0], "OPTIMISE");
    assert.equal(row[1], "Ubuy");
    assert.equal(row[2], "Link + Coupon");
    assert.equal(row[3], "SAVE10");
    assert.equal(row[4], "1245");
    assert.equal(row[5], "320");
    assert.equal(row[8], "290");
    assert.equal(row[10], "560");
    assert.equal(row[11], "290");
  });

  it("humanizes customer type without inventing", () => {
    assert.equal(customerTypeLabel("NEW"), "New Customer");
    assert.equal(customerTypeLabel("EXISTING"), "Existing Customer");
    assert.equal(customerTypeLabel(null), null);
  });
});
