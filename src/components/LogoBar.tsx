"use client";
const stats = [
  { value: "500+", label: "Live campaigns" },
  { value: "2–3 days", label: "Integration time" },
  { value: "100%", label: "White-label" },
  { value: "0", label: "Upfront cost" },
];

export default function LogoBar() {
  return (
    <section style={{ background: "#ffffff", borderTop: "1px solid #f0f0f4", borderBottom: "1px solid #f0f0f4" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderLeft: "1px solid #f0f0f4" }}>
          {stats.map((s) => (
            <div
              key={s.value}
              style={{
                padding: "40px 32px",
                borderRight: "1px solid #f0f0f4",
                borderBottom: "none",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-jakarta)",
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, #1a3070 0%, #2952a8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: 4,
                }}
              >
                {s.value}
              </p>
              <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
