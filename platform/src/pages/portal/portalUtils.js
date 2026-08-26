/** Shared helpers for the client portal dashboard. */

/** Format money without inventing INR/USD when currency is missing. */
export function formatMoney(value, currency = null) {
  const num = Number(value);
  const amount = Number.isFinite(num) ? num : 0;
  const cur = currency && String(currency).trim() ? String(currency).trim().toUpperCase() : null;
  if (!cur) {
    return amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  }
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${cur} ${amount.toLocaleString("en-IN")}`;
  }
}

export function formatInt(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function offerTypeLabel(type) {
  const t = String(type || "");
  if (t === "link" || t === "LINK" || t === "DEEPLINK") return "Link";
  if (t === "coupon" || t === "COUPON") return "Coupon";
  if (t === "link_and_coupon" || t === "COUPON_LINK") return "Link + Coupon";
  return type || "—";
}

export function statusTone(status) {
  const s = String(status || "");
  if (["Live", "Approved", "Paid", "Active", "Verified", "ACTIVE", "PAID"].includes(s)) {
    return "green";
  }
  if (["Pending", "Paused", "Processing", "Requested", "PENDING", "PROCESSING", "REQUESTED"].includes(s)) {
    return "amber";
  }
  if (["Expired", "Rejected", "Failed", "REVOKED"].includes(s)) {
    return "red";
  }
  return "blue";
}

export function badgeClass(tone) {
  const map = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800",
    red: "bg-rose-50 text-rose-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-violet-50 text-violet-700",
  };
  return map[tone] || map.blue;
}

export function brandInitials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function brandColor(name) {
  const palette = [
    "from-sky-600 to-blue-800",
    "from-rose-500 to-red-700",
    "from-emerald-500 to-teal-700",
    "from-orange-500 to-amber-700",
    "from-slate-700 to-slate-900",
    "from-indigo-500 to-blue-700",
  ];
  let hash = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i += 1) hash = (hash + s.charCodeAt(i) * (i + 1)) % palette.length;
  return palette[hash];
}

export function exportCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function unwrap(response) {
  return response?.data ?? response;
}

export function copyText(value, onDone) {
  if (!value) return;
  navigator.clipboard?.writeText(value).then(() => onDone?.("Copied")).catch(() => onDone?.("Copy failed"));
}
