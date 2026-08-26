import {
  resolveApiBaseUrl,
  joinApiPath,
  buildUrl,
  CLIENT_API,
} from "./apiUrl.js";
import {
  buildCacheKey,
  DEFAULT_CACHE_TTL_MS,
  getInflightRequest,
  invalidateApiCache,
  isCacheFresh,
  readCacheEntry,
  setInflightRequest,
  writeCacheEntry,
} from "./apiCache.js";

export { invalidateApiCache };

export { resolveApiBaseUrl, joinApiPath, buildUrl, CLIENT_API };

export class ApiError extends Error {
  constructor(message, { status = 0, path = null, correlationId = null, details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
    this.correlationId = correlationId;
    this.details = details;
  }
}

const API_BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

let authTokenGetter = () => null;

export function setAuthTokenGetter(getter) {
  authTokenGetter = getter;
}

function buildHeaders(extra = {}) {
  const headers = { ...extra };
  const token = authTokenGetter();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function requestUrl(path, params = {}) {
  return buildUrl(API_BASE_URL, path, params);
}

async function readErrorPayload(response) {
  const text = await response.text();
  if (!text) {
    return { message: `Request failed: ${response.status}`, details: null };
  }

  try {
    const data = JSON.parse(text);
    return {
      message: data?.message || data?.error || text,
      details: {
        ...(data?.details && typeof data.details === "object" ? data.details : {}),
        ...(data?.code ? { code: data.code } : {}),
        ...(data?.existingAssignmentId ? { existingAssignmentId: data.existingAssignmentId } : {}),
      },
    };
  } catch {
    const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (/cannot (get|post|put|patch|delete)/i.test(plain)) {
      return { message: `API endpoint not found (${response.status}).`, details: null };
    }
    return {
      message: plain.slice(0, 240) || `Request failed: ${response.status}`,
      details: null,
    };
  }
}

async function throwIfNotOk(response, path) {
  if (response.ok) return;
  const { message, details } = await readErrorPayload(response);
  throw new ApiError(message, {
    status: response.status,
    path,
    correlationId: response.headers.get("x-request-id") || response.headers.get("x-trace-id"),
    details,
  });
}

export async function fetchApi(path, params = {}, options = {}) {
  const { cacheTtlMs = DEFAULT_CACHE_TTL_MS, skipCache = false } = options;
  const cacheKey = buildCacheKey(path, params);

  if (!skipCache) {
    const cached = readCacheEntry(cacheKey);
    if (isCacheFresh(cached, cacheTtlMs)) {
      return cached.data;
    }

    const inflight = getInflightRequest(cacheKey);
    if (inflight) return inflight;
  }

  const request = (async () => {
    const url = requestUrl(path, params);
    const response = await fetch(url.toString(), {
      headers: buildHeaders(),
    });
    await throwIfNotOk(response, path);
    const data = await response.json();
    writeCacheEntry(cacheKey, data);
    return data;
  })();

  if (!skipCache) {
    setInflightRequest(cacheKey, request);
  }

  return request;
}

export async function postApi(path, body = {}) {
  const url = requestUrl(path);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: buildHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(body),
  });
  await throwIfNotOk(response, path);
  invalidateApiCache();
  return response.json();
}

async function writeApi(method, path, body) {
  const url = requestUrl(path);
  const response = await fetch(url.toString(), {
    method,
    headers: buildHeaders({
      "Content-Type": "application/json",
    }),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  await throwIfNotOk(response, path);
  invalidateApiCache();
  return response.json();
}

export function putApi(path, body = {}) {
  return writeApi("PUT", path, body);
}

export function patchApi(path, body = {}) {
  return writeApi("PATCH", path, body);
}

export function deleteApi(path) {
  return writeApi("DELETE", path);
}
