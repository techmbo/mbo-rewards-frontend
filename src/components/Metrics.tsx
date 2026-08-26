"use client";
const stats = [
  { val: "500+", label: "Live campaigns" },
  { val: "12+", label: "Campaign categories" },
  { val: "2–3 days", label: "Typical integration" },
  { val: "0", label: "Upfront cost" },
  { val: "Monthly", label: "Settlement cycle" },
  { val: "Zero PII", label: "Stored by MBO" },
];

export default function Metrics() {
  return (
    <section style={{ background: "#0d1b3e", padding: "72px 32px", borderTop: "1px solid rgba(201,162,39,0.1)", borderBottom: "1px solid rgba(201,162,39,0.1)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0 }}>
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "28px 24px",
                borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                textAlign: "center",
              }}
            >
              <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 26, fontWeight: 800, color: "#e8c55a", marginBottom: 6, letterSpacing: "-0.02em" }}>{s.val}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
