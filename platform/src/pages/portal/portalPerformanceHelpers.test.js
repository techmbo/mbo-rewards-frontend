/**
 * Run: node --test frontend/src/pages/portal/portalPerformanceHelpers.test.js
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  channelLabel,
  classifyPerformanceLoadError,
  currencyLabel,
  formatMetric,
  isPerformanceEmpty,
  kpiValue,
  csvRowsFromItems,
} from "./portalPerformanceHelpers.js";

describe("portalPerformanceHelpers", () => {
  it("does not treat CPS as channel", () => {
    assert.equal(channelLabel("CPS"), "—");
    assert.equal(channelLabel("LINK"), "Link");
    assert.equal(channelLabel(null), "—");
  });

  it("formats null metrics as Not available — not fake zero", () => {
    assert.equal(formatMetric(null), "Not available");
    assert.equal(formatMetric(0), "0");
    assert.equal(formatMetric(null, { kind: "money", currency: "USD" }), "Not available");
  });

  it("never invents INR for missing currency", () => {
    assert.equal(currencyLabel(null), null);
    assert.equal(currencyLabel(""), null);
    assert.equal(currencyLabel("usd"), "USD");
  });

  it("empty vs populated payload", () => {
    assert.equal(isPerformanceEmpty({ dataAvailable: false, items: [] }), true);
    assert.equal(isPerformanceEmpty({ dataState: "empty", items: [] }), true);
    assert.equal(isPerformanceEmpty({ dataAvailable: true, items: [{ date: "2026-01-01" }] }), false);
  });

  it("KPI accessor does not invent values", () => {
    assert.equal(kpiValue({}, "linkClicks"), null);
    assert.equal(kpiValue({ linkClicks: 0 }, "linkClicks"), 0);
  });

  it("CSV mapping uses client commission fields", () => {
    const row = csvRowsFromItems([
      {
        date: "2026-01-01",
        brandName: "Brand",
        campaignName: "Camp",
        clientCommission: 12,
        linkClicks: 3,
      },
    ])[0];
    assert.equal(row[0], "2026-01-01");
    assert.equal(row[6], 3);
    assert.equal(row[13], 12);
  });

  it("classifies auth errors", () => {
    class FakeApiError extends Error {
      constructor(status) {
        super("x");
        this.status = status;
        this.path = "/v1/client/performance";
      }
    }
    assert.match(
      classifyPerformanceLoadError(new FakeApiError(401), FakeApiError, "/v1/client/performance").message,
      /credential|sign in/i,
    );
    assert.match(
      classifyPerformanceLoadError(new FakeApiError(403), FakeApiError, "/v1/client/performance").message,
      /not authorized/i,
    );
  });
});
