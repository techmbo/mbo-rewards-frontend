/**
 * Display helpers — NULL ≠ 0. Never invent metrics.
 */

export function isAbsent(value) {
  return value == null || value === "";
}

/** Show em dash for unavailable values; never coerce null to 0. */
export function na(value, fallback = "—") {
  if (isAbsent(value)) return fallback;
  return value;
}

const HTML_TAG_RE = /<\/?[a-z][\s\S]*>/i;
const HTML_ENTITY_RE = /&(?:[a-z]+|#\d+|#x[0-9a-f]+);/i;

export function looksLikeHtml(value) {
  if (typeof value !== "string") return false;
  return HTML_TAG_RE.test(value) || HTML_ENTITY_RE.test(value);
}

/**
 * Convert network HTML (Optimise descriptions, T&C, etc.) into readable plain text.
 * Does not invent content — empty markup becomes an empty string.
 */
export function htmlToPlainText(value) {
  if (value == null) return "";
  let text = String(value);
  if (!looksLikeHtml(text)) return text;

  text = text
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li|h[1-6]|tr|blockquote|section)\s*>/gi, "\n")
    .replace(/<\s*li\b[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCharCode(n) : "";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const n = parseInt(hex, 16);
      return Number.isFinite(n) ? String.fromCharCode(n) : "";
    })
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return text;
}

export function displayText(value, fallback = "—") {
  if (isAbsent(value)) return fallback;
  const text = htmlToPlainText(value);
  if (isAbsent(text)) return fallback;
  return text;
}

/** Turn camelCase / snake_case source keys into a readable drawer label. */
export function humanizeFieldLabel(key) {
  const raw = String(key ?? "").trim();
  if (!raw) return "";
  const spaced = raw
    .replace(/[_.]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  return spaced.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/** Shorten table copy to a fixed word count; full text stays available via title/tooltip. */
export function truncateWords(value, maxWords = 4, fallback = "—") {
  const text = displayText(value, "");
  if (!text) return fallback;
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")}…`;
}

export function displayNumber(value, fallback = "—") {
  if (isAbsent(value)) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return n.toLocaleString();
}

export function displayPercent(value, fallback = "—") {
  if (isAbsent(value)) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return `${Number(n.toFixed(2))}%`;
}

/**
 * Money display: null/undefined → "—". Does not invent zeros.
 */
export function displayMoney(value, currency = null, { digits = 2 } = {}) {
  if (isAbsent(value)) return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  if (isAbsent(currency)) {
    return n.toLocaleString(undefined, { maximumFractionDigits: digits });
  }
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: String(currency),
      maximumFractionDigits: digits,
    }).format(n);
  } catch {
    return `${currency} ${n}`.trim();
  }
}

/**
 * Compact KPI money ($1.06K). Null stays "—".
 */
export function displayCompactMoney(value, currency = null) {
  if (isAbsent(value)) return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  let amount;
  if (abs >= 1_000_000) amount = `${trimZeros(n / 1_000_000)}M`;
  else if (abs >= 1000) amount = `${trimZeros(n / 1000)}K`;
  else amount = n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (isAbsent(currency)) return amount;
  try {
    const symbol = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: String(currency),
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value;
    return `${symbol || currency}${amount}`;
  } catch {
    return `${currency} ${amount}`.trim();
  }
}

function trimZeros(n) {
  return String(Number(n.toFixed(2)));
}

export function displayDate(value, fallback = "—") {
  if (isAbsent(value)) return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function displayDateTime(value, fallback = "—") {
  if (isAbsent(value)) return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} ${time}`;
}

/** Show "All" once a campaign lists this many territories — keeps table rows to one line. */
export const COMPACT_COUNTRY_LIMIT = 8;

function parseCountryList(value) {
  if (isAbsent(value)) return [];
  if (Array.isArray(value)) return value.flatMap(parseCountryList);
  const text = String(value).trim();
  if (!text) return [];
  if (/^(all|worldwide|global|ww)$/i.test(text)) return ["ALL"];
  return text
    .split(/[,;/|]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function countryListTitle(value) {
  const parts = parseCountryList(value).filter((part) => part !== "ALL");
  return parts.join(", ");
}

export function displayCountry(value, fallback = "—") {
  const parts = parseCountryList(value);
  if (!parts.length) return fallback;
  if (parts.some((part) => part === "ALL") || parts.length >= COMPACT_COUNTRY_LIMIT) {
    return "All";
  }
  return parts.join(", ");
}

/** Hostname only — never show tracking query strings in table cells. */
export function displayHostname(url, fallback = "") {
  if (isAbsent(url)) return fallback;
  const raw = String(url).trim();
  try {
    const parsed = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return parsed.hostname || fallback;
  } catch {
    return raw.replace(/^https?:\/\//i, "").split(/[/?#]/)[0] || fallback;
  }
}

/** Parse JSON-looking strings for detail panels (source data, detected fields). */
export function coerceDetailValue(value) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}

export function isCreativeItem(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const url = value.full_url ?? value.url ?? value.image_url ?? null;
  if (!url) return false;
  return Boolean(value.title || value.file_name || value.mime_type || value.dimensions);
}

export function isCreativeArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(isCreativeItem);
}

const COUNTRY_FIELD_KEYS = new Set([
  "country",
  "countries",
  "geo",
  "countryCodes",
  "country_codes",
  "promotional_countries",
  "target_countries",
  "allowed_countries",
]);

export function isCountryFieldKey(key) {
  return COUNTRY_FIELD_KEYS.has(String(key || "").trim());
}
