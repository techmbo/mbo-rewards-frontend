import { resolveMaterialIcon } from "../../config/icons";

/**
 * Google Material Symbols Outlined icon.
 * Pass a nav key (e.g. "campaigns"), UI key (e.g. "close"), or raw symbol name (e.g. "sync").
 */
export function Icon({
  name,
  className = "",
  size = 20,
  filled = false,
  title,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}) {
  const symbol = resolveMaterialIcon(name);
  const label = ariaLabel || title;
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{
        fontSize: typeof size === "number" ? `${size}px` : size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      }}
      title={title}
      aria-label={label}
      aria-hidden={label ? undefined : ariaHidden ?? true}
      role={label ? "img" : undefined}
    >
      {symbol}
    </span>
  );
}
