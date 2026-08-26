import PageShell from "@/components/PageShell";

const modules = [
  {
    tag: "Core API",
    title: "Rewards API",
    color: "#2952a8",
    body: "Single REST endpoint. All networks. Campaign data normalised, ranked, and delivered with tracking links ready to use.",
    points: [
      "Campaign fetch with user-segment filtering",
      "Click attribution — server-side, zero cookies",
      "Conversion postback receiver with fraud scoring",
      "Webhook events for every lifecycle state",
      "iOS · Android · React Native · Web SDKs",
      "OpenAPI 3.1 spec",
    ],
    code: `GET /v1/campaigns
X-User-Token: opaque_id
X-Segment: premium

POST /v1/clicks
{ "campaign_id": "camp_9x2k", "user_token": "..." }
→ { "token": "tkn_j7Kp...", "redirect_url": "..." }`,
  },
  {
    tag: "Operations",
    title: "Partner Dashboard",
    color: "#1a3070",
    body: "Real-time analytics for your team. Clicks, conversions, commission accruals — across every merchant and network in one view.",
    points: [
      "Real-time click + conversion event stream",
      "Campaign-level attribution reporting",
      "Commission accrual and settlement timeline",
      "CSV / XLSX export for finance and audit",
      "Role-based access — multiple users",
    ],
    code: `// Commission statement export
GET /v1/commissions?period=2026-06&format=csv

// Real-time event stream
GET /v1/events?type=conversion&since=2026-06-01`,
  },
  {
    tag: "Intelligence",
    title: "AI Campaign Ranking",
    color: "#c9a227",
    body: "Server-side ranking model. Campaigns ordered by predicted conversion likelihood, personalised to the segment signals you pass in each request.",
    points: [
      "Segment-aware personalised ranking",
      "Merchant affinity from your platform's conversion history",
      "Category preference signals from click behaviour",
      "Continuously retrained — no ML infra on your side",
      "Ranking signals exposed via API for transparency",
    ],
    code: `// Ranking signals in response
{
  "id": "camp_9x2k",
  "ranking_score": 0.94,
  "ranking_signals": {
    "segment_match": 0.91,
    "merchant_affinity": 0.88,
    "category_fit": 0.97
  }
}`,
  },
  {
    tag: "Risk",
    title: "Fraud Detection",
    color: "#e05a5a",
    body: "Every click and conversion goes through the fraud pipeline before attribution is confirmed. Protects merchant relationships and your commission revenue.",
    points: [
      "Server-side click validation at attribution time",
      "Device fingerprint + velocity anomaly scoring",
      "VPN and proxy abuse detection",
      "Click stuffing and bot traffic filtering",
      "Automated commission hold for flagged events",
    ],
    code: `// Fraud score in postback response
{
  "conversion_id": "conv_abc...",
  "commission": 336,
  "fraud_score": 0.02,
  "status": "approved"
}
// status: approved | held | rejected`,
  },
];

export default function PlatformPage() {
  return (
    <PageShell>
      <section
        style={{
          padding: "64px 32px 64px",
          background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 20 }}>Platform</span>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(34px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.08, marginBottom: 20, maxWidth: 640 }}>
            Four layers.<br /><span className="text-gold">One integration.</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 480 }}>
            API, analytics, AI ranking, and fraud detection — all active on day one. No additional modules, no feature flags, no upgrade tiers.
          </p>
        </div>
      </section>

      <section style={{ background: "#ffffff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>
          {modules.map((m, i) => (
            <div
              key={m.title}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 72,
                alignItems: "start",
                paddingBottom: 72,
                marginBottom: 72,
                borderBottom: i < modules.length - 1 ? "1px solid #f0f4fa" : "none",
              }}
            >
              <div>
                <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 5, background: `${m.color}15`, marginBottom: 18 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: m.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.tag}</span>
                </div>
                <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#0d1b3e", marginBottom: 14, lineHeight: 1.15 }}>{m.title}</h2>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, marginBottom: 24 }}>{m.body}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 9 }}>
                  {m.points.map(pt => (
                    <li key={pt} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, color: "#475569" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: m.color, flexShrink: 0, marginTop: 6 }} />
                      {pt}
                    </li>
                  ))}
                </ul>
                <a href="/contact" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 700, padding: "10px 22px", borderRadius: 8, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none" }}>
                  Request access
                </a>
              </div>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e8edf5", background: "#0a1428" }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 6 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#3d3d3d" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#3d3d3d" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#3d3d3d" }} />
                </div>
                <pre className="code-font" style={{ margin: 0, padding: "20px 24px", color: "#cdd6f4", fontSize: "0.72rem", overflowX: "auto", lineHeight: 1.8 }}>
                  <code>{m.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "#f8f9fc", padding: "72px 32px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 14 }}>Ready to integrate?</h2>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, marginBottom: 32 }}>We'll scope your use case and get you to sandbox credentials in one call.</p>
          <a href="/contact" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700, padding: "13px 32px", borderRadius: 9, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none", boxShadow: "0 4px 20px rgba(201,162,39,0.3)" }}>
            Request a demo
          </a>
        </div>
      </section>
    </PageShell>
  );
}
