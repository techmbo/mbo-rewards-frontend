import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Terms of Service — MBO Rewards",
  description: "MBO Rewards Terms of Service. Terms governing use of the MBO Rewards affiliate commerce infrastructure API, dashboard, and related services.",
  alternates: { canonical: "https://mborewards.com/terms" },
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: 18, fontWeight: 700, color: "#0d1b3e", marginBottom: 12 }}>{title}</h2>
    <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
  </div>
);

export default function TermsPage() {
  return (
    <PageShell>
      <section style={{ padding: "64px 32px 48px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)", position: "relative" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Legal</span>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1, marginBottom: 16 }}>Terms of Service</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Last updated: June 2026</p>
        </div>
      </section>

      <section style={{ background: "#ffffff", padding: "64px 32px 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Section title="1. Acceptance of terms">
            <p>By accessing or using any MBO Rewards service — including the API, Partner Dashboard, SDKs, and website (collectively, the &quot;Services&quot;) — you agree to these Terms of Service. If you are accepting on behalf of a company, you represent that you have authority to bind that company.</p>
          </Section>

          <Section title="2. Description of services">
            <p>MBO Rewards provides an affiliate commerce infrastructure API that enables partner platforms (&quot;Platforms&quot;) to integrate campaign data, click tracking, conversion attribution, fraud scoring, and commission settlement from multiple affiliate networks through a single REST API interface.</p>
            <p>MBO Rewards is an infrastructure layer, not an affiliate network or marketplace. MBO Rewards does not guarantee specific campaign availability, commission rates, or conversion performance.</p>
          </Section>

          <Section title="3. API access and credentials">
            <p>API access is provided through credentials issued upon agreement of a Partnership Agreement. API keys must not be shared, embedded in client-side code, or stored in public repositories. You are responsible for all activity using your credentials.</p>
            <p>MBO Rewards reserves the right to revoke credentials that are misused, involved in fraudulent activity, or in breach of these terms.</p>
          </Section>

          <Section title="4. Permitted use">
            <p>You may use MBO Rewards Services to integrate affiliate commerce functionality into your own platform for the purpose of displaying affiliate campaigns to your authenticated users, tracking affiliate conversions, and receiving commission settlements.</p>
            <p>You may not: resell API access to third parties; use the API to scrape campaign data for purposes other than display to your users; attempt to reverse-engineer attribution tokens; or use the Services in violation of applicable laws or regulations.</p>
          </Section>

          <Section title="5. Revenue sharing and settlement">
            <p>Commission revenue is shared according to the revenue share agreement specified in your Partnership Agreement. MBO Rewards earns a percentage of confirmed affiliate commissions. Confirmed conversions are those validated by merchant postback, passed fraud scoring, and attributed to an MBO Rewards tracking token.</p>
            <p>Settlement is monthly. MBO Rewards provides a consolidated statement covering all merchants and networks. Disputes regarding commission amounts must be raised within 30 days of the relevant settlement statement.</p>
          </Section>

          <Section title="6. Data and privacy">
            <p>You are the data controller for your users&apos; personal data. MBO Rewards acts as a data processor. You must ensure that your users have been informed appropriately about data processing in accordance with applicable law.</p>
            <p>You must pass only anonymised, opaque user tokens to the MBO Rewards API — not names, emails, phone numbers, or other personal identifiers.</p>
            <p>MBO Rewards will process data as described in the Data Processing Agreement (&quot;DPA&quot;) incorporated into your Partnership Agreement.</p>
          </Section>

          <Section title="7. Fraud and prohibited behaviour">
            <p>You must not: generate artificial clicks or conversions; attempt to manipulate fraud scoring; submit false postback data; or interfere with MBO Rewards infrastructure. Any suspected fraud will result in immediate suspension of access and forfeiture of commissions associated with fraudulent activity.</p>
          </Section>

          <Section title="8. Limitation of liability">
            <p>MBO Rewards provides the Services &quot;as is&quot; and makes no warranties regarding uptime, conversion rates, or campaign availability. MBO Rewards is not liable for indirect, consequential, or incidental damages. Our total liability to you for any claim shall not exceed the total commissions settled to you in the 3 months preceding the claim.</p>
          </Section>

          <Section title="9. Termination">
            <p>Either party may terminate the partnership with 30 days written notice. MBO Rewards may suspend or terminate access immediately for breach of these terms. Outstanding commissions earned prior to termination will be settled in the next scheduled settlement cycle.</p>
          </Section>

          <Section title="10. Governing law">
            <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.</p>
          </Section>

          <Section title="11. Contact">
            <p>For legal matters: legal@mborewards.com</p>
            <p>For general enquiries: <a href="/contact" style={{ color: "#c9a227" }}>mborewards.com/contact</a></p>
          </Section>
        </div>
      </section>
    </PageShell>
  );
}
