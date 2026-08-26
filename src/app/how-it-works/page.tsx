import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "How MBO Rewards Works — Affiliate API Integration in 5 Steps | MBO Rewards",
  description:
    "Fetch campaigns, track conversions, and earn commissions in five API calls. Server-side attribution, zero cookies, zero PII. Sandbox to production in 2–3 days.",
  alternates: { canonical: "https://mborewards.com/how-it-works" },
  openGraph: { title: "How MBO Rewards Works — Affiliate API Integration in 5 Steps | MBO Rewards", description: "Fetch campaigns, track conversions, and earn commissions in five API calls. Server-side attribution, zero cookies, zero PII. Sandbox to production in 2–3 days.", url: "https://mborewards.com/how-it-works" },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "MBO Rewards", item: "https://mborewards.com" },
    { "@type": "ListItem", position: 2, name: "How it works", item: "https://mborewards.com/how-it-works" },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to integrate affiliate commerce into a banking app using MBO Rewards",
  totalTime: "PT72H",
  step: [
    { "@type": "HowToStep", name: "Fetch campaigns via API", text: "Call GET /v1/campaigns with your API key and receive a ranked list of affiliate campaigns." },
    { "@type": "HowToStep", name: "Display inside your application", text: "Render campaigns in your existing UI. MBO Rewards is invisible to your users." },
    { "@type": "HowToStep", name: "Track user clicks", text: "Server-side attribution token generated on click — no cookies, no client-side scripts." },
    { "@type": "HowToStep", name: "Record conversion", text: "Merchant sends server-side postback. MBO validates token and confirms conversion." },
    { "@type": "HowToStep", name: "Receive commission", text: "Confirmed commissions accrue and settle monthly — one transfer, one statement." },
  ],
};

const steps = [
  {
    num: "01",
    title: "Fetch campaigns via API",
    body: "Call the MBO Rewards API with a user token. Get back a ranked list of affiliate campaigns — normalised and ready to display.",
  },
  {
    num: "02",
    title: "Display inside your application",
    body: "Render campaigns in your existing UI. Your brand, your UX. MBO Rewards is invisible to your users.",
  },
  {
    num: "03",
    title: "User clicks and interacts",
    body: "When a user taps an offer, an attribution token is generated server-side. No cookies. No client-side redirects.",
  },
  {
    num: "04",
    title: "Conversion is recorded",
    body: "When the user completes a purchase, the merchant sends a server-side postback. We validate the token, score for fraud, and confirm the conversion.",
  },
  {
    num: "05",
    title: "Commission is generated",
    body: "Confirmed commissions accrue in your account. Monthly settlement — one transfer, one statement, covering all merchants and networks.",
  },
];

export default function HowItWorksPage() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <section style={{ padding: "64px 32px 64px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)", position: "relative", overflow: "hidden" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 20 }}>How it works</span>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.08, marginBottom: 20, maxWidth: 680 }}>
            How MBO Rewards Works — Affiliate API Integration in 5 Steps
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 460 }}>
            Every step is a documented API interaction. No hidden steps, no black boxes.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section style={{ background: "#ffffff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map((s, i) => (
            <div key={s.num} style={{ display: "flex", gap: 40, padding: "48px 0", borderBottom: i < steps.length - 1 ? "1px solid #f0f4fa" : "none", alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 800, color: "#0d1b3e" }}>{s.num}</span>
                </div>
              </div>
              <div style={{ paddingTop: 12 }}>
                <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 800, letterSpacing: "-0.02em", color: "#0d1b3e", marginBottom: 12 }}>{s.title}</h2>
                <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.75, maxWidth: 560 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Output */}
      <section style={{ background: "#f8f9fc", padding: "64px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Output</span>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 28 }}>What your platform gets at each stage.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { title: "Verified conversions", body: "Every conversion validated server-side against the original attribution token." },
              { title: "Commission data", body: "Per-conversion commission amounts, fraud scores, and approval status via webhook." },
              { title: "Performance insights", body: "Click rates, conversion rates, and GMV data in the dashboard and via API." },
            ].map(v => (
              <div key={v.title} style={{ padding: "24px 20px", borderRadius: 12, border: "1px solid #edf0f7", background: "#ffffff" }}>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700, color: "#0d1b3e", marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 40%, #1a3070 65%, #2952a8 82%, #4a84c4 100%)", padding: "72px 32px", position: "relative" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.025em", marginBottom: 14 }}>Start building</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, marginBottom: 32 }}>Sandbox credentials issued same day. Production in 2–3 days.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/contact" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 700, padding: "12px 28px", borderRadius: 8, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none" }}>Get API Access</a>
            <a href="/pricing" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 600, padding: "12px 28px", borderRadius: 8, border: "1px solid rgba(168,207,240,0.2)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>View pricing →</a>
            <a href="/security" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 600, padding: "12px 28px", borderRadius: 8, border: "1px solid rgba(168,207,240,0.2)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Security details →</a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
