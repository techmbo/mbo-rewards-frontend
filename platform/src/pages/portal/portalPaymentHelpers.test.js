/**
 * Run: node --test frontend/src/pages/portal/portalPaymentHelpers.test.js
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  commercialModelLabel,
  currencyLabel,
  formatMoneyMetric,
  isPaymentsEmpty,
  csvRowsFromPayments,
} from "./portalPaymentHelpers.js";

describe("portalPaymentHelpers", () => {
  it("keeps commercial model distinct from channel", () => {
    assert.equal(commercialModelLabel({ commercialModel: "CPS" }), "CPS");
    assert.equal(commercialModelLabel({ campaignType: "LINK" }), "—");
  });

  it("never invents INR", () => {
    assert.equal(currencyLabel(null), null);
    assert.equal(formatMoneyMetric(null, "INR"), "Not available");
    assert.equal(formatMoneyMetric(0, "USD").includes("0"), true);
  });

  it("empty vs populated", () => {
    assert.equal(isPaymentsEmpty({ dataAvailable: false, payments: [] }), true);
    assert.equal(isPaymentsEmpty({ dataAvailable: true, items: [{ billingMonth: 8 }] }), false);
  });

  it("CSV uses client commission field", () => {
    const row = csvRowsFromPayments([
      {
        billingMonth: 8,
        billingYear: 2026,
        brandName: "Brand",
        commercialModel: "CPS",
        payableCommission: 12,
        paymentStatus: "Payable",
      },
    ])[0];
    assert.equal(row[0], 8);
    assert.equal(row[4], "CPS");
    assert.equal(row[8], 12);
  });
});
