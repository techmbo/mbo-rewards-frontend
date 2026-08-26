import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Server-Side Attribution vs. Cookie Tracking — MBO Rewards Blog",
  description:
    "Cookie-based tracking breaks in apps, fails on iOS, and exposes fintech platforms to compliance risk. MBO Rewards uses server-side attribution. Here's the technical difference and why it matters.",
  alternates: { canonical: "https://mborewards.com/blog/server-side-attribution-vs-cookies" },
  openGraph: { title: "Server-Side Attribution vs. Cookie Tracking for Fintech Platforms", description: "Cookies break in-app. Server-side attribution doesn't. Here's why MBO Rewards chose the latter.", url: "https://mborewards.com/blog/server-side-attribution-vs-cookies" },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Server-Side Attribution vs. Cookie Tracking: What Fintech Platforms Need to Know",
  description: "Cookie-based tracking breaks in apps, fails on iOS, and exposes platforms to compliance risk. MBO Rewards uses server-side attribution — here's why it matters.",
  author: { "@type": "Organization", name: "MBO Rewards", url: "https://mborewards.com" },
  publisher: { "@type": "Organization", name: "MBO Rewards", logo: { "@type": "ImageObject", url: "https://mborewards.com/logos/mbo-logo.png" } },
  datePublished: "2026-06-03",
  dateModified: "2026-06-03",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://mborewards.com/blog/server-side-attribution-vs-cookies" },
};

export default function BlogPost2() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <section style={{ padding: "64px 32px 48px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)", position: "relative" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#c9a227", letterSpacing: "0.1em", textTransform: "uppercase" }}>Technical</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>June 3, 2026</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>·</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>6 min read</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1, marginBottom: 20 }}>
            Server-Side Attribution vs. Cookie Tracking: What Fintech Platforms Need to Know
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            Cookie-based tracking breaks in apps, fails on iOS, and exposes platforms to compliance risk. MBO Rewards uses server-side attribution — here's why it matters.
          </p>
        </div>
      </section>

      <section style={{ background: "#ffffff", padding: "64px 32px 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontSize: 15, color: "#475569", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: 24 }}>
            <p>Affiliate tracking has a dirty secret: the dominant attribution method — browser cookies — is broken for the environments that matter most in 2026. Banking apps. Fintech platforms. In-app webviews. iOS Safari. Every platform that has moved users from the open web into authenticated digital products is operating on infrastructure that was never designed for them.</p>

            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", marginTop: 12 }}>How cookie-based affiliate tracking works</h2>
            <p>In the traditional model, a user clicks an affiliate link. The affiliate network sets a first-party or third-party cookie in the user's browser. When the user completes a purchase on the merchant's site, the cookie is read, the attribution is matched, and commission is credited.</p>
            <p>This works on desktop browsers. It partially works on mobile browsers. It does not work:</p>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <li>Inside native iOS and Android apps (no shared cookie store)</li>
              <li>In in-app webviews (isolated from the system browser's cookies)</li>
              <li>When Safari's ITP (Intelligent Tracking Prevention) blocks third-party cookies</li>
              <li>When users clear cookies between click and conversion</li>
              <li>When the click and conversion happen in different browser sessions</li>
            </ul>

            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", marginTop: 12 }}>How server-side attribution works</h2>
            <p>MBO Rewards generates attribution at the server level, not the browser level. When a user clicks on an offer inside a platform, the platform calls <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 13 }}>POST /v1/clicks</code>. MBO creates a cryptographically signed attribution token and returns a tracking URL. No cookie is set anywhere.</p>
            <p>When the merchant's server posts a conversion event, MBO matches it against the attribution token — entirely server-to-server. The user's device, browser, or cookie state is irrelevant. Attribution is reliable across every surface: native app, webview, or browser.</p>

            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e8edf5", background: "#0a1428", margin: "8px 0" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3d3d3d" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3d3d3d" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3d3d3d" }} />
              </div>
              <pre className="code-font" style={{ margin: 0, padding: "20px 24px", color: "#cdd6f4", fontSize: "0.72rem", lineHeight: 1.8 }}>
                <code>{`// 1. Platform calls MBO — attribution token generated server-side
POST /v1/clicks
{ "campaign_id": "camp_9x2k", "user_token": "opaque_id" }
→ { "token": "tkn_j7Kp...", "redirect_url": "https://trk.mborewards.com/r/tkn_j7Kp" }

// 2. User converts — merchant posts back server-to-server
POST /v1/postback
{ "token": "tkn_j7Kp...", "order_value": 7450 }
→ { "commission": 335, "fraud_score": 0.02, "status": "approved" }

// No cookies. No client-side scripts. No browser dependency.`}</code>
              </pre>
            </div>

            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", marginTop: 12 }}>The compliance dimension</h2>
            <p>For fintech and banking platforms, the cookie question isn't just technical — it's regulatory. Storing tracking cookies related to financial behaviour creates data handling obligations under DPDP (India), GDPR (EU), and similar frameworks. It can also trigger RBI scrutiny for NBFCs and payment platforms operating under specific data localisation requirements.</p>
            <p>Server-side attribution with opaque user tokens eliminates this surface entirely. MBO Rewards stores no PII. Attribution tokens cannot be reverse-mapped to user identity. The data model is compliant by architecture, not policy.</p>

            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", marginTop: 12 }}>Conversion rate impact</h2>
            <p>Cookie-based affiliate programs on mobile apps typically see 30–60% attribution loss — conversions that happened but weren't tracked because the cookie chain broke. Server-side attribution closes this gap. Every conversion that reaches the merchant's postback is attributed and settled.</p>
            <p>For high-volume fintech platforms, this attribution improvement compounds directly into revenue.</p>
          </div>

          <div style={{ marginTop: 56, padding: "32px", borderRadius: 14, border: "1px solid rgba(201,162,39,0.2)", background: "linear-gradient(150deg, #0d1b3e, #060d1f)", position: "relative" }}>
            <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: "14px 14px 0 0" }} />
            <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>MBO Rewards uses server-side attribution exclusively.</p>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 20 }}>No cookies. No client-side scripts. No PII. Works in native apps, webviews, and every browser.</p>
            <a href="/security" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 12, fontWeight: 700, padding: "9px 18px", borderRadius: 7, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none" }}>See security details</a>
          </div>

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid #f0f4fa" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Continue reading</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="/blog/affiliate-commerce-api-fintech" style={{ fontSize: 14, fontWeight: 600, color: "#0d1b3e", textDecoration: "none" }}>Why Fintech Platforms Need a Dedicated Affiliate Commerce API →</a>
              <a href="/blog/embedded-affiliate-commerce-banking-apps" style={{ fontSize: 14, fontWeight: 600, color: "#0d1b3e", textDecoration: "none" }}>Embedded Affiliate Commerce: The New Revenue Layer for Banking Apps →</a>
              <a href="/product" style={{ fontSize: 14, fontWeight: 600, color: "#c9a227", textDecoration: "none" }}>See the MBO Rewards tracking engine →</a>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
