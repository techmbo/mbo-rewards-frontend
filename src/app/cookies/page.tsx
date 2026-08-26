import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Cookie Policy — MBO Rewards",
  description: "MBO Rewards Cookie Policy. We use minimal cookies on mborewards.com. Our API platform uses zero cookies — attribution is server-side only.",
  alternates: { canonical: "https://mborewards.com/cookies" },
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: 18, fontWeight: 700, color: "#0d1b3e", marginBottom: 12 }}>{title}</h2>
    <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
  </div>
);

export default function CookiesPage() {
  return (
    <PageShell>
      <section style={{ padding: "64px 32px 48px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)", position: "relative" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Legal</span>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1, marginBottom: 16 }}>Cookie Policy</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Last updated: June 2026</p>
        </div>
      </section>

      <section style={{ background: "#ffffff", padding: "64px 32px 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ padding: "20px 24px", borderRadius: 10, border: "1px solid rgba(201,162,39,0.2)", background: "#fdfaf0", marginBottom: 40 }}>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
              <strong style={{ color: "#0d1b3e" }}>Important:</strong> The MBO Rewards API platform uses <strong style={{ color: "#0d1b3e" }}>zero cookies</strong> for attribution or tracking. All affiliate click and conversion tracking is server-side only. This Cookie Policy applies only to the mborewards.com website.
            </p>
          </div>

          <Section title="1. What are cookies">
            <p>Cookies are small text files stored by your browser when you visit a website. They are used for various purposes including keeping you logged in, remembering preferences, and understanding how visitors use a website.</p>
          </Section>

          <Section title="2. Cookies on mborewards.com">
            <p>The MBO Rewards website uses a minimal set of cookies:</p>
            <div style={{ border: "1px solid #edf0f7", borderRadius: 10, overflow: "hidden" }}>
              {[
                { name: "cookie_consent", purpose: "Stores your cookie consent preference", duration: "1 year", type: "Essential" },
                { name: "__session", purpose: "Session management for the contact form", duration: "Session", type: "Essential" },
              ].map((c, i) => (
                <div key={c.name} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr", gap: 0, padding: "14px 16px", borderBottom: i === 0 ? "1px solid #f0f4fa" : "none", background: i % 2 === 0 ? "#fafbff" : "#ffffff" }}>
                  <code style={{ fontFamily: "monospace", fontSize: 12, color: "#0d1b3e" }}>{c.name}</code>
                  <span style={{ fontSize: 13, color: "#475569" }}>{c.purpose}</span>
                  <span style={{ fontSize: 13, color: "#64748b" }}>{c.duration}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#c9a227" }}>{c.type}</span>
                </div>
              ))}
            </div>
            <p>We do not use advertising cookies, cross-site tracking cookies, or third-party analytics cookies that track users across websites.</p>
          </Section>

          <Section title="3. API platform: no cookies">
            <p>The MBO Rewards API infrastructure uses <strong style={{ color: "#0d1b3e" }}>no cookies whatsoever</strong> for affiliate tracking or attribution. All click and conversion attribution is handled server-side using cryptographically signed tokens. This is a core architectural principle of MBO Rewards — see our <a href="/blog/server-side-attribution-vs-cookies" style={{ color: "#c9a227" }}>technical post on server-side attribution</a> for details.</p>
            <p>Partner platforms integrating MBO Rewards do not need to display cookie consent notices for the MBO tracking functionality, as no cookies are involved.</p>
          </Section>

          <Section title="4. Managing cookies">
            <p>You can control cookies through your browser settings. Disabling essential cookies may affect the functionality of the contact form on this website. Disabling cookies will not affect any affiliate tracking or commission calculations — these are handled server-side.</p>
          </Section>

          <Section title="5. Contact">
            <p>For cookie or privacy matters: privacy@mborewards.com</p>
            <p>See also: <a href="/privacy" style={{ color: "#c9a227" }}>Privacy Policy</a> · <a href="/terms" style={{ color: "#c9a227" }}>Terms of Service</a></p>
          </Section>
        </div>
      </section>
    </PageShell>
  );
}
