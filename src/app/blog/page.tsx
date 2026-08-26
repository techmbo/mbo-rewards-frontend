import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import BlogList from "./BlogList";

export const metadata: Metadata = {
  title: "Blog — MBO Rewards Affiliate Commerce Infrastructure",
  description:
    "Insights on affiliate commerce infrastructure, server-side attribution, fintech monetisation, and API-first rewards integration from the MBO Rewards team.",
  alternates: { canonical: "https://mborewards.com/blog" },
  openGraph: { title: "MBO Rewards Blog — Affiliate Commerce Infrastructure", description: "Infrastructure insights for fintech, banking, and digital platforms.", url: "https://mborewards.com/blog" },
};

export default function BlogPage() {
  return (
    <PageShell>
      <section style={{ padding: "64px 32px 64px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)", position: "relative", overflow: "hidden" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 20 }}>Blog</span>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.08, marginBottom: 20, maxWidth: 640 }}>
            Affiliate commerce infrastructure insights.
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 460 }}>
            Technical and strategic writing from the MBO Rewards team — for fintech builders, platform operators, and infrastructure thinkers.
          </p>
        </div>
      </section>
      <BlogList />
      <section style={{ background: "#f8f9fc", padding: "64px 32px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 12 }}>Ready to build?</h2>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 24 }}>MBO Rewards is an infrastructure layer for affiliate commerce powered by a unified API.</p>
          <a href="/contact" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 700, padding: "11px 24px", borderRadius: 8, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none" }}>Get API Access</a>
        </div>
      </section>
    </PageShell>
  );
}
