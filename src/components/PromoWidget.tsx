"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ANNOUNCEMENT } from "@/lib/navigation";

const KEY = `mbo-announce-${ANNOUNCEMENT.id}`;

// Floating promo card (bottom-right, homepage only). Replaces the old top
// announcement bar so the header height is identical everywhere. Click-through
// or dismissal is persisted per announcement id.
export default function PromoWidget() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    if (pathname !== "/") return;
    try {
      if (localStorage.getItem(KEY) === "1") return;
    } catch { /* private mode: show anyway */ }
    const t = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(t);
  }, [pathname]);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(KEY, "1"); } catch { /* private mode */ }
  };

  if (!visible || pathname !== "/") return null;

  return (
    <div
      className="promo-widget"
      role="complementary"
      aria-label="Announcement"
      style={{
        position: "fixed", right: 20, bottom: 20, zIndex: 90,
        width: "min(340px, calc(100vw - 40px))",
        borderRadius: 14,
        border: "1px solid rgba(201,162,39,0.45)",
        background: "rgba(9,18,42,0.97)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 20px 60px rgba(6,13,31,0.6), 0 0 0 1px rgba(168,207,240,0.08)",
        padding: "18px 18px 16px",
      }}
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16, padding: 4, lineHeight: 1 }}
      >
        ×
      </button>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <span
          aria-hidden="true"
          style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, rgba(232,197,90,0.28), rgba(201,162,39,0.14))",
            border: "1px solid rgba(201,162,39,0.4)", color: "#e8c55a", fontSize: 17,
          }}
        >
          ✦
        </span>
        <div style={{ minWidth: 0 }}>
          <p style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 4px" }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", padding: "2px 7px", borderRadius: 99, background: "rgba(201,162,39,0.25)", color: "#f0d47a" }}>NEW</span>
            <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700, color: "#ffffff" }}>{ANNOUNCEMENT.title}</span>
          </p>
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.55, margin: "0 0 12px" }}>{ANNOUNCEMENT.subtitle}</p>
          <a
            href={ANNOUNCEMENT.href}
            onClick={dismiss}
            className="btn-cta"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-jakarta)", fontSize: 12.5, fontWeight: 700, lineHeight: 1,
              height: 36, padding: "0 18px", borderRadius: 8,
              background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e",
              textDecoration: "none",
            }}
          >
            {ANNOUNCEMENT.cta}
          </a>
        </div>
      </div>
    </div>
  );
}
