"use client";
export default function Pricing() {
  return (
    <section
      id="pricing"
      style={{
        padding: "120px 32px",
        background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 55%, #142254 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
      <div style={{ position: "absolute", bottom: -200, left: "50%", transform: "translateX(-50%)", width: 800, height: 500, background: "radial-gradient(ellipse, rgba(201,162,39,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          {/* Left */}
          <div>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Revenue model</span>
            <h2
              style={{
                fontFamily: "var(--font-jakarta)",
                fontSize: "clamp(32px, 4vw, 52px)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                color: "#ffffff",
                lineHeight: 1.1,
                marginBottom: 28,
              }}
            >
              Zero upfront cost.
              <br />
              <span className="text-gold">Revenue on every conversion.</span>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, maxWidth: 420 }}>
              MBO earns a share of the commission on confirmed conversions only.
              No platform fees, no setup costs, no minimum volumes.
              Your revenue scales directly with your engagement.
            </p>
          </div>

          {/* Right — model breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {[
              { step: "1", label: "User converts", body: "A user completes a qualifying purchase through an affiliate campaign in your app." },
              { step: "2", label: "MBO verifies", body: "Server-side attribution confirms the conversion. Fraud scoring runs. Commission is validated." },
              { step: "3", label: "Revenue credited", body: "Your share settles monthly across all merchants and networks — one statement." },
            ].map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "52px 1fr", gap: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: "#0d1b3e", flexShrink: 0,
                    fontFamily: "var(--font-jakarta)",
                  }}>
                    {item.step}
                  </div>
                  {i < 2 && <div style={{ width: 1, flex: 1, background: "rgba(201,162,39,0.2)", margin: "4px 0" }} />}
                </div>
                <div style={{ paddingLeft: 16, paddingBottom: i < 2 ? 28 : 0 }}>
                  <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>{item.label}</p>
                  <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>{item.body}</p>
                </div>
              </div>
            ))}

            {/* Key numbers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 32 }}>
              {[
                { val: "₹0", label: "Setup fee" },
                { val: "₹0", label: "Monthly fee" },
                { val: "Monthly", label: "Settlement" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center", padding: "20px 16px", borderRadius: 10, border: "1px solid rgba(201,162,39,0.18)", background: "rgba(201,162,39,0.04)" }}>
                  <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 22, fontWeight: 800, color: "#e8c55a", marginBottom: 4 }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: "#334155" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
