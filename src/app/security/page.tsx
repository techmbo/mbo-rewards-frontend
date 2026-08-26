import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "API Security & Compliance — Zero PII, Regulation-Ready | MBO Rewards",
  description:
    "Zero PII storage. Server-side tracking. TLS 1.3. AES-256 encryption. Tenant isolation. Built to pass your CISO's review — no security exception required.",
  alternates: { canonical: "https://mborewards.com/security" },
  openGraph: { title: "API Security & Compliance — Zero PII, Regulation-Ready | MBO Rewards", description: "Zero PII storage. Server-side tracking. TLS 1.3. AES-256 encryption. Tenant isolation. Built to pass your CISO's review — no security exception required.", url: "https://mborewards.com/security" },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "MBO Rewards", item: "https://mborewards.com" },
    { "@type": "ListItem", position: 2, name: "Security", item: "https://mborewards.com/security" },
  ],
};

const sections = [
  {
    heading: "Data Handling",
    items: [
      { title: "No PII storage", body: "User identity is an opaque token you generate. MBO Rewards cannot reverse-map it. No names, emails, or device identifiers enter our systems." },
      { title: "Anonymised tracking", body: "All click and conversion tracking operates on anonymised tokens. Compliance-ready for regulated financial platforms." },
    ],
  },
  {
    heading: "API Security",
    items: [
      { title: "Encrypted communication", body: "All API traffic encrypted with TLS 1.3. Older protocol versions are rejected at the load balancer. Certificate pinning available for mobile SDKs." },
      { title: "Secure authentication", body: "API keys hashed server-side — plaintext is shown once at creation. Key rotation is self-service. RBAC for dashboard access." },
    ],
  },
  {
    heading: "Tracking",
    items: [
      { title: "Server-side tracking", body: "No client-side scripts, no cookies, no browser fingerprinting. Attribution tokens generated and validated entirely on MBO servers." },
      { title: "Reliable attribution", body: "Every click validated at attribution time. Device fingerprint, velocity rules, and behavioural anomalies checked before commission is confirmed." },
    ],
  },
  {
    heading: "Data Isolation",
    items: [
      { title: "Client-level separation", body: "Click, conversion, and commission data is partitioned per platform at the data layer. Enforced by architecture." },
      { title: "No cross-data sharing", body: "No campaign or conversion data is shared across platforms. Tenant isolation is absolute." },
    ],
  },
];

export default function SecurityPage() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <section style={{ padding: "64px 32px 64px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)", position: "relative", overflow: "hidden" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 20 }}>Security</span>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1, marginBottom: 20, maxWidth: 680 }}>
            Security & Compliance — Zero PII. Server-Side Tracking. Built for Regulated Platforms.
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 440, marginBottom: 40 }}>
            Built for secure and regulated environments.
          </p>
          <div style={{ display: "flex", gap: 40 }}>
            {[{ val: "No PII", label: "stored" }, { val: "Server-side", label: "tracking" }, { val: "TLS 1.3", label: "in transit" }].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 18, fontWeight: 800, color: "#e8c55a", marginBottom: 3 }}>{s.val}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#ffffff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {sections.map(sec => (
            <div key={sec.heading} style={{ marginBottom: 56 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <span className="section-label" style={{ color: "#c9a227" }}>{sec.heading}</span>
                <div style={{ flex: 1, height: 1, background: "#f0f4fa" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {sec.items.map(item => (
                  <div key={item.title} style={{ border: "1px solid #edf0f7", borderRadius: 12, padding: "28px 24px" }}>
                    <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#0d1b3e", marginBottom: 10 }}>{item.title}</h3>
                    <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.7 }}>{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ padding: "36px 32px", borderRadius: 14, border: "1px solid rgba(201,162,39,0.2)", background: "linear-gradient(150deg, #0d1b3e, #060d1f)", position: "relative" }}>
            <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: "14px 14px 0 0" }} />
            <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>Infrastructure</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
              Designed for high-volume fintech and banking platforms globally. Built to meet the data handling and compliance requirements of regulated financial institutions across India, GCC, SEA, and the UK.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 32px", background: "#f8f9fc" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 14 }}>Need a security review pack?</h2>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, marginBottom: 32 }}>Architecture diagrams, data flow maps, and a DPA template — available for regulated platform onboarding.</p>
          <a href="/contact" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 700, padding: "12px 28px", borderRadius: 8, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none" }}>Get API Access</a>
        </div>
      </section>
    </PageShell>
  );
}
