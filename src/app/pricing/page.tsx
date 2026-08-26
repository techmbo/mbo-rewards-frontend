import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Pricing — Zero Upfront. Revenue Share Only | MBO Rewards",
  description:
    "No setup fees. No monthly charges. MBO Rewards earns only on confirmed affiliate conversions. Full API access, dashboard, and integration support included.",
  alternates: { canonical: "https://mborewards.com/pricing" },
  openGraph: { title: "Pricing — Zero Upfront. Revenue Share Only | MBO Rewards", description: "No setup fees. No monthly charges. MBO Rewards earns only on confirmed affiliate conversions. Full API access, dashboard, and integration support included.", url: "https://mborewards.com/pricing" },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "MBO Rewards", item: "https://mborewards.com" },
    { "@type": "ListItem", position: 2, name: "Pricing", item: "https://mborewards.com/pricing" },
  ],
};

export default function PricingPage() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <section style={{ padding: "64px 32px 64px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)", position: "relative", overflow: "hidden" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 20 }}>Pricing</span>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1, marginBottom: 20, maxWidth: 720 }}>
            Pricing — Zero Upfront. Revenue Share on Confirmed Conversions Only.
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 440 }}>
            Performance-based model aligned with platform growth. Pricing scales with usage and platform performance.
          </p>
        </div>
      </section>

      {/* Model */}
      <section style={{ background: "#ffffff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <div>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Model</span>
            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 24 }}>Zero upfront. Revenue on every conversion.</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
              {["No upfront cost", "No fixed fees", "Revenue share on confirmed conversions"].map(pt => (
                <div key={pt} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", border: "1px solid #edf0f7", borderRadius: 10 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a, #c9a227)", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "#475569" }}>{pt}</span>
                </div>
              ))}
            </div>

            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>How it works</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                ["01", "User interacts", "User clicks on an offer inside your platform"],
                ["02", "Conversion tracked", "Purchase confirmed via server-side postback"],
                ["03", "Commission generated", "Merchant commission validated and credited"],
                ["04", "Revenue shared", "MBO earns a percentage of confirmed commission"],
              ].map(([num, title, body]) => (
                <div key={num} style={{ display: "flex", gap: 20, padding: "20px 0", borderBottom: "1px solid #f0f4fa" }}>
                  <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a, #c9a227)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 10, fontWeight: 800, color: "#0d1b3e" }}>{num}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 700, color: "#0d1b3e", marginBottom: 3 }}>{title}</p>
                    <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>What's included</span>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                ["Campaign access", "500+ campaigns across all major networks"],
                ["API integration", "REST API, all endpoints, all environments"],
                ["Tracking", "Server-side attribution, fraud scoring, webhooks"],
                ["Reporting", "Real-time dashboard, exports, commission statements"],
              ].map(([item, sub]) => (
                <div key={item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", borderBottom: "1px solid #f0f4fa" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a, #c9a227)", flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "#0d1b3e", fontWeight: 500 }}>{item}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#94a3b8", textAlign: "right", maxWidth: 180 }}>{sub}</span>
                </div>
              ))}
            </ul>

            <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(201,162,39,0.2)", background: "linear-gradient(150deg, #0d1b3e, #060d1f)", padding: "32px 28px", position: "relative" }}>
              <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
              <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>Revenue model</p>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 16 }}>
                MBO earns a percentage of confirmed affiliate commissions. Rate agreed at onboarding and fixed in your partnership agreement.
              </p>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
                <strong style={{ color: "rgba(255,255,255,0.5)" }}>Transparency note:</strong> Two structures are available. A 70/30 split where you retain 70% of affiliate commission generated. Or a 100% pass-through model where you retain the full merchant commission and pay MBO a separate flat service fee. The applicable model and rate are confirmed in writing at onboarding.
              </p>
              <a href="/how-it-works" style={{ display: "inline-block", marginTop: 16, fontSize: 12, fontWeight: 600, color: "#c9a227", textDecoration: "none" }}>See how commissions are generated →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Simulator CTA band */}
      <section style={{ background: "#0d1b3e", padding: "52px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 560 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(201,162,39,0.7)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Before you talk numbers</p>
            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(19px, 2.2vw, 26px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 8 }}>
              See what the revenue share is a share of.
            </h2>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
              Model your platform&apos;s affiliate commission opportunity in two minutes — and download the business case.
            </p>
          </div>
          <a href="/revenue-simulator" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 13.5, fontWeight: 700, padding: "13px 28px", borderRadius: 8, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none", boxShadow: "0 6px 28px rgba(201,162,39,0.35)", flexShrink: 0 }}>
            Try the Simulator →
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#f8f9fc", padding: "72px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>FAQ</span>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 40 }}>Frequently asked questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { q: "Are there any setup fees?", a: "No. There are no setup fees, no monthly platform charges, and no per-call API fees. You only pay MBO Rewards when a confirmed affiliate conversion is generated through your integration." },
              { q: "What counts as a confirmed conversion?", a: "A conversion is confirmed when: a user clicks an offer inside your platform, the merchant receives and processes a qualifying purchase, and the merchant sends a server-side postback to the MBO tracking endpoint. Fraud-scored and validated conversions are the only events that trigger commission." },
              { q: "When do commissions settle?", a: "Commissions accrue monthly and settle via bank transfer. You receive one consolidated statement covering all merchants and all networks. No separate statements per merchant." },
              { q: "What's included at no extra cost?", a: "Full API access across all environments, 500+ campaigns, server-side tracking, fraud scoring, the real-time dashboard, webhook delivery, and dedicated integration support. Nothing is metered separately." },
            ].map((faq, i, arr) => (
              <div key={faq.q} style={{ padding: "28px 0", borderBottom: i < arr.length - 1 ? "1px solid #edf0f7" : "none" }}>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#0d1b3e", marginBottom: 10 }}>{faq.q}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#ffffff", padding: "72px 32px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 14 }}>Get a revenue estimate</h2>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>Share your MAU count and platform category — we'll model the revenue opportunity.</p>
          <a href="/contact" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 700, padding: "12px 28px", borderRadius: 8, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none", boxShadow: "0 4px 20px rgba(201,162,39,0.3)" }}>Get API Access</a>
        </div>
      </section>
    </PageShell>
  );
}
