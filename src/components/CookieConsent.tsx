"use client";
import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, left: 24, right: 24, zIndex: 999,
      maxWidth: 560, margin: "0 auto",
      background: "#060d1f", borderRadius: 12,
      border: "1px solid rgba(201,162,39,0.2)",
      padding: "20px 24px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
    }}>
      <p style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, minWidth: 200 }}>
        We use essential cookies only.{" "}
        <a href="/cookies" style={{ color: "#c9a227", textDecoration: "underline" }}>Cookie Policy</a>
        {" "}·{" "}
        <a href="/privacy" style={{ color: "#c9a227", textDecoration: "underline" }}>Privacy Policy</a>
      </p>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={decline} style={{ fontFamily: "var(--font-jakarta)", fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
          Decline
        </button>
        <button onClick={accept} style={{ fontFamily: "var(--font-jakarta)", fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 6, border: "none", background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", cursor: "pointer" }}>
          Accept
        </button>
      </div>
    </div>
  );
}
