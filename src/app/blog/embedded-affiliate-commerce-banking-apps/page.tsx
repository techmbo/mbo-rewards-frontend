import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Embedded Affiliate Commerce: The New Revenue Layer for Banking Apps — MBO Rewards Blog",
  description:
    "Banks have the highest-intent, most-trusted user base in consumer finance. MBO Rewards turns that audience into affiliate revenue — without building a rewards product from scratch.",
  alternates: { canonical: "https://mborewards.com/blog/embedded-affiliate-commerce-banking-apps" },
  openGraph: { title: "Embedded Affiliate Commerce: The New Revenue Layer for Banking Apps", description: "Banks have the highest-intent users. MBO Rewards gives them affiliate revenue infrastructure.", url: "https://mborewards.com/blog/embedded-affiliate-commerce-banking-apps" },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Embedded Affiliate Commerce: The New Revenue Layer for Banking Apps",
  description: "Banks have the highest-intent, most-trusted user base in consumer finance. MBO Rewards turns that into affiliate revenue without building a rewards product.",
  author: { "@type": "Organization", name: "MBO Rewards", url: "https://mborewards.com" },
  publisher: { "@type": "Organization", name: "MBO Rewards", logo: { "@type": "ImageObject", url: "https://mborewards.com/logos/mbo-logo.png" } },
  datePublished: "2026-05-27",
  dateModified: "2026-05-27",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://mborewards.com/blog/embedded-affiliate-commerce-banking-apps" },
};

export default function BlogPost3() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <section style={{ padding: "64px 32px 48px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)", position: "relative" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#c9a227", letterSpacing: "0.1em", textTransform: "uppercase" }}>Use Cases</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>May 27, 2026</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>·</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>4 min read</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1, marginBottom: 20 }}>
            Embedded Affiliate Commerce: The New Revenue Layer for Banking Apps
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            Banks have the highest-intent, most-trusted user base in consumer finance. MBO Rewards turns that audience into affiliate revenue — without building a rewards product from scratch.
          </p>
        </div>
      </section>

      <section style={{ background: "#ffffff", padding: "64px 32px 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontSize: 15, color: "#475569", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: 24 }}>
            <p>Consider the position a bank occupies in a consumer's financial life. The bank knows when salary arrives. It knows spending patterns. It has identity-verified, authenticated users who open the app multiple times per week. By almost any measure, this is the highest-quality affiliate audience in consumer finance.</p>
            <p>Yet most banks generate zero affiliate revenue from this audience. Not because the opportunity doesn't exist — but because the infrastructure to reach it didn't exist until recently.</p>

            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", marginTop: 12 }}>Why banks haven't done this</h2>
            <p>Building an affiliate commerce capability from scratch requires signing contracts with affiliate networks, building tracking infrastructure, handling attribution disputes, managing fraud, processing settlements from multiple networks, and building a compliance framework that satisfies the bank's own security team. This is a 12–18 month engineering project with significant ongoing maintenance.</p>
            <p>Most banks have decided it isn't worth it. MBO Rewards changes that calculation by reducing the build time to 2–3 days.</p>

            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", marginTop: 12 }}>How embedded affiliate commerce works with MBO Rewards</h2>
            <p>MBO Rewards is an infrastructure layer — not a white-labelled rewards product. The bank calls the MBO API and receives a list of affiliate campaigns. The bank decides how to render these offers inside its app: in a rewards tab, on the post-transaction screen, or contextually alongside spending insights.</p>
            <p>MBO is invisible to the end user. The bank's brand is the only brand the user sees. There are no MBO domains in the redirect chain. No MBO scripts run on the user's device.</p>

            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", marginTop: 12 }}>Compliance for regulated platforms</h2>
            <p>Banks and NBFCs face a specific compliance challenge: any third-party service that handles user data must meet data residency requirements, have no PII exposure, and be assessable by the bank's IT security team. MBO Rewards was designed for exactly this review process:</p>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <li>Zero PII storage — user identity is an opaque token generated by the bank</li>
              <li>Data hosted in India, meeting RBI guidelines</li>
              <li>Server-side attribution — no client-side scripts or cookies</li>
              <li>Immutable audit logs, exportable for compliance teams</li>
              <li>Architecture diagrams and DPA templates available for security review</li>
            </ul>

            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", marginTop: 12 }}>What the revenue model looks like</h2>
            <p>MBO Rewards earns a percentage of confirmed affiliate commissions. There are no setup fees, no monthly charges, and no SDK costs. The bank pays nothing upfront — revenue is shared only on conversions that are validated, fraud-scored, and confirmed by the merchant.</p>
            <p>For a bank with 1 million active monthly users, even a 1–2% affiliate conversion rate at average commission values generates meaningful incremental revenue — from an existing user base, with zero additional user acquisition cost.</p>
          </div>

          <div style={{ marginTop: 56, padding: "32px", borderRadius: 14, border: "1px solid rgba(201,162,39,0.2)", background: "linear-gradient(150deg, #0d1b3e, #060d1f)", position: "relative" }}>
            <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: "14px 14px 0 0" }} />
            <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>MBO Rewards for Banking Apps</p>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 20 }}>
              Affiliate commerce infrastructure for regulated platforms. Zero PII. RBI-aligned. Onboard without a security exception.
            </p>
            <a href="/contact" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 12, fontWeight: 700, padding: "9px 18px", borderRadius: 7, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none" }}>Get API Access</a>
          </div>

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid #f0f4fa" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Continue reading</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="/blog/affiliate-commerce-api-fintech" style={{ fontSize: 14, fontWeight: 600, color: "#0d1b3e", textDecoration: "none" }}>Why Fintech Platforms Need a Dedicated Affiliate Commerce API →</a>
              <a href="/blog/server-side-attribution-vs-cookies" style={{ fontSize: 14, fontWeight: 600, color: "#0d1b3e", textDecoration: "none" }}>Server-Side Attribution vs. Cookie Tracking →</a>
              <a href="/use-cases" style={{ fontSize: 14, fontWeight: 600, color: "#c9a227", textDecoration: "none" }}>See all MBO Rewards use cases →</a>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
