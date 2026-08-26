import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy — MBO Rewards",
  description: "MBO Rewards Privacy Policy. Learn how MBO Rewards handles data, what we collect, and how we protect platform and user privacy in our affiliate commerce infrastructure.",
  alternates: { canonical: "https://mborewards.com/privacy" },
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: 18, fontWeight: 700, color: "#0d1b3e", marginBottom: 12 }}>{title}</h2>
    <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
  </div>
);

export default function PrivacyPage() {
  return (
    <PageShell>
      <section style={{ padding: "64px 32px 48px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)", position: "relative" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Legal</span>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1, marginBottom: 16 }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Last updated: June 2026</p>
        </div>
      </section>

      <section style={{ background: "#ffffff", padding: "64px 32px 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Section title="1. Who we are">
            <p>MBO Rewards (&quot;MBO Rewards&quot;, &quot;we&quot;, &quot;us&quot;) operates mborewards.com and provides affiliate commerce infrastructure through a unified API. Our registered address is in India.</p>
            <p>This Privacy Policy applies to data processed through our website (mborewards.com) and our API platform used by partner platforms (&quot;Platforms&quot;). End users of partner platforms (&quot;Users&quot;) interact with MBO Rewards through their Platform, not directly.</p>
          </Section>

          <Section title="2. Core privacy principle: Zero PII architecture">
            <p>MBO Rewards is designed around a zero-PII principle. When Platforms integrate MBO Rewards, they pass an opaque, anonymised user token — not names, emails, or device identifiers. MBO Rewards cannot reverse-map attribution tokens to individual users.</p>
            <p>This is an architectural constraint, not a policy choice. The system was built so that user identity data cannot enter our infrastructure.</p>
          </Section>

          <Section title="3. Data we collect from website visitors">
            <p><strong>Contact form submissions:</strong> When you contact us via the website, we collect your name, email address, company name, and any message content. This is used solely to respond to your enquiry.</p>
            <p><strong>Analytics:</strong> We may collect anonymised usage data (pages visited, referrer, device type) to understand how the website is used. We do not use cookies for tracking across sessions. See our Cookie Policy for details.</p>
            <p><strong>Server logs:</strong> Standard web server logs (IP address, timestamp, request path) may be retained for up to 30 days for security and debugging purposes.</p>
          </Section>

          <Section title="4. Data we process for partner platforms">
            <p><strong>API credentials:</strong> We store API keys in hashed form. Plaintext is shown once at creation and cannot be recovered.</p>
            <p><strong>Attribution tokens:</strong> Opaque tokens generated and passed by the Platform. These are stored in association with campaign IDs and conversion events. They cannot be linked to a user identity by MBO Rewards.</p>
            <p><strong>Click and conversion events:</strong> Timestamps, campaign IDs, attribution tokens, order values, and commission amounts. No user identifiers beyond the opaque token.</p>
            <p><strong>Commission and settlement data:</strong> Financial records required for monthly settlement processing. Retained for 7 years to meet tax and audit requirements.</p>
          </Section>

          <Section title="5. Data residency and infrastructure">
            <p>All MBO Rewards data is stored and processed on infrastructure located in India. We do not transfer personal data to servers outside India without appropriate safeguards.</p>
            <p>Our infrastructure is designed to meet the data localisation and compliance requirements applicable to regulated financial institutions across our operating markets.</p>
          </Section>

          <Section title="6. Security">
            <p>All data in transit is encrypted with TLS 1.3. Data at rest is encrypted with AES-256. API keys are hashed server-side using bcrypt. We maintain immutable audit logs of all API calls and system events.</p>
          </Section>

          <Section title="7. Data retention">
            <p>Contact enquiries are retained for 12 months and then deleted. Attribution and conversion event data is retained for 24 months. Financial settlement records are retained for 7 years. Anonymised analytics data has no fixed retention limit.</p>
          </Section>

          <Section title="8. Your rights">
            <p>If you have submitted a contact form or are a named contact at a partner platform, you have rights to access, correct, or delete your personal data. To exercise these rights, email us at privacy@mborewards.com.</p>
            <p>End users of partner platforms should direct privacy requests to their Platform, which is the data controller for their personal data. MBO Rewards acts as a data processor for Platform data.</p>
          </Section>

          <Section title="9. Changes to this policy">
            <p>We may update this Privacy Policy. Material changes will be communicated to partner platforms with 30 days notice. The current version is always available at mborewards.com/privacy.</p>
          </Section>

          <Section title="10. Contact">
            <p>For privacy matters: privacy@mborewards.com</p>
            <p>For general enquiries: <a href="/contact" style={{ color: "#c9a227" }}>mborewards.com/contact</a></p>
          </Section>
        </div>
      </section>
    </PageShell>
  );
}
