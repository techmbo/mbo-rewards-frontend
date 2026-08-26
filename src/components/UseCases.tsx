"use client";
const cases = [
  {
    industry: "Banking & Fintech",
    headline: "Revenue inside your existing app",
    body: "Banks, UPI apps, and wallets have captive, high-intent users. MBO adds a compliant white-label rewards surface without touching core infrastructure.",
    tags: ["Net banking", "Wallets", "UPI", "Neobanks", "BNPL"],
  },
  {
    industry: "E-commerce",
    headline: "New revenue at every point in the funnel",
    body: "Surface affiliate campaigns post-checkout, on empty carts, or in recommendation feeds. Commission revenue with zero disruption to the buying experience.",
    tags: ["Marketplaces", "D2C", "Quick commerce", "Grocery"],
  },
  {
    industry: "Media & Content",
    headline: "Monetise without ads",
    body: "News apps, OTT, and content platforms can surface campaigns to logged-in users. Commission rates consistently outperform display CPMs.",
    tags: ["News apps", "OTT", "Podcasting", "Subscriptions"],
  },
  {
    industry: "Loyalty Programs",
    headline: "Extend your points economy",
    body: "Plug MBO into your existing points engine to offer cashback from 500+ merchants, backed by server-side attribution — not fragile click tracking.",
    tags: ["Points platforms", "Co-brand cards", "Travel rewards"],
  },
  {
    industry: "Travel & Lifestyle",
    headline: "Contextual deals at intent moments",
    body: "Travel insurance at booking, restaurants at check-in, experiences on arrival. MBO's ranking model surfaces the right campaign at the right moment.",
    tags: ["Flight booking", "Hotels", "Experiences", "Insurance"],
  },
  {
    industry: "Publishers",
    headline: "Authenticated surfaces convert better",
    body: "Access the same campaign inventory via API and serve it through logged-in surfaces that outperform open-web affiliate traffic 4–6×.",
    tags: ["Price comparison", "Cashback", "Deal platforms"],
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" style={{ background: "#f8f9fc", padding: "100px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Use cases</span>
          <h2
            style={{
              fontFamily: "var(--font-jakarta)",
              fontSize: "clamp(26px, 3vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#0d1b3e",
              lineHeight: 1.1,
              maxWidth: 440,
            }}
          >
            Any platform with an audience.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#e8edf5", border: "1px solid #e8edf5", borderRadius: 16, overflow: "hidden" }}>
          {cases.map((c) => (
            <div
              key={c.industry}
              style={{ background: "#ffffff", padding: "32px 28px", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fafbfd")}
              onMouseLeave={e => (e.currentTarget.style.background = "#ffffff")}
            >
              <span className="section-label" style={{ color: "#94a3b8", display: "block", marginBottom: 12 }}>{c.industry}</span>
              <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 16, fontWeight: 700, color: "#0d1b3e", marginBottom: 10, letterSpacing: "-0.01em", lineHeight: 1.3 }}>{c.headline}</h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, marginBottom: 18 }}>{c.body}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {c.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: "#475569", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 4, padding: "2px 7px" }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28, textAlign: "right" }}>
          <a href="/use-cases" style={{ fontSize: 13, fontWeight: 600, color: "#2952a8", textDecoration: "none" }}>All use cases →</a>
        </div>
      </div>
    </section>
  );
}
