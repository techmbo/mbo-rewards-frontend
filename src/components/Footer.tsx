export default function Footer() {
  const cols = [
    {
      heading: "Product",
      links: [
        { label: "Product", href: "/product" },
        { label: "How it works", href: "/how-it-works" },
        { label: "Security", href: "/security" },
        { label: "Pricing", href: "/pricing" },
        { label: "Revenue Simulator", href: "/revenue-simulator" },
      ],
    },
    {
      heading: "Use cases",
      links: [
        { label: "Banking Apps", href: "/use-cases" },
        { label: "Fintech Platforms", href: "/use-cases" },
        { label: "Digital Platforms", href: "/use-cases" },
        { label: "Loyalty Platforms", href: "/use-cases" },
      ],
    },
    {
      heading: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "About MBO Rewards", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
      ],
    },
  ];

  return (
    <footer style={{ background: "#060d1f", padding: "80px 32px 48px", borderTop: "1px solid rgba(201,162,39,0.1)", position: "relative", overflow: "hidden" }}>

      {/* Crystal radial glow — simulates light hitting top face of the gem */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "80%", height: 320, background: "radial-gradient(ellipse at 50% 0%, rgba(74,132,196,0.13) 0%, rgba(41,82,168,0.06) 40%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr", gap: 48, marginBottom: 64 }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <img src="/logos/mbo-logo.webp" alt="MBO Rewards" width={393} height={152} loading="lazy" style={{ height: 72, width: "auto" }} />
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, maxWidth: 240, marginBottom: 24 }}>
              MBO Rewards is an infrastructure layer for affiliate commerce powered by a unified API.
            </p>
            {/* Crystal badge */}
            <div style={{
              display: "inline-block",
              padding: "7px 14px",
              borderRadius: 7,
              background: "rgba(41,82,168,0.15)",
              border: "1px solid rgba(168,207,240,0.25)",
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(168,207,240,0.9)", letterSpacing: "0.12em", textTransform: "uppercase" }}>API Infrastructure</p>
            </div>
          </div>

          {/* Nav cols */}
          {cols.map(col => (
            <div key={col.heading}>
              <p className="section-label" style={{ color: "rgba(201,162,39,0.6)", marginBottom: 20, fontSize: 10 }}>{col.heading}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="footer-link" style={{ fontSize: 13.5, textDecoration: "none" }}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Crystal cyan shimmer divider — replaces gold line */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(168,207,240,0.15) 20%, rgba(107,168,216,0.4) 50%, rgba(168,207,240,0.15) 80%, transparent 100%)", marginBottom: 28 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© {new Date().getFullYear()} MBO Rewards. All rights reserved.</p>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Built for regulated platforms · Zero PII stored</p>
            <a href="/privacy" className="footer-link-sm" style={{ fontSize: 11, textDecoration: "none" }}>Privacy</a>
            <a href="/terms" className="footer-link-sm" style={{ fontSize: 11, textDecoration: "none" }}>Terms</a>
            <a href="/cookies" className="footer-link-sm" style={{ fontSize: 11, textDecoration: "none" }}>Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
