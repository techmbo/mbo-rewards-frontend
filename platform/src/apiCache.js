/** In-memory GET cache + in-flight deduplication — stale-while-revalidate for instant navigation. */

const cache = new Map();
const inflight = new Map();
/** Bump when list DTOs gain fields so sessionStorage does not keep empty shells. */
const SESSION_KEY = "mbo-api-cache-v5";
const MAX_SESSION_ENTRY_BYTES = 120_000;

/** Keep list data hot for the whole session; refresh silently in background. */
export const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;

let persistTimer = null;

function hydrateFromSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    for (const [key, entry] of Object.entries(parsed)) {
      if (entry?.data != null && isCacheFresh(entry)) {
        cache.set(key, entry);
      }
    }
  } catch {
    // ignore corrupt session cache
  }
}

function schedulePersist() {
  if (persistTimer) return;
  persistTimer = window.setTimeout(() => {
    persistTimer = null;
    try {
      const payload = {};
      for (const [key, entry] of cache.entries()) {
        if (!isCacheFresh(entry)) continue;
        const size = JSON.stringify(entry.data).length;
        if (size > MAX_SESSION_ENTRY_BYTES) continue;
        payload[key] = entry;
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch {
      // quota exceeded — skip persistence
    }
  }, 400);
}

export function clearSessionApiCache() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

hydrateFromSession();

const CACHE_BUST_QUERY_KEYS = new Set(["refresh", "_t", "_"]);

export function buildCacheKey(path, params = {}) {
  const sorted = Object.keys(params)
    .filter((key) => !CACHE_BUST_QUERY_KEYS.has(key))
    .sort()
    .map((key) => `${key}=${String(params[key])}`)
    .join("&");
  return sorted ? `${path}?${sorted}` : path;
}

export function readCacheEntry(key) {
  return cache.get(key) ?? null;
}

export function writeCacheEntry(key, data) {
  cache.set(key, { data, fetchedAt: Date.now() });
  schedulePersist();
}

export function isCacheFresh(entry, ttlMs = DEFAULT_CACHE_TTL_MS) {
  if (!entry) return false;
  return Date.now() - entry.fetchedAt < ttlMs;
}

export function hasCachedData(key) {
  return Boolean(readCacheEntry(key)?.data);
}

export function invalidateApiCache(pathPrefix = "") {
  if (!pathPrefix) {
    cache.clear();
    clearSessionApiCache();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(pathPrefix)) cache.delete(key);
  }
  schedulePersist();
}

export function getInflightRequest(key) {
  return inflight.get(key) ?? null;
}

export function setInflightRequest(key, promise) {
  inflight.set(key, promise);
  promise.finally(() => {
    if (inflight.get(key) === promise) inflight.delete(key);
  });
}
