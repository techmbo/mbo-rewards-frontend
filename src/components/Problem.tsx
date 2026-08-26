"use client";
const problems = [
  {
    n: "01",
    title: "Every affiliate network is a separate integration",
    body: "Different APIs, attribution models, data formats, and credential systems. Building one direct integration takes months. Building twelve is a multi-year commitment.",
  },
  {
    n: "02",
    title: "Cookie tracking doesn't work inside apps",
    body: "Mobile apps, ad blockers, and ITP break client-side attribution. Without server-side tracking, fraud goes undetected and commissions leak.",
  },
  {
    n: "03",
    title: "No tooling was built for authenticated platforms",
    body: "Existing affiliate infrastructure was designed for open-web publishers. Regulated platforms, mobile apps, and logged-in surfaces are an afterthought.",
  },
];

export default function Problem() {
  return (
    <section id="problem" style={{ background: "#ffffff", padding: "100px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 80, alignItems: "start" }}>
          <div style={{ position: "sticky", top: 100 }}>
            <span className="section-label" style={{ color: "#c9a227" }}>The problem</span>
            <h2
              style={{
                fontFamily: "var(--font-jakarta)",
                fontSize: "clamp(26px, 3vw, 38px)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                color: "#0d1b3e",
                marginTop: 16,
                lineHeight: 1.12,
              }}
            >
              Affiliate infrastructure
              <span style={{ color: "#2952a8" }}> was never built for platforms.</span>
            </h2>
          </div>

          {/* Right — problem list */}
          <div>
            {problems.map((p, i) => (
              <div
                key={p.n}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr",
                  gap: 24,
                  paddingBottom: 40,
                  marginBottom: 40,
                  borderBottom: i < problems.length - 1 ? "1px solid #f0f0f4" : "none",
                }}
              >
                <span
                  className="code-font"
                  style={{ color: "#c9a22750", fontSize: 12, fontWeight: 700, paddingTop: 4 }}
                >
                  {p.n}
                </span>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-jakarta)",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#0d1b3e",
                      marginBottom: 12,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {p.title}
                  </h3>
                  <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7 }}>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
