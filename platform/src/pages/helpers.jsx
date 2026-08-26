import { Badge } from "../components/ui/Badge";

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export function formatDateShort(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function StatusBadge({ status }) {
  const normalized = String(status || "").toUpperCase();
  const variant =
    {
      ACTIVE: "success",
      APPROVED: "success",
      RESOLVED: "success",
      SUCCESS: "success",
      JOINED: "success",
      PAID: "success",
      PAYABLE: "info",
      PUBLISHED: "success",
      PENDING: "warning",
      REVIEW: "warning",
      PAUSED: "warning",
      NOT_PAYABLE: "warning",
      FAILED: "danger",
      ERROR: "danger",
      REJECTED: "danger",
      CANCELLED: "danger",
      INACTIVE: "default",
      NOT_JOINED: "default",
      UNKNOWN: "default",
    }[normalized] || "default";
  return <Badge variant={variant}>{status || "—"}</Badge>;
}

export function extractTotal(response) {
  if (!response) return null;
  return response.pagination?.total ?? response.total ?? (Array.isArray(response.data) ? response.data.length : null);
}
