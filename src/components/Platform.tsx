"use client";
const modules = [
  {
    tag: "Core API",
    title: "Rewards API",
    points: ["Campaign fetch with segment filtering", "Click attribution — server-side, no cookies", "Conversion postback receiver", "Webhook events for every state", "OpenAPI 3.1 spec"],
    color: "#2952a8",
  },
  {
    tag: "Operations",
    title: "Partner Dashboard",
    points: ["Real-time click + conversion stream", "Campaign-level attribution reporting", "Commission accrual timeline", "CSV/XLSX export for finance", "Role-based access control"],
    color: "#1a3070",
  },
  {
    tag: "Intelligence",
    title: "AI Ranking",
    points: ["Segment-aware personalised ranking", "Merchant affinity from conversion history", "Continuously retrained on your data", "Ranking signals available via API"],
    color: "#c9a227",
  },
  {
    tag: "Risk",
    title: "Fraud Detection",
    points: ["Server-side click validation", "Device fingerprint + velocity scoring", "VPN and bot traffic filtering", "Automated commission holds on flags"],
    color: "#e05a5a",
  },
];

export default function Platform() {
  return (
    <section id="platform" style={{ background: "#ffffff", padding: "100px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 80, alignItems: "start" }}>
          <div style={{ position: "sticky", top: 120 }}>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Product</span>
            <h2
              style={{
                fontFamily: "var(--font-jakarta)",
                fontSize: "clamp(26px, 3vw, 38px)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                color: "#0d1b3e",
                lineHeight: 1.12,
                marginBottom: 16,
              }}
            >
              Four layers.<br />One integration.
            </h2>
            <p style={{ fontSize: 14.5, color: "#64748b", lineHeight: 1.7 }}>
              API, analytics, AI ranking, and fraud detection — active on day one.
            </p>
            <a href="/platform" style={{ display: "inline-block", marginTop: 24, fontSize: 13, fontWeight: 600, color: "#2952a8", textDecoration: "none" }}>
              Full platform docs →
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {modules.map((m) => (
              <div
                key={m.title}
                style={{ border: "1px solid #edf0f7", borderRadius: 14, padding: "28px 24px", background: "#ffffff", transition: "box-shadow 0.2s, border-color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 40px rgba(13,27,62,0.07)"; e.currentTarget.style.borderColor = "#d8deec"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#edf0f7"; }}
              >
                <div style={{ display: "inline-block", padding: "3px 9px", borderRadius: 5, background: `${m.color}15`, marginBottom: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: m.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{m.tag}</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 17, fontWeight: 700, color: "#0d1b3e", marginBottom: 14, letterSpacing: "-0.01em" }}>{m.title}</h3>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                  {m.points.map(pt => (
                    <li key={pt} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, color: "#475569" }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: m.color, flexShrink: 0, marginTop: 6 }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
