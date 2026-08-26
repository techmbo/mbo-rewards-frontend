import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import RevenueSimulator from "@/components/simulator/RevenueSimulator";

export const metadata: Metadata = {
  title: "Revenue Opportunity Simulator — Estimate Your Affiliate Revenue | MBO Rewards",
  description:
    "Model the affiliate commission revenue your bank, fintech, or wallet could generate with the MBO Rewards API. Guided inputs, executive dashboard, downloadable business case.",
  alternates: { canonical: "https://mborewards.com/revenue-simulator" },
  openGraph: {
    title: "Revenue Opportunity Simulator — Estimate Your Affiliate Revenue | MBO Rewards",
    description: "Model the affiliate commission revenue your platform could generate with the MBO Rewards API. Guided inputs, executive dashboard, downloadable business case.",
    url: "https://mborewards.com/revenue-simulator",
  },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "MBO Rewards", item: "https://mborewards.com" },
    { "@type": "ListItem", position: 2, name: "Revenue Simulator", item: "https://mborewards.com/revenue-simulator" },
  ],
};

export default function RevenueSimulatorPage() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Hero + simulator on one continuous dark canvas */}
      <section style={{ padding: "64px 32px 80px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 35%, #142254 60%, #1a3070 85%, #223c80 100%)", position: "relative", overflow: "hidden" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.3 }} />
        <div style={{ position: "absolute", top: 0, right: "8%", width: "50%", height: "50%", background: "radial-gradient(ellipse at 70% 0%, rgba(168,207,240,0.14) 0%, rgba(74,132,196,0.08) 35%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 20 }}>Revenue Opportunity Simulator</span>
            <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1, marginBottom: 20, maxWidth: 760, marginLeft: "auto", marginRight: "auto" }}>
              How much revenue is your user base not generating yet?
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 560, margin: "0 auto" }}>
              Answer four questions about your platform and get an executive-grade estimate of your affiliate commerce opportunity — with a downloadable business case for your team.
            </p>
          </div>

          <RevenueSimulator variant="full" />
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 40%, #1a3070 65%, #2952a8 82%, #4a84c4 100%)", padding: "88px 32px", position: "relative" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 18 }}>
            See your business potential with MBO Rewards.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 40 }}>
            We&apos;ll validate your numbers against live campaign data from your market and build a personalised business case for your leadership team.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/contact" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700, padding: "14px 32px", borderRadius: 9, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none", boxShadow: "0 6px 28px rgba(201,162,39,0.4)" }}>
              Request Personalised Business Case
            </a>
            <a href="/contact" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 600, padding: "14px 32px", borderRadius: 9, background: "rgba(74,132,196,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(168,207,240,0.25)", color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
              Book a Demo
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
