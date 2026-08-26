/**
 * Node test for centralized API URL joining (no Vite).
 * Run from repo root: node --test frontend/src/apiUrl.test.js
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { joinApiPath, buildUrl } from "./apiUrl.js";

describe("joinApiPath — no double /api", () => {
  it("base …/api + /v1/client/campaigns → …/api/v1/client/campaigns", () => {
    const { href, pathname } = joinApiPath(
      "https://host.example/api",
      "/v1/client/campaigns",
    );
    assert.equal(pathname, "/api/v1/client/campaigns");
    assert.equal(href, "https://host.example/api/v1/client/campaigns");
  });

  it("base …/api + /api/v1/client/campaigns dedupes to single /api", () => {
    const { href, pathname } = joinApiPath(
      "https://host.example/api",
      "/api/v1/client/campaigns",
    );
    assert.equal(pathname, "/api/v1/client/campaigns");
    assert.equal(href, "https://host.example/api/v1/client/campaigns");
    assert.doesNotMatch(pathname, /\/api\/api/);
  });

  it("base https://host + /api/v1/client/campaigns works", () => {
    const { href, pathname } = joinApiPath("https://host.example", "/api/v1/client/campaigns");
    assert.equal(pathname, "/api/v1/client/campaigns");
    assert.equal(href, "https://host.example/api/v1/client/campaigns");
  });

  it("partner relative path under /api base", () => {
    const { pathname } = joinApiPath("https://host.example/api", "/partner/v1/campaigns");
    assert.equal(pathname, "/api/partner/v1/campaigns");
  });

  it("buildUrl attaches query params without altering path", () => {
    const url = buildUrl("https://host.example/api", "/v1/client/campaigns", {
      pageSize: 100,
    });
    assert.equal(url.pathname, "/api/v1/client/campaigns");
    assert.equal(url.searchParams.get("pageSize"), "100");
  });
});
