"use client";

export default function CTA() {
  return (
    <section style={{ background: "#f8f9fc", padding: "100px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            borderRadius: 20,
            overflow: "hidden",
            background: "linear-gradient(150deg, #0d1b3e 0%, #060d1f 100%)",
            border: "1px solid rgba(201,162,39,0.15)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            position: "relative",
          }}
        >
          <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />

          <div style={{ padding: "64px 60px" }}>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 20 }}>Get started</span>
            <h2
              style={{
                fontFamily: "var(--font-jakarta)",
                fontSize: "clamp(26px, 3vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                color: "#ffffff",
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              Ready to integrate?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.72, maxWidth: 340 }}>
              Request access and we'll send sandbox credentials, full API documentation, and a dedicated integration contact — within one business day.
            </p>
          </div>

          <div style={{ padding: "64px 60px", borderLeft: "1px solid rgba(201,162,39,0.1)" }}>
            <form onSubmit={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { placeholder: "Work email", type: "email" },
                { placeholder: "Company", type: "text" },
              ].map(f => (
                <input
                  key={f.placeholder}
                  type={f.type}
                  placeholder={f.placeholder}
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: 9,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#f1f5f9",
                    fontSize: 14,
                    fontFamily: "var(--font-inter)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              ))}
              <select
                defaultValue=""
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: 9,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#0d1b3e",
                  color: "#64748b",
                  fontSize: 14,
                  fontFamily: "var(--font-inter)",
                  outline: "none",
                }}
              >
                <option value="" disabled>Platform type</option>
                <option value="bank">Bank / NBFC</option>
                <option value="fintech">Fintech app</option>
                <option value="ecommerce">E-commerce</option>
                <option value="media">Media / Content</option>
                <option value="loyalty">Loyalty platform</option>
                <option value="travel">Travel & Lifestyle</option>
                <option value="publisher">Publisher</option>
                <option value="other">Other</option>
              </select>
              <button
                type="submit"
                style={{
                  marginTop: 6,
                  width: "100%",
                  padding: "14px 0",
                  borderRadius: 9,
                  border: "none",
                  background: "linear-gradient(135deg, #f0d47a 0%, #e8c55a 30%, #c9a227 100%)",
                  color: "#0d1b3e",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "var(--font-jakarta)",
                  cursor: "pointer",
                  boxShadow: "0 4px 24px rgba(201,162,39,0.35)",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Request access
              </button>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", textAlign: "center" }}>
                No commitments. Respond within one business day.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
