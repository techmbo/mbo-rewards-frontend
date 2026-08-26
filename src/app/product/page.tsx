import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Affiliate Commerce API — Campaign Engine, Tracking & Dashboard | MBO Rewards",
  description:
    "Four components. One integration. Campaign API, server-side tracking engine, AI ranking, and real-time dashboard — built for regulated fintech and banking platforms.",
  alternates: { canonical: "https://mborewards.com/product" },
  openGraph: {
    title: "Affiliate Commerce API — Campaign Engine, Tracking & Dashboard | MBO Rewards",
    description: "Four components. One integration. Campaign API, server-side tracking engine, AI ranking, and real-time dashboard — built for regulated fintech and banking platforms.",
    url: "https://mborewards.com/product",
  },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "MBO Rewards", item: "https://mborewards.com" },
    { "@type": "ListItem", position: 2, name: "Product", item: "https://mborewards.com/product" },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MBO Rewards API",
  applicationCategory: "FinanceApplication",
  description: "Unified affiliate commerce API for banking and fintech platforms. 500+ campaigns, server-side tracking, zero PII.",
  operatingSystem: "Any (REST API)",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Revenue share only — no upfront cost",
  },
};

export default function ProductPage() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />

      <section style={{ padding: "64px 32px 64px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)", position: "relative", overflow: "hidden" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 20 }}>Product</span>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.08, marginBottom: 20, maxWidth: 720 }}>
            MBO Rewards Product — Campaign API, Tracking Engine & Fraud Scoring
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 520 }}>
            MBO Rewards connects affiliate networks with your application through a unified infrastructure layer. Four components. One integration.
          </p>
        </div>
      </section>

      {/* Core components */}
      <section style={{ background: "#ffffff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Core components</span>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 40 }}>Four layers. One integration.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              {
                title: "API Layer",
                body: "A versioned REST API that returns campaign data and tracking identifiers in a single call. Your team integrates once and retrieves everything — campaigns, tracking IDs, and commission status — without separate calls to individual networks. The sandbox environment is schema-identical to production, so testing reflects real integration behaviour. JSON throughout. Webhook support for downstream events.",
              },
              {
                title: "Campaign Engine",
                body: "Aggregates campaigns from every major affiliate network, normalises them into a consistent schema, and deduplicates offers that appear across multiple networks. Standardised fields across merchants — category, cashback rate, tracking window, terms — so your application renders consistently regardless of the originating network. Campaigns are ranked server-side by historical conversion likelihood for your platform category.",
              },
              {
                title: "Tracking Engine",
                body: "Generates a unique attribution token at the moment a user clicks a campaign link. That token is passed server-to-server through the purchase flow — no cookies, no client-side scripts, no browser state. Fraud scoring runs at attribution time, before commission is confirmed, using device signals, velocity patterns, and behavioural heuristics. See <a href='/security' style='color:#c9a227;text-decoration:none;'>our security architecture</a> for the full technical detail.",
              },
              {
                title: "Dashboard",
                body: "Per-campaign performance view with real-time clicks, confirmed conversions, GMV, and accrued commission. Reports are available as API responses and CSV export. Monthly commission statements are generated automatically. Webhook events fire on conversion confirmation, enabling your platform to trigger downstream reward logic — points credit, cashback posting, or notification — without polling.",
              },
            ].map(v => (
              <div key={v.title} style={{ padding: "32px 28px", borderRadius: 14, border: "1px solid #edf0f7" }}>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 17, fontWeight: 800, color: "#0d1b3e", marginBottom: 12 }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: v.body }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System architecture */}
      <section style={{ background: "#f8f9fc", padding: "72px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>System architecture</span>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 48 }}>How campaigns flow from merchant to commission.</h2>
          <div className="m-vflow" style={{ display: "flex", alignItems: "center", overflowX: "auto", gap: 0 }}>
            {[
              ["Brand", "Merchant campaigns and commission rates"],
              ["Network", "Affiliate networks aggregated by MBO"],
              ["MBO Rewards", "Normalise, rank, and track"],
              ["App", "Your platform renders the offers"],
              ["User", "Clicks and interacts"],
              ["Purchase", "Transaction completed"],
              ["Tracking", "Server-side attribution"],
              ["Commission", "Validated and settled"],
            ].map(([title, sub], i, arr) => (
              <div key={title} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div style={{ textAlign: "center", padding: "0 16px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: title === "MBO Rewards" ? "linear-gradient(135deg, #e8c55a, #c9a227)" : "#ffffff", border: title === "MBO Rewards" ? "none" : "1px solid #edf0f7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 10, fontWeight: 800, color: title === "MBO Rewards" ? "#0d1b3e" : "#94a3b8" }}>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 11, fontWeight: 700, color: "#0d1b3e", marginBottom: 4, whiteSpace: "nowrap" }}>{title}</p>
                  <p style={{ fontSize: 10, color: "#94a3b8", maxWidth: 90, lineHeight: 1.5, margin: "0 auto" }}>{sub}</p>
                </div>
                {i < arr.length - 1 && <div className="m-vconn" style={{ flexShrink: 0, width: 20, height: 1, background: "#e2e8f0" }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data flow */}
      <section style={{ background: "#ffffff", padding: "72px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <div>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Data flow</span>
            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 28 }}>What moves through the system.</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Campaign data", "Tracking IDs", "Click events", "Conversion data", "Commission records"].map(pt => (
                <div key={pt} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", border: "1px solid #edf0f7", borderRadius: 8 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a, #c9a227)", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "#475569" }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Output</span>
            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 28 }}>What your platform receives.</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Campaigns ready to display", "Tracking-enabled links", "Real-time performance data", "Commission reporting"].map(pt => (
                <div key={pt} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", border: "1px solid #edf0f7", borderRadius: 8, background: "#fafbff" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a, #c9a227)", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "#475569" }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integration */}
      <section style={{ background: "#f8f9fc", padding: "56px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Integration</span>
            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 20 }}>REST API. 2–3 day integration.</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["REST API", "JSON responses", "Webhooks", "2–3 day integration"].map(pt => (
                <div key={pt} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9a227", flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: "#475569" }}>{pt}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, display: "flex", gap: 16 }}>
              <a href="/how-it-works" style={{ fontSize: 13, fontWeight: 600, color: "#c9a227", textDecoration: "none" }}>See integration steps →</a>
              <a href="/security" style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none" }}>Security & compliance →</a>
            </div>
          </div>
          <div style={{ padding: "28px 32px", borderRadius: 14, border: "1px solid rgba(201,162,39,0.2)", background: "linear-gradient(150deg, #0d1b3e, #060d1f)", position: "relative" }}>
            <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: "14px 14px 0 0" }} />
            <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>Positioning</p>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.75 }}>
              MBO Rewards is not a marketplace. It is an infrastructure layer for affiliate commerce.
            </p>
          </div>
        </div>
      </section>

      <section style={{ background: "#ffffff", padding: "72px 32px" }}>
        <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 14 }}>Ready to integrate?</h2>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>We'll scope your use case and issue sandbox credentials in one call.</p>
          <a href="/contact" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 700, padding: "12px 28px", borderRadius: 8, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none", boxShadow: "0 4px 20px rgba(201,162,39,0.3)" }}>
            Get API Access
          </a>
        </div>
      </section>
    </PageShell>
  );
}
