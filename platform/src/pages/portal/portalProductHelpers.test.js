/**
 * Portal product helper unit tests (presentation only).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  channelLabel,
  classifyProductLoadError,
  commercialModelLabel,
  csvRowsFromProducts,
  currencyLabel,
  displayPrice,
  formatProductMoney,
  isProductsEmpty,
  productImageUrl,
  productItems,
  productName,
  productPagination,
  trackingUrl,
} from "./portalProductHelpers.js";

describe("portalProductHelpers", () => {
  it("loading empty payload is empty", () => {
    assert.equal(isProductsEmpty(null), true);
    assert.equal(isProductsEmpty({ dataAvailable: false, items: [] }), true);
    assert.equal(isProductsEmpty({ items: [{ productName: "A" }] }), false);
  });

  it("productItems reads items/products", () => {
    assert.equal(productItems({ items: [1] }).length, 1);
    assert.equal(productItems({ products: [1, 2] }).length, 2);
  });

  it("pagination from envelope", () => {
    const p = productPagination({
      pagination: { page: 2, pageSize: 10, total: 25, totalPages: 3 },
    });
    assert.equal(p.page, 2);
    assert.equal(p.total, 25);
  });

  it("missing image / price / currency stay honest", () => {
    assert.equal(productImageUrl({}), null);
    assert.equal(displayPrice({}), null);
    assert.equal(currencyLabel(null), null);
    assert.equal(formatProductMoney(null, "INR"), "Not available");
    assert.equal(formatProductMoney(10, null).includes("10"), true);
    assert.ok(!formatProductMoney(10, null).includes("INR"));
    assert.ok(!formatProductMoney(10, null).includes("USD"));
  });

  it("commercial model ≠ channel", () => {
    assert.equal(commercialModelLabel({ commercialModel: "CPS" }), "CPS");
    assert.equal(commercialModelLabel({ commercialModel: "LINK" }), "—");
    assert.equal(channelLabel({ channel: "COUPON" }), "Coupon");
    assert.equal(channelLabel({ channel: "CPS" }), "—");
  });

  it("tracking uses MBO url only", () => {
    assert.equal(trackingUrl({ mboProductTrackingUrl: "https://mbo/t/product/X" }), "https://mbo/t/product/X");
    assert.equal(trackingUrl({ supplierProductTrackingUrl: "SECRET" }), null);
  });

  it("product name does not invent", () => {
    assert.equal(productName({}), null);
    assert.equal(productName({ productName: "Shoe" }), "Shoe");
  });

  it("classifies unauthorized / forbidden", () => {
    class ApiError extends Error {
      constructor(status) {
        super(`fail (${status})`);
        this.status = status;
        this.path = "/v1/client/products";
      }
    }
    assert.equal(classifyProductLoadError(new ApiError(401), ApiError).status, 401);
    assert.equal(classifyProductLoadError(new ApiError(403), ApiError).status, 403);
    assert.match(classifyProductLoadError(new Error("x"), ApiError).message, /Unable to load/);
  });

  it("CSV is client-safe field set", () => {
    const rows = csvRowsFromProducts([
      {
        brandName: "Nike",
        campaignName: "Camp",
        productName: "Shoe",
        price: 10,
        currency: "USD",
        mboProductTrackingUrl: "https://mbo/t/product/1",
        commercialModel: "CPS",
        channel: "LINK",
      },
    ]);
    const blob = JSON.stringify(rows);
    assert.equal(blob.includes("supplierReceivable"), false);
    assert.equal(blob.includes("rawPayload"), false);
    assert.equal(blob.includes("apiKey"), false);
    assert.equal(rows[0][0], "Nike");
  });

  it("no INR default in formatter", () => {
    assert.equal(formatProductMoney(99, undefined).includes("INR"), false);
    assert.equal(formatProductMoney(99, "").includes("USD"), false);
  });
});
