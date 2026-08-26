import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Why Fintech Platforms Need a Dedicated Affiliate Commerce API — MBO Rewards Blog",
  description:
    "Open-web affiliate tooling was built for coupon sites and blogs — not authenticated apps. This post explains the structural gap and how MBO Rewards fills it with a unified affiliate commerce API.",
  alternates: { canonical: "https://mborewards.com/blog/affiliate-commerce-api-fintech" },
  openGraph: { title: "Why Fintech Platforms Need a Dedicated Affiliate Commerce API", description: "Open-web affiliate tooling breaks in-app. MBO Rewards is the fix.", url: "https://mborewards.com/blog/affiliate-commerce-api-fintech" },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Why Fintech Platforms Need a Dedicated Affiliate Commerce API",
  description: "Open-web affiliate tooling was built for coupon sites and blogs — not authenticated apps. Here's the structural gap and how MBO Rewards fills it.",
  author: { "@type": "Organization", name: "MBO Rewards", url: "https://mborewards.com" },
  publisher: { "@type": "Organization", name: "MBO Rewards", logo: { "@type": "ImageObject", url: "https://mborewards.com/logos/mbo-logo.png" } },
  datePublished: "2026-06-10",
  dateModified: "2026-06-10",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://mborewards.com/blog/affiliate-commerce-api-fintech" },
};

export default function BlogPost1() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <section style={{ padding: "64px 32px 48px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)", position: "relative" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#c9a227", letterSpacing: "0.1em", textTransform: "uppercase" }}>Infrastructure</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>June 10, 2026</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>·</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>5 min read</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1, marginBottom: 20 }}>
            Why Fintech Platforms Need a Dedicated Affiliate Commerce API
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            Open-web affiliate tooling was never built for authenticated, in-app environments. Here's what's broken — and how MBO Rewards fixes it with a unified API layer.
          </p>
        </div>
      </section>

      <section style={{ background: "#ffffff", padding: "64px 32px 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontSize: 15, color: "#475569", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: 24 }}>
            <p>Affiliate marketing generates hundreds of billions in tracked commerce annually. Yet the infrastructure powering it was designed in the early 2000s — for a world of coupon sites, comparison blogs, and browser cookies. That infrastructure is fundamentally incompatible with how digital products work in 2026.</p>

            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", marginTop: 12 }}>The structural gap</h2>
            <p>Banks, fintech platforms, and digital products sit on top of something open-web affiliate infrastructure cannot reach: <strong style={{ color: "#0d1b3e" }}>authenticated, logged-in, high-intent users</strong>. These users are inside an app. They've already trusted the platform with their identity and financial data. They transact regularly.</p>
            <p>But when a banking app or a UPI platform wants to surface affiliate offers to these users, the available tooling forces them into patterns built for anonymous web traffic:</p>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <li>Cookie-based tracking that doesn't survive app transitions</li>
              <li>Separate integration contracts with each affiliate network</li>
              <li>Client-side redirect chains that expose user behaviour to third parties</li>
              <li>No compliance framework designed for regulated financial environments</li>
            </ul>

            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", marginTop: 12 }}>What a dedicated API layer looks like</h2>
            <p>MBO Rewards is an infrastructure layer for affiliate commerce powered by a unified API. Rather than requiring each platform to sign contracts with affiliate networks, build tracking infrastructure, and manage compliance, MBO Rewards abstracts the entire stack into a single REST endpoint.</p>
            <p>A platform calls <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 13 }}>GET /v1/campaigns</code> with an opaque user token and a segment signal. It receives a normalised, ranked list of campaigns from every major affiliate network — with tracking URLs pre-generated server-side. No cookies. No client-side scripts. No PII leaves the platform.</p>

            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e8edf5", background: "#0a1428", margin: "8px 0" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3d3d3d" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3d3d3d" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3d3d3d" }} />
              </div>
              <pre className="code-font" style={{ margin: 0, padding: "20px 24px", color: "#cdd6f4", fontSize: "0.72rem", lineHeight: 1.8 }}>
                <code>{`GET /v1/campaigns
Authorization: Bearer sk_live_...
X-User-Token: opaque_user_id_hash
X-Segment: premium

200 OK
{
  "campaigns": [
    { "id": "camp_9x2k", "brand": "Flipkart", "cashback_rate": "4.5%",
      "tracking_url": "https://trk.mborewards.com/...", "ranking_score": 0.94 }
  ]
}`}</code>
              </pre>
            </div>

            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", marginTop: 12 }}>Why this matters for regulated platforms</h2>
            <p>Banks and NBFCs cannot integrate tooling that stores user PII on third-party servers, uses cookies for tracking, or requires open-web redirect chains. These are not optional compliance concerns — they are hard requirements from regulators and CISOs.</p>
            <p>MBO Rewards was designed with these constraints from day one. The data model uses opaque tokens — user identity never enters MBO's systems. Attribution is server-side. Data is hosted in India and meets RBI guidelines. This is why regulated platforms can onboard without a security exception.</p>

            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", marginTop: 12 }}>The integration time difference</h2>
            <p>Building affiliate infrastructure from scratch — contracts, normalisation, tracking, attribution, fraud scoring, settlement — takes months. Integrating MBO Rewards takes 2–3 days. Sandbox credentials are issued same day. A dedicated engineer supports the integration to production.</p>
            <p>For fintech platforms, this isn't just a faster path to revenue. It's the only viable path to affiliate commerce that passes compliance review.</p>
          </div>

          <div style={{ marginTop: 56, padding: "32px", borderRadius: 14, border: "1px solid rgba(201,162,39,0.2)", background: "linear-gradient(150deg, #0d1b3e, #060d1f)", position: "relative" }}>
            <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: "14px 14px 0 0" }} />
            <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>MBO Rewards</p>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 20 }}>
              Infrastructure layer for affiliate commerce powered by a unified API. One integration. Every network. Full compliance.
            </p>
            <a href="/contact" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 12, fontWeight: 700, padding: "9px 18px", borderRadius: 7, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none" }}>Get API Access</a>
          </div>

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid #f0f4fa" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Continue reading</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="/blog/server-side-attribution-vs-cookies" style={{ fontSize: 14, fontWeight: 600, color: "#0d1b3e", textDecoration: "none" }}>Server-Side Attribution vs. Cookie Tracking: What Fintech Platforms Need to Know →</a>
              <a href="/blog/embedded-affiliate-commerce-banking-apps" style={{ fontSize: 14, fontWeight: 600, color: "#0d1b3e", textDecoration: "none" }}>Embedded Affiliate Commerce: The New Revenue Layer for Banking Apps →</a>
              <a href="/how-it-works" style={{ fontSize: 14, fontWeight: 600, color: "#c9a227", textDecoration: "none" }}>See how MBO Rewards works →</a>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
