import { COUNTRIES } from "./countries.js";

/** ISO 3166-1 alpha-2 → primary ISO 4217 currency. */
const COUNTRY_CURRENCY = {
  AF: "AFN", AL: "ALL", DZ: "DZD", AS: "USD", AD: "EUR", AO: "AOA", AI: "XCD", AG: "XCD",
  AR: "ARS", AM: "AMD", AW: "AWG", AU: "AUD", AT: "EUR", AZ: "AZN", BS: "BSD", BH: "BHD",
  BD: "BDT", BB: "BBD", BY: "BYN", BE: "EUR", BZ: "BZD", BJ: "XOF", BM: "BMD", BT: "BTN",
  BO: "BOB", BQ: "USD", BA: "BAM", BW: "BWP", BR: "BRL", IO: "USD", BN: "BND", BG: "BGN",
  BF: "XOF", BI: "BIF", CV: "CVE", KH: "KHR", CM: "XAF", CA: "CAD", KY: "KYD", CF: "XAF",
  TD: "XAF", CL: "CLP", CN: "CNY", CX: "AUD", CC: "AUD", CO: "COP", KM: "KMF", CG: "XAF",
  CD: "CDF", CK: "NZD", CR: "CRC", CI: "XOF", HR: "EUR", CU: "CUP", CW: "ANG", CY: "EUR",
  CZ: "CZK", DK: "DKK", DJ: "DJF", DM: "XCD", DO: "DOP", EC: "USD", EG: "EGP", SV: "USD",
  GQ: "XAF", ER: "ERN", EE: "EUR", SZ: "SZL", ET: "ETB", FK: "FKP", FO: "DKK", FJ: "FJD",
  FI: "EUR", FR: "EUR", GF: "EUR", PF: "XPF", GA: "XAF", GM: "GMD", GE: "GEL", DE: "EUR",
  GH: "GHS", GI: "GIP", GR: "EUR", GL: "DKK", GD: "XCD", GP: "EUR", GU: "USD", GT: "GTQ",
  GG: "GBP", GN: "GNF", GW: "XOF", GY: "GYD", HT: "HTG", HM: "AUD", VA: "EUR", HN: "HNL",
  HK: "HKD", HU: "HUF", IS: "ISK", IN: "INR", ID: "IDR", IR: "IRR", IQ: "IQD", IE: "EUR",
  IM: "GBP", IL: "ILS", IT: "EUR", JM: "JMD", JP: "JPY", JE: "GBP", JO: "JOD", KZ: "KZT",
  KE: "KES", KI: "AUD", KP: "KPW", KR: "KRW", KW: "KWD", KG: "KGS", LA: "LAK", LV: "EUR",
  LB: "LBP", LS: "LSL", LR: "LRD", LY: "LYD", LI: "CHF", LT: "EUR", LU: "EUR", MO: "MOP",
  MG: "MGA", MW: "MWK", MY: "MYR", MV: "MVR", ML: "XOF", MT: "EUR", MH: "USD", MQ: "EUR",
  MR: "MRU", MU: "MUR", YT: "EUR", MX: "MXN", FM: "USD", MD: "MDL", MC: "EUR", MN: "MNT",
  ME: "EUR", MS: "XCD", MA: "MAD", MZ: "MZN", MM: "MMK", NA: "NAD", NR: "AUD", NP: "NPR",
  NL: "EUR", NC: "XPF", NZ: "NZD", NI: "NIO", NE: "XOF", NG: "NGN", NU: "NZD", NF: "AUD",
  MK: "MKD", MP: "USD", NO: "NOK", OM: "OMR", PK: "PKR", PW: "USD", PS: "ILS", PA: "PAB",
  PG: "PGK", PY: "PYG", PE: "PEN", PH: "PHP", PN: "NZD", PL: "PLN", PT: "EUR", PR: "USD",
  QA: "QAR", RE: "EUR", RO: "RON", RU: "RUB", RW: "RWF", BL: "EUR", SH: "SHP", KN: "XCD",
  LC: "XCD", MF: "EUR", PM: "EUR", VC: "XCD", WS: "WST", SM: "EUR", ST: "STN", SA: "SAR",
  SN: "XOF", RS: "RSD", SC: "SCR", SL: "SLE", SG: "SGD", SX: "ANG", SK: "EUR", SI: "EUR",
  SB: "SBD", SO: "SOS", ZA: "ZAR", GS: "GBP", SS: "SSP", ES: "EUR", LK: "LKR", SD: "SDG",
  SR: "SRD", SJ: "NOK", SE: "SEK", CH: "CHF", SY: "SYP", TW: "TWD", TJ: "TJS", TZ: "TZS",
  TH: "THB", TL: "USD", TG: "XOF", TK: "NZD", TO: "TOP", TT: "TTD", TN: "TND", TR: "TRY",
  TM: "TMT", TC: "USD", TV: "AUD", UG: "UGX", UA: "UAH", AE: "AED", GB: "GBP", US: "USD",
  UM: "USD", UY: "UYU", UZ: "UZS", VU: "VUV", VE: "VES", VN: "VND", VG: "USD", VI: "USD",
  WF: "XPF", EH: "MAD", YE: "YER", ZM: "ZMW", ZW: "ZWL", AX: "EUR",
};

/** Countries that officially use more than one currency — operator must choose. */
const MULTI_CURRENCY_COUNTRIES = {
  BT: ["BTN", "INR"],
  NP: ["NPR", "INR"],
  LS: ["LSL", "ZAR"],
  NA: ["NAD", "ZAR"],
  SZ: ["SZL", "ZAR"],
  PA: ["PAB", "USD"],
  CU: ["CUP", "USD"],
  LR: ["LRD", "USD"],
  ZW: ["USD", "ZWL"],
};

const NAME_TO_CODE = new Map(
  COUNTRIES.map(({ code, name }) => [name.toLowerCase(), code]),
);

export function normalizeCountryCode(value) {
  if (value == null || value === "") return null;
  const text = String(value).trim();
  if (!text) return null;
  if (/^[A-Z]{2}$/i.test(text)) return text.toUpperCase();
  return NAME_TO_CODE.get(text.toLowerCase()) || null;
}

export function normalizeCountryCodes(countries) {
  if (!countries) return [];
  const list = Array.isArray(countries) ? countries : [countries];
  const codes = list.map(normalizeCountryCode).filter(Boolean);
  return [...new Set(codes)];
}

export function currenciesForCountry(code) {
  const upper = String(code || "").toUpperCase();
  if (MULTI_CURRENCY_COUNTRIES[upper]) return MULTI_CURRENCY_COUNTRIES[upper];
  const primary = COUNTRY_CURRENCY[upper];
  return primary ? [primary] : [];
}

/**
 * Resolve client-facing currency from a list of country codes/names.
 * Auto-fills when unambiguous; editable when a country has multiple currencies
 * or when selected countries map to different currencies.
 */
export function resolveCurrencyForCountries(countries) {
  const codes = normalizeCountryCodes(countries);
  if (!codes.length) {
    return { currency: null, editable: true, options: [] };
  }

  const options = new Set();
  let hasMultiCurrencyCountry = false;

  for (const code of codes) {
    const countryOptions = currenciesForCountry(code);
    if (countryOptions.length > 1) hasMultiCurrencyCountry = true;
    countryOptions.forEach((currency) => options.add(currency));
  }

  const sorted = [...options].sort();

  if (!sorted.length) {
    return { currency: null, editable: true, options: [] };
  }

  if (sorted.length === 1 && !hasMultiCurrencyCountry) {
    return { currency: sorted[0], editable: false, options: sorted };
  }

  return { currency: null, editable: true, options: sorted };
}
