import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { displayCountry, displayHostname, displayText, htmlToPlainText, coerceDetailValue, isCreativeArray } from "./display.js";

describe("htmlToPlainText", () => {
  it("leaves plain text unchanged", () => {
    assert.equal(htmlToPlainText("Kapiva CPS India"), "Kapiva CPS India");
  });

  it("strips network HTML into readable copy", () => {
    const html =
      '<p style="margin-right: 0px;"><font size="3"><span style="font-family: arial;">Name: Kapiva.in Ecommerce CPS - India</span></font></p><p>Channel: Web+mWeb</p>';
    const text = htmlToPlainText(html);
    assert.equal(text.includes("<p"), false);
    assert.equal(text.includes("style="), false);
    assert.match(text, /Name: Kapiva\.in Ecommerce CPS - India/);
    assert.match(text, /Channel: Web\+mWeb/);
  });

  it("decodes entities and collapses empty markup", () => {
    assert.equal(htmlToPlainText("<p>&nbsp;</p>"), "");
    assert.equal(htmlToPlainText("Save 20% &amp; more"), "Save 20% & more");
  });

  it("uses displayText fallback when markup has no readable content", () => {
    assert.equal(displayText("<p></p>", "Not Provided"), "Not Provided");
  });
});

describe("displayCountry", () => {
  it("shows a short list as-is", () => {
    assert.equal(displayCountry(["AE", "SA", "IN"]), "AE, SA, IN");
    assert.equal(displayCountry("AE, SA"), "AE, SA");
  });

  it("collapses long lists and worldwide labels to All", () => {
    const many = ["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AR", "AT"];
    assert.equal(displayCountry(many), "All");
    assert.equal(displayCountry(many.join(", ")), "All");
    assert.equal(displayCountry("worldwide"), "All");
    assert.equal(displayCountry("ALL"), "All");
  });

  it("keeps empty values as a dash", () => {
    assert.equal(displayCountry(null), "—");
    assert.equal(displayCountry([]), "—");
  });
});

describe("displayHostname", () => {
  it("keeps only the hostname from tracking URLs", () => {
    assert.equal(
      displayHostname(
        "https://rz.mackeeper.com/paramss=phexafc9a8dab4cbb1a192979fb2999cdfe8cb90b1f4dbc6c1a79a9a979ceae9c5c49eaca29dc4a09c97d5ad91d3c8dba29c9",
      ),
      "rz.mackeeper.com",
    );
    assert.equal(displayHostname("www.indeed.com/jobs"), "www.indeed.com");
  });
});

describe("coerceDetailValue", () => {
  it("parses JSON-looking strings", () => {
    assert.deepEqual(coerceDetailValue('["TH"]'), ["TH"]);
    assert.equal(coerceDetailValue("plain text"), "plain text");
  });
});

describe("isCreativeArray", () => {
  it("detects Trackier-style creative objects", () => {
    assert.equal(
      isCreativeArray([
        {
          title: "Banner",
          full_url: "https://cdn.example/b.jpg",
          mime_type: "image/jpg",
          dimensions: { width: 728, height: 90 },
        },
      ]),
      true,
    );
    assert.equal(isCreativeArray(["TH"]), false);
  });
});
