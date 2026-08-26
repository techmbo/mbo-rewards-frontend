"use client";

const posts = [
  {
    slug: "affiliate-commerce-api-fintech",
    title: "Why Fintech Platforms Need a Dedicated Affiliate Commerce API",
    excerpt: "Open-web affiliate tooling was never built for authenticated, in-app environments. Here's what's broken — and how MBO Rewards fixes it with a unified API layer.",
    date: "June 10, 2026",
    readTime: "5 min read",
    tag: "Infrastructure",
  },
  {
    slug: "server-side-attribution-vs-cookies",
    title: "Server-Side Attribution vs. Cookie Tracking: What Fintech Platforms Need to Know",
    excerpt: "Cookie-based tracking breaks in apps, fails on iOS, and exposes platforms to compliance risk. MBO Rewards uses server-side attribution — here's why it matters.",
    date: "June 3, 2026",
    readTime: "6 min read",
    tag: "Technical",
  },
  {
    slug: "embedded-affiliate-commerce-banking-apps",
    title: "Embedded Affiliate Commerce: The New Revenue Layer for Banking Apps",
    excerpt: "Banks have the highest-intent, most-trusted user base in consumer finance. MBO Rewards turns that into affiliate revenue — without building a rewards product.",
    date: "May 27, 2026",
    readTime: "4 min read",
    tag: "Use Cases",
  },
];

export default function BlogList() {
  return (
    <section style={{ background: "#ffffff", padding: "80px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>
        {posts.map((post, i) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "start", padding: "40px 0", borderBottom: i < posts.length - 1 ? "1px solid #f0f4fa" : "none", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#c9a227", letterSpacing: "0.1em", textTransform: "uppercase" }}>{post.tag}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{post.date}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>·</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{post.readTime}</span>
              </div>
              <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", marginBottom: 10, lineHeight: 1.25 }}>{post.title}</h2>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, maxWidth: 640 }}>{post.excerpt}</p>
            </div>
            <div style={{ flexShrink: 0, paddingTop: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#c9a227" }}>Read →</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
