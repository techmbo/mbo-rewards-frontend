"use client";
const steps = [
  {
    n: "01",
    title: "Fetch campaigns",
    body: "Call the API with an opaque user token and optional segment signals. Get a ranked list of live campaigns with merchant data, commission rates, and tracking links — normalised across all networks.",
    code: `GET /v1/campaigns
Authorization: Bearer sk_live_...
X-User-Token: opaque_id
X-Segment: premium

→ 547 campaigns, AI-ranked`,
  },
  {
    n: "02",
    title: "Track the click",
    body: "When a user taps through, your server calls the click endpoint. We return an attribution token. No cookies, no client-side pixels — works in any app.",
    code: `POST /v1/clicks
{
  "campaign_id": "camp_9x2k",
  "user_token": "opaque_id"
}
→ { "token": "tkn_j7Kp..." }`,
  },
  {
    n: "03",
    title: "Confirm conversion",
    body: "Merchant posts a server-to-server postback. Attribution engine matches the token, runs fraud scoring, validates commission — all server-side.",
    code: `POST /v1/conversions/postback
{
  "token": "tkn_j7Kp...",
  "order_value": 4200,
  "status": "confirmed"
}
→ commission: 336 INR`,
  },
  {
    n: "04",
    title: "Commission settled",
    body: "Verified commissions accumulate and settle monthly — consolidated across every network. One transfer, one statement.",
    code: `// Webhook: commission.credited
{
  "event": "commission.credited",
  "amount": 336,
  "currency": "INR",
  "campaign": "camp_9x2k"
}`,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: "#f8f9fc", padding: "100px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 64 }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>How it works</span>
          <h2
            style={{
              fontFamily: "var(--font-jakarta)",
              fontSize: "clamp(26px, 3vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#0d1b3e",
              lineHeight: 1.1,
              maxWidth: 480,
            }}
          >
            API call to commission.
            <br />Fully automated.
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map((s, i) => (
            <div
              key={s.n}
              style={{
                display: "grid",
                gridTemplateColumns: "64px 1fr 1fr",
                gap: "0 48px",
                alignItems: "start",
                paddingBottom: 48,
                marginBottom: 48,
                borderBottom: i < steps.length - 1 ? "1px solid #e8edf5" : "none",
              }}
            >
              <div style={{ paddingTop: 4 }}>
                <span className="code-font" style={{ fontSize: 11, fontWeight: 700, color: "#c9a227", display: "block", marginBottom: 8, letterSpacing: "0.08em" }}>{s.n}</span>
                <div style={{ width: 1, height: 28, background: "linear-gradient(180deg, #c9a22740 0%, transparent 100%)" }} />
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 19, fontWeight: 700, color: "#0d1b3e", marginBottom: 12, letterSpacing: "-0.015em" }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, color: "#64748b", lineHeight: 1.7 }}>{s.body}</p>
              </div>
              <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e8edf5", background: "#0a1428" }}>
                <pre className="code-font" style={{ margin: 0, padding: "18px 22px", color: "#cdd6f4", fontSize: "0.72rem", overflowX: "auto", lineHeight: 1.8 }}>
                  <code>{s.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
