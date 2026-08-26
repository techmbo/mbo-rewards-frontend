"use client";
export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "140px 32px 100px",
        overflow: "hidden",
        background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 45%, #142254 75%, #0d1b3e 100%)",
      }}
    >
      <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 800, height: 500, background: "radial-gradient(ellipse, rgba(41,82,168,0.35) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
      <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />

      <div style={{ position: "relative", maxWidth: 820, textAlign: "center", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <div style={{ width: 28, height: 1, background: "linear-gradient(90deg, transparent, #c9a227)" }} />
          <span className="section-label" style={{ color: "#c9a227", letterSpacing: "0.18em" }}>Affiliate Infrastructure API</span>
          <div style={{ width: 28, height: 1, background: "linear-gradient(90deg, #c9a227, transparent)" }} />
        </div>

        <h1
          style={{
            fontFamily: "var(--font-jakarta)",
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.04,
            color: "#ffffff",
            marginBottom: 28,
          }}
        >
          The infrastructure layer
          <br />
          <span className="text-gold">for affiliate commerce.</span>
        </h1>

        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "clamp(15px, 1.8vw, 18px)",
            color: "rgba(255,255,255,0.45)",
            maxWidth: 520,
            margin: "0 auto 48px",
            lineHeight: 1.7,
          }}
        >
          One REST API. 500+ campaigns across every major affiliate network.
          Server-side attribution. No cookies, no SDKs forced on your users.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
          <a
            href="/contact"
            style={{
              fontFamily: "var(--font-jakarta)",
              fontSize: 14,
              fontWeight: 700,
              padding: "14px 32px",
              borderRadius: 9,
              background: "linear-gradient(135deg, #f0d47a 0%, #e8c55a 30%, #c9a227 100%)",
              color: "#0d1b3e",
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(201,162,39,0.35)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,162,39,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(201,162,39,0.35)"; }}
          >
            Request access
          </a>
          <a
            href="/docs"
            style={{
              fontFamily: "var(--font-jakarta)",
              fontSize: 14,
              fontWeight: 600,
              padding: "14px 32px",
              borderRadius: 9,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.75)",
              textDecoration: "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          >
            API docs →
          </a>
        </div>
      </div>

      {/* Code window */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 760, marginTop: 80 }}>
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(201,162,39,0.15)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
          <div style={{ background: "#0a1428", padding: "12px 20px", display: "flex", alignItems: "center", gap: 7, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
            <span className="code-font" style={{ marginLeft: 12, color: "rgba(201,162,39,0.4)", fontSize: 11 }}>GET /v1/campaigns</span>
            <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(40,200,64,0.15)", color: "#28c840", fontWeight: 600 }}>200 OK</span>
          </div>
          <div style={{ background: "#07101f", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            <div style={{ padding: "24px 28px", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="code-font" style={{ color: "rgba(255,255,255,0.2)", marginBottom: 14, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Request</p>
              <pre className="code-font" style={{ color: "#cdd6f4", margin: 0, fontSize: "0.73rem", lineHeight: 1.8 }}><code>{`GET /v1/campaigns
Authorization: Bearer sk_live_...
X-Platform-Id: plat_abc
X-User-Token: opaque_id
X-Segment: premium`}</code></pre>
            </div>
            <div style={{ padding: "24px 28px" }}>
              <p className="code-font" style={{ color: "rgba(255,255,255,0.2)", marginBottom: 14, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Response</p>
              <pre className="code-font" style={{ margin: 0, fontSize: "0.73rem", lineHeight: 1.8 }}><code>
<span style={{ color: "#89b4fa" }}>{`{
  "campaigns": [`}</span>
<span style={{ color: "#cdd6f4" }}>{`    {
      "id": `}</span><span style={{ color: "#a6e3a1" }}>"camp_9x2k"</span><span style={{ color: "#cdd6f4" }}>{`,
      "merchant": `}</span><span style={{ color: "#a6e3a1" }}>"Myntra"</span><span style={{ color: "#cdd6f4" }}>{`,
      "commission": `}</span><span style={{ color: "#f0d47a" }}>"8%"</span><span style={{ color: "#cdd6f4" }}>{`,
      "rank": `}</span><span style={{ color: "#f0d47a" }}>1</span>
<span style={{ color: "#cdd6f4" }}>{"    }"}</span>
<span style={{ color: "#89b4fa" }}>{"  ],"}</span>{"\n"}
<span style={{ color: "#89b4fa" }}>"total"</span><span style={{ color: "#cdd6f4" }}>: </span><span style={{ color: "#f0d47a" }}>547</span>
<span style={{ color: "#89b4fa" }}>{"}"}</span>
              </code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
