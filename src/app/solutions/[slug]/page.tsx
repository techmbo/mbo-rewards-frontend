import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { SOLUTIONS, getSolution, relatedSolutions } from "@/lib/solutions";

const siteUrl = "https://mborewards.com";

export function generateStaticParams() {
  return SOLUTIONS.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) return {};
  const title = `Affiliate Commerce API for ${solution.name} | MBO Rewards`;
  const url = `${siteUrl}/solutions/${solution.slug}`;
  return {
    title,
    description: solution.subheadline,
    alternates: { canonical: url },
    openGraph: { title, description: solution.subheadline, url, type: "website", siteName: "MBO Rewards" },
    twitter: { card: "summary_large_image", title, description: solution.subheadline },
  };
}

const SECTION_LABEL: React.CSSProperties = { color: "#c9a227", display: "block", marginBottom: 16 };
const H2: React.CSSProperties = { fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 40 };

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();
  const related = relatedSolutions(slug);
  const url = `${siteUrl}/solutions/${solution.slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Solutions", item: `${siteUrl}/use-cases` },
      { "@type": "ListItem", position: 3, name: solution.name, item: url },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: solution.faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Affiliate Commerce Infrastructure for ${solution.name}`,
    description: solution.subheadline,
    provider: { "@type": "Organization", name: "MBO Rewards", url: siteUrl },
    serviceType: "Affiliate commerce infrastructure API",
    url,
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      {/* Hero */}
      <section style={{ padding: "64px 32px 64px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)", position: "relative", overflow: "hidden" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Visible breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: 28 }}>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: 8, fontSize: 12.5 }}>
              <li><a href="/" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Home</a></li>
              <li aria-hidden="true" style={{ color: "rgba(255,255,255,0.25)" }}>→</li>
              <li><a href="/use-cases" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Solutions</a></li>
              <li aria-hidden="true" style={{ color: "rgba(255,255,255,0.25)" }}>→</li>
              <li aria-current="page" style={{ color: "#e8c55a", fontWeight: 600 }}>{solution.name}</li>
            </ol>
          </nav>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1, marginBottom: 20, maxWidth: 760 }}>
            {solution.headline}
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 560, marginBottom: 36 }}>
            {solution.subheadline}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/contact" className="btn-cta" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700, padding: "13px 28px", borderRadius: 8, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none", boxShadow: "0 4px 24px rgba(201,162,39,0.35)" }}>
              Book Demo
            </a>
            <a href="/revenue-simulator" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 600, padding: "13px 28px", borderRadius: 8, background: "rgba(74,132,196,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(168,207,240,0.2)", color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>
              Estimate Your Revenue →
            </a>
          </div>
        </div>
      </section>

      {/* Industry challenges */}
      <section style={{ background: "#f8f9fc", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span className="section-label" style={SECTION_LABEL}>The challenge</span>
          <h2 style={{ ...H2, maxWidth: 620 }}>What {solution.name.toLowerCase()} are up against.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {solution.challenges.map(c => (
              <div key={c.title} className="lift" style={{ padding: "28px 26px", borderRadius: 14, border: "1px solid #edf0f7", background: "#ffffff" }}>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 16, fontWeight: 800, color: "#0d1b3e", marginBottom: 10 }}>{c.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How MBO Rewards solves it */}
      <section style={{ background: "#ffffff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span className="section-label" style={SECTION_LABEL}>The MBO Rewards answer</span>
          <h2 style={{ ...H2, maxWidth: 560 }}>Built for {solution.name.toLowerCase()}, not retrofitted.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {solution.points.map(p => (
              <div key={p.title} className="lift" style={{ padding: "28px 26px", borderRadius: 14, border: "1px solid #edf0f7", background: "#ffffff" }}>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 16, fontWeight: 800, color: "#0d1b3e", marginBottom: 10 }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75 }}>{p.body}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32, padding: "24px 28px", borderRadius: 12, background: "#f8f9fc", border: "1px solid #edf0f7", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a, #c9a227)", flexShrink: 0, marginTop: 8 }} />
            <p style={{ fontSize: 15, color: "#0d1b3e", fontWeight: 600, lineHeight: 1.7 }}>{solution.outcome}</p>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section style={{ background: "#f8f9fc", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span className="section-label" style={SECTION_LABEL}>Use cases</span>
          <h2 style={{ ...H2, maxWidth: 560 }}>How {solution.name.toLowerCase()} put it to work.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {solution.useCases.map((u, i) => (
              <div key={u.title} className="lift" style={{ padding: "28px 26px", borderRadius: 14, border: "1px solid #edf0f7", background: "#ffffff" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#c9a227", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>{String(i + 1).padStart(2, "0")}</p>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 16, fontWeight: 800, color: "#0d1b3e", marginBottom: 10 }}>{u.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75 }}>{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise architecture */}
      <section style={{ background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 45%, #142254 75%, #1a3070 100%)", padding: "80px 32px", position: "relative" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span className="section-label" style={SECTION_LABEL}>Enterprise architecture</span>
          <h2 style={{ ...H2, color: "#ffffff", maxWidth: 620 }}>One API between your platform and every affiliate network.</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 680, marginBottom: 44 }}>
            {solution.architectureNote}
          </p>
          <div className="m-vflow" style={{ display: "flex", alignItems: "stretch", overflowX: "auto", gap: 0, paddingBottom: 8 }}>
            {[
              ["Merchant campaigns", "Aggregated from every major network"],
              ["MBO Rewards API", "Normalised, deduplicated, ranked"],
              ["Your platform", "Renders offers in your UX"],
              ["Server-side tracking", "Opaque tokens, zero cookies"],
              ["Confirmed commission", "Webhooks + monthly statements"],
            ].map(([title, sub], i, arr) => (
              <div key={title} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 150 }}>
                <div style={{ flex: 1, textAlign: "center", padding: "20px 12px", borderRadius: 12, border: i === 1 ? "1px solid rgba(201,162,39,0.4)" : "1px solid rgba(168,207,240,0.12)", background: i === 1 ? "rgba(201,162,39,0.08)" : "rgba(13,27,62,0.5)" }}>
                  <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 700, color: i === 1 ? "#e8c55a" : "#ffffff", marginBottom: 6 }}>{title}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{sub}</p>
                </div>
                {i < arr.length - 1 && <div className="m-vconn" style={{ width: 20, height: 1, flexShrink: 0, background: "rgba(168,207,240,0.3)" }} />}
              </div>
            ))}
          </div>

          {/* Security highlights */}
          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {[
              { title: "Zero PII stored", body: "User identity is an opaque token MBO Rewards cannot reverse-map." },
              { title: "Server-side tracking", body: "No cookies, pixels, or client-side scripts in your application." },
              { title: "Encrypted throughout", body: "TLS 1.3 in transit, AES-256 at rest, tenant-isolated data." },
              { title: "Review-ready", body: "An architecture designed to pass enterprise security review." },
            ].map(s => (
              <div key={s.title} style={{ padding: "20px 20px", borderRadius: 12, border: "1px solid rgba(168,207,240,0.12)", background: "rgba(13,27,62,0.5)" }}>
                <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 13.5, fontWeight: 700, color: "#a8cff0", marginBottom: 6 }}>{s.title}</p>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{s.body}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <a href="/security" style={{ fontSize: 13, fontWeight: 600, color: "#e8c55a", textDecoration: "none" }}>Full security & compliance detail →</a>
          </div>
        </div>
      </section>

      {/* Simulator CTA band */}
      <section style={{ background: "#0d1b3e", padding: "56px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 560 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(201,162,39,0.7)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Revenue Opportunity Simulator</p>
            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(19px, 2.2vw, 26px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 8 }}>
              What is affiliate commerce worth to your {solution.navLabel.toLowerCase() === "nbfcs" ? "platform" : solution.navLabel.toLowerCase().replace(/s$/, "")} business?
            </h2>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
              Four questions, an executive dashboard, and a downloadable business case for your leadership team.
            </p>
          </div>
          <a href="/revenue-simulator" className="btn-cta" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 13.5, fontWeight: 700, padding: "13px 28px", borderRadius: 8, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none", boxShadow: "0 6px 28px rgba(201,162,39,0.35)", flexShrink: 0 }}>
            Try the Simulator →
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#ffffff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <span className="section-label" style={SECTION_LABEL}>FAQ</span>
          <h2 style={H2}>Questions {solution.name.toLowerCase()} ask us.</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {solution.faqs.map((faq, i, arr) => (
              <div key={faq.q} style={{ padding: "26px 0", borderBottom: i < arr.length - 1 ? "1px solid #edf0f7" : "none" }}>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#0d1b3e", marginBottom: 10 }}>{faq.q}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related solutions + resources */}
      <section style={{ background: "#f8f9fc", padding: "72px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 48, alignItems: "start" }}>
            <div>
              <span className="section-label" style={SECTION_LABEL}>Related solutions</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                {related.map(r => (
                  <a key={r.slug} href={`/solutions/${r.slug}`} className="lift" style={{ display: "block", padding: "22px 20px", borderRadius: 12, border: "1px solid #edf0f7", background: "#ffffff", textDecoration: "none" }}>
                    <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 14.5, fontWeight: 800, color: "#0d1b3e", marginBottom: 6 }}>{r.navLabel}</p>
                    <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.6, marginBottom: 10 }}>{r.navDescription}</p>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#c9a227" }}>Explore →</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <span className="section-label" style={SECTION_LABEL}>Related resources</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["Revenue Opportunity Simulator", "/revenue-simulator"],
                  ["How the integration works", "/how-it-works"],
                  ["Security & compliance", "/security"],
                  ["Pricing", "/pricing"],
                  ["Product overview", "/product"],
                ].map(([label, href]) => (
                  <a key={href} href={href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderRadius: 10, border: "1px solid #edf0f7", background: "#ffffff", textDecoration: "none" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0d1b3e" }}>{label}</span>
                    <span style={{ color: "#c9a227", fontSize: 13 }}>→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Book Demo CTA */}
      <section style={{ background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 40%, #1a3070 65%, #2952a8 82%, #4a84c4 100%)", padding: "88px 32px", position: "relative" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 16 }}>
            Talk to the team that will run your integration.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 36 }}>
            A 30-minute scoping call covers your platform, compliance requirements, and go-live plan. Most integrations complete in 2–3 days.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/contact" className="btn-cta" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700, padding: "14px 32px", borderRadius: 9, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none", boxShadow: "0 6px 28px rgba(201,162,39,0.4)" }}>
              Book Demo
            </a>
            <a href="/contact" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 600, padding: "14px 32px", borderRadius: 9, border: "1px solid rgba(168,207,240,0.25)", color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>
              Talk to an Expert
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
