"use client";
export default function Solution() {
  return (
    <section
      id="solution"
      style={{
        padding: "100px 32px",
        background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 55%, #142254 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: "50%", right: -200, transform: "translateY(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(41,82,168,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 24 }}>The solution</span>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-jakarta)",
                fontSize: "clamp(30px, 3.5vw, 48px)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                color: "#ffffff",
                lineHeight: 1.1,
                marginBottom: 24,
              }}
            >
              One integration.
              <br />
              <span className="text-gold">Every affiliate network.</span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, marginBottom: 28, maxWidth: 400 }}>
              MBO sits between your platform and the entire affiliate ecosystem — aggregating, normalising, ranking, and tracking, so your team integrates once.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 10 }}>
              {["Single REST endpoint, all networks", "Server-side attribution — no cookies", "AI-ranked campaigns per user segment", "Zero PII stored by MBO"].map(pt => (
                <li key={pt} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9a227", flexShrink: 0 }} />
                  {pt}
                </li>
              ))}
            </ul>
            <a
              href="/contact"
              style={{
                display: "inline-flex",
                fontFamily: "var(--font-jakarta)",
                fontSize: 13,
                fontWeight: 700,
                padding: "12px 28px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)",
                color: "#0d1b3e",
                textDecoration: "none",
              }}
            >
              Request access
            </a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { label: "Your platform", sub: "iOS · Android · Web · Any stack", border: "rgba(89,145,216,0.3)", bg: "rgba(41,82,168,0.1)", text: "#82b0f0" },
              { label: "MBO Rewards API", sub: "api.mborewards.com · REST · JSON · Webhooks", border: "rgba(201,162,39,0.5)", bg: "rgba(201,162,39,0.08)", text: "#e8c55a", highlight: true },
              { label: "Affiliate networks", sub: "500+ campaigns · 12+ categories · Multi-network", border: "rgba(255,255,255,0.08)", bg: "rgba(255,255,255,0.03)", text: "#64748b" },
            ].map((layer, i) => (
              <div key={i}>
                <div style={{ border: `1px solid ${layer.border}`, background: layer.bg, borderRadius: 12, padding: "18px 24px", boxShadow: (layer as any).highlight ? "0 0 40px rgba(201,162,39,0.08)" : undefined }}>
                  <p style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700, fontSize: 14, color: layer.text, marginBottom: 3 }}>{layer.label}</p>
                  <p style={{ fontSize: 12, color: "#334155" }}>{layer.sub}</p>
                </div>
                {i < 2 && (
                  <div style={{ display: "flex", justifyContent: "center", margin: "3px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 1, height: 10, background: "rgba(201,162,39,0.25)" }} />
                      <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid rgba(201,162,39,0.25)" }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
