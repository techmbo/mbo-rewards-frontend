/** URL-safe slug from display names (matches backend tracking slug rules). */
export function slugifyName(value) {
  if (!value) return "";
  return (
    String(value)
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || ""
  );
}
