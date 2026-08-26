"use client";
const points = [
  {
    title: "Server-side. Not cookies.",
    body: "Attribution is confirmed via server-to-server postback — not browser cookies, not client-side pixels. Works in mobile apps, behind ad blockers, with ITP enabled.",
  },
  {
    title: "One integration. All networks.",
    body: "We normalise data across every affiliate network we support. You call one endpoint. We handle per-network credentials, data formats, and attribution windows.",
  },
  {
    title: "No PII. No compliance risk.",
    body: "Your users are opaque tokens to MBO. We never receive a name, email, or device identifier. Our data model is designed to be un-reversible.",
  },
  {
    title: "Revenue alignment.",
    body: "Zero setup fees. Zero monthly fees. MBO earns a split of confirmed commissions only — our incentives are structurally aligned with yours.",
  },
];

export default function WhyUs() {
  return (
    <section style={{ background: "#ffffff", padding: "100px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 80, alignItems: "start" }}>
          <div style={{ position: "sticky", top: 120 }}>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Why MBO</span>
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
              Infrastructure decisions
              <span style={{ color: "#2952a8" }}> that matter.</span>
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>
              Built for platforms that can't afford unreliable tracking, compliance risk, or misaligned vendor incentives.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {points.map((p, i) => (
              <div
                key={p.title}
                style={{
                  padding: "28px 0",
                  borderBottom: i < points.length - 1 ? "1px solid #f0f4fa" : "none",
                  display: "grid",
                  gridTemplateColumns: "20px 1fr",
                  gap: 20,
                  alignItems: "start",
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a, #c9a227)", marginTop: 6, flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700, fontSize: 15, color: "#0d1b3e", marginBottom: 6 }}>{p.title}</p>
                  <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.65 }}>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
