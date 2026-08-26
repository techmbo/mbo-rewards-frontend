import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import LazyEmbed from "@/components/simulator/LazyEmbed";

export const metadata: Metadata = {
  title: "MBO Rewards — Affiliate Commerce Infrastructure API for Fintech Platforms",
  description:
    "MBO Rewards is an affiliate commerce API for banking and fintech apps. One integration. 500+ campaigns. Server-side tracking. Live in 2–3 days. Zero upfront cost.",
  alternates: { canonical: "https://mborewards.com" },
  openGraph: { title: "MBO Rewards — Affiliate Commerce Infrastructure API for Fintech Platforms", description: "MBO Rewards is an affiliate commerce API for banking and fintech apps. One integration. 500+ campaigns. Server-side tracking. Live in 2–3 days. Zero upfront cost.", url: "https://mborewards.com" },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "MBO Rewards", item: "https://mborewards.com" },
  ],
};

export default function Home() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {/* Hero */}
      <section style={{ padding: "52px 32px 72px", background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)", position: "relative", overflow: "hidden" }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        {/* Crystal radial glow — top-face highlight from gem letterform */}
        <div style={{ position: "absolute", top: 0, right: "5%", width: "55%", height: "70%", background: "radial-gradient(ellipse at 70% 0%, rgba(168,207,240,0.18) 0%, rgba(74,132,196,0.1) 35%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 20 }}>API Infrastructure</span>
            <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.08, marginBottom: 24, maxWidth: 560 }}>
              Infrastructure for affiliate commerce across fintech platforms.
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 460, marginBottom: 12 }}>
              Integrate cashback, offers, and affiliate commerce into your platform using a single API with real-time tracking and monetisation.
            </p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.3)", marginBottom: 36 }}>One API. Every campaign. Full tracking.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 28 }}>
              <a href="/contact" className="btn-cta" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700, padding: "14px 30px", borderRadius: 8, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none", boxShadow: "0 4px 24px rgba(201,162,39,0.35)" }}>
                Book Demo
              </a>
              <a href="/revenue-simulator" className="btn-cta" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 600, padding: "14px 30px", borderRadius: 8, background: "rgba(74,132,196,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(168,207,240,0.2)", color: "rgba(255,255,255,0.75)", textDecoration: "none", boxShadow: "inset 0 1px 0 rgba(168,207,240,0.1)" }}>
                Try the Simulator
              </a>
              <a href="/how-it-works" style={{ fontFamily: "var(--font-jakarta)", fontSize: 13.5, fontWeight: 600, color: "rgba(255,255,255,0.55)", textDecoration: "none", padding: "14px 6px" }}>
                View integration →
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Integration typically completed in 2–3 days</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Designed for high-volume fintech and banking platforms</p>
            </div>
          </div>
          {/* Architecture illustration: Merchant Networks → MBO API → Banking App → Customer → Commission */}
          <div role="img" aria-label="Value flow: merchant networks feed the MBO Rewards API, offers render in your app, customer purchases are tracked, and commission revenue is confirmed" style={{ borderRadius: 16, border: "1px solid rgba(168,207,240,0.15)", background: "rgba(7,14,32,0.75)", backdropFilter: "blur(12px)", padding: "30px 30px", boxShadow: "0 20px 60px rgba(6,13,31,0.5), inset 0 1px 0 rgba(168,207,240,0.08)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(168,207,240,0.55)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 22 }}>How value flows</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { title: "Merchant Networks", sub: "500+ campaigns, every major network", icon: "◫", hero: false },
                { title: "MBO Rewards API", sub: "Normalised · deduplicated · tracked server-side", icon: "◈", hero: true },
                { title: "Your Banking App", sub: "Offers rendered white-label in your UX", icon: "▤", hero: false },
                { title: "Customer Purchase", sub: "Attribution via opaque token — zero PII", icon: "◉", hero: false },
                { title: "Commission Revenue", sub: "Confirmed conversions, monthly statements", icon: "◆", hero: false, gold: true },
              ].map((n, i, arr) => (
                <div key={n.title}>
                  <div className={n.hero ? "flow-glow" : n.gold ? "flow-pulse" : undefined} style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "13px 16px", borderRadius: 11,
                    border: n.hero ? "1px solid rgba(201,162,39,0.5)" : n.gold ? "1px solid rgba(201,162,39,0.35)" : "1px solid rgba(168,207,240,0.12)",
                    background: n.hero ? "linear-gradient(135deg, rgba(232,197,90,0.14), rgba(41,82,168,0.12))" : n.gold ? "rgba(201,162,39,0.08)" : "rgba(13,27,62,0.5)",
                  }}>
                    <span aria-hidden="true" style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0, fontSize: 15,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: n.hero || n.gold ? "rgba(201,162,39,0.18)" : "rgba(74,132,196,0.15)",
                      border: n.hero || n.gold ? "1px solid rgba(201,162,39,0.35)" : "1px solid rgba(168,207,240,0.15)",
                      color: n.hero || n.gold ? "#e8c55a" : "#a8cff0",
                    }}>{n.icon}</span>
                    <span>
                      <span style={{ display: "block", fontFamily: "var(--font-jakarta)", fontSize: 13.5, fontWeight: 700, color: n.hero || n.gold ? "#e8c55a" : "#ffffff", marginBottom: 2 }}>{n.title}</span>
                      <span style={{ display: "block", fontSize: 11.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{n.sub}</span>
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 7, padding: "3px 0", position: "relative" }} aria-hidden="true">
                      <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                        <path d="M5 0v10M1 9l4 4 4-4" stroke="rgba(168,207,240,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="flow-dot" style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: "#e8c55a", animationDelay: `${i * 0.35}s` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section style={{ background: "#f8f9fc", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>The problem</span>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(24px, 2.5vw, 34px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 40, maxWidth: 500 }}>
            Affiliate infrastructure is broken for in-app platforms.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
            {[
              { title: "Fragmented networks", body: "Every network is a separate contract, a separate integration, and a separate reporting dashboard. Maintaining four networks means four engineering efforts." },
              { title: "Cookie-based tracking", body: "Cookie-based tracking breaks inside apps and authenticated sessions. It cannot meet compliance requirements in banking and fintech environments." },
              { title: "No off-the-shelf path", body: "Banks and fintechs have no pre-built route to affiliate revenue. Every attempt requires a custom build against multiple disparate APIs." },
              { title: "Attribution gaps", body: "Open-web attribution tooling was built for browsers, not logged-in apps. It fails consistently in the environments where the highest-value users live." },
            ].map(v => (
              <div key={v.title} className="lift" style={{ padding: "28px 24px", borderRadius: 12, border: "1px solid #edf0f7", background: "#ffffff" }}>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700, color: "#0d1b3e", marginBottom: 10 }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section style={{ background: "#ffffff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Solution</span>
            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(24px, 2.5vw, 36px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 20, lineHeight: 1.15 }}>
              A unified API layer for affiliate commerce.
            </h2>
            <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.75, marginBottom: 28 }}>
              MBO Rewards aggregates campaigns, manages tracking, and enables monetisation — without multiple integrations, separate contracts, or compliance risk.
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24, fontStyle: "italic" }}>Live tracking of clicks, conversions, GMV, and commission across campaigns.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Unified campaign catalog", "Real-time tracking", "Fully white-label"].map(pt => (
                <div key={pt} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a, #c9a227)", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "#475569" }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "API Layer", sub: "Single REST endpoint for all campaigns and tracking" },
              { label: "Campaign Engine", sub: "500+ campaigns normalised across every major network" },
              { label: "Tracking Engine", sub: "Server-side attribution, zero cookies, zero PII" },
              { label: "Dashboard", sub: "Real-time clicks, conversions, and commission reporting" },
            ].map(s => (
              <div key={s.label} style={{ padding: "18px 20px", border: "1px solid #edf0f7", borderRadius: 10, background: "#fafbff", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a, #c9a227)", flexShrink: 0, marginTop: 7 }} />
                <div>
                  <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 700, color: "#0d1b3e", marginBottom: 3 }}>{s.label}</p>
                  <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.6 }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "#f8f9fc", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>How it works</span>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(24px, 2.5vw, 34px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 48, maxWidth: 560 }}>
            From campaign fetch to confirmed commission in five documented API calls.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0, position: "relative" }} className="hiw-grid">
            <div className="hiw-line" style={{ position: "absolute", top: 20, left: "4%", right: "4%", height: 1, background: "linear-gradient(90deg, #e8c55a, #c9a227)", zIndex: 0 }} />
            {["API", "App", "User", "Purchase", "Tracking", "Commission"].map((label, i) => (
              <div key={label} className="hiw-item" style={{ textAlign: "center", padding: "0 8px", position: "relative", zIndex: 1 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 10, fontWeight: 800, color: "#0d1b3e" }}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 12, fontWeight: 700, color: "#0d1b3e" }}>{label}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 36, fontSize: 14, color: "#64748b", lineHeight: 1.75, maxWidth: 680, margin: "36px auto 0" }}>
            The result: most banks and fintech platforms simply don't integrate affiliate commerce — not because the opportunity isn't there, but because the infrastructure isn't.
          </p>
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <a href="/how-it-works" style={{ fontSize: 13, fontWeight: 600, color: "#c9a227", textDecoration: "none" }}>See detailed integration →</a>
          </div>
        </div>
      </section>

      {/* Integration */}
      <section style={{ background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 40%, #1a3070 65%, #2952a8 82%, #4a84c4 100%)", padding: "72px 32px", position: "relative" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Integration</span>
            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(24px, 2.5vw, 34px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.025em", marginBottom: 32, lineHeight: 1.15 }}>
              REST API. JSON. Live in 2–3 days.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
              {["REST API", "JSON responses", "Webhooks", "2–3 day integration"].map(pt => (
                <div key={pt} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9a227", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>{pt}</span>
                </div>
              ))}
            </div>
            <a href="/contact" className="btn-cta" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 700, padding: "12px 26px", borderRadius: 8, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none" }}>
              Book Demo
            </a>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(201,162,39,0.6)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Live API Response Preview</p>
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(201,162,39,0.15)", background: "#070e20" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#3d3d3d" }} />
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#3d3d3d" }} />
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#3d3d3d" }} />
              </div>
              <pre className="code-font" style={{ margin: 0, padding: "24px 28px", color: "#cdd6f4", fontSize: "0.73rem", lineHeight: 1.85, overflowX: "auto" }}>
                <code>{`GET /v1/campaigns
Authorization: Bearer sk_live_...
X-User-Token: opaque_user_id

200 OK
{
  "campaign": "Travel Offer",
  "cashback": "8%",
  "tracking_id": "txn_12345"
}`}</code>
              </pre>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 12 }}>Fetch campaigns, track conversions, and manage commissions in real time</p>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section style={{ background: "#ffffff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Use cases</span>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(24px, 2.5vw, 34px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 40 }}>
            Built for platforms with active users.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {[
              { label: "Banking Apps", outcome: "Engagement", body: "Embed rewards directly inside banking apps to increase engagement and generate affiliate revenue." },
              { label: "Fintech Platforms", outcome: "Monetisation", body: "Enable monetisation through affiliate commerce at the point of spend or interaction." },
              { label: "Digital Platforms", outcome: "Revenue", body: "Monetise your existing user base with relevant offers — no new product required." },
            ].map(v => (
              <div key={v.label} className="lift" style={{ padding: "28px 24px", borderRadius: 14, border: "1px solid #edf0f7", background: "#ffffff" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#c9a227", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>{v.outcome}</p>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 17, fontWeight: 800, color: "#0d1b3e", marginBottom: 10 }}>{v.label}</h3>
                <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.7 }}>{v.body}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <a href="/use-cases" style={{ fontSize: 13, fontWeight: 600, color: "#c9a227", textDecoration: "none" }}>See all use cases →</a>
          </div>
        </div>
      </section>

      {/* Revenue Simulator (embedded) */}
      <section style={{ background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 45%, #142254 75%, #1a3070 100%)", padding: "80px 32px", position: "relative", overflow: "hidden" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ position: "absolute", top: 0, left: "10%", width: "45%", height: "60%", background: "radial-gradient(ellipse at 30% 0%, rgba(168,207,240,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Revenue opportunity</span>
            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(24px, 2.8vw, 36px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.025em", marginBottom: 14 }}>
              What is your user base worth in affiliate revenue?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
              Three inputs. An instant estimate. Build the full executive business case in under two minutes.
            </p>
          </div>
          <LazyEmbed />
        </div>
      </section>

      {/* Positioning */}
      <section style={{ background: "#0d1b3e", padding: "60px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={{ fontSize: 12, color: "rgba(201,162,39,0.5)", fontWeight: 600, letterSpacing: "0.08em", textAlign: "center", marginBottom: 32 }}>Infrastructure for the embedded commerce layer of modern fintech platforms</p>
          <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px 0" }}>
            {[
              { val: "Single API", label: "Every network" },
              { val: "2–3 days", label: "Integration time" },
              { val: "Zero PII", label: "Stored by MBO" },
              { val: "Zero upfront", label: "Cost to go live" },
            ].map((s, i) => (
              <div key={s.label} style={{ textAlign: "center", padding: "0 12px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2.5vw, 30px)", fontWeight: 800, color: "#e8c55a", marginBottom: 6 }}>{s.val}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why MBO */}
      <section style={{ background: "#f8f9fc", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Why MBO Rewards</span>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(24px, 2.5vw, 34px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 40, maxWidth: 480 }}>
            Not an affiliate network. The layer beneath it.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { title: "Single API vs multiple integrations", body: "One integration replaces every affiliate network, contract, and dashboard." },
              { title: "Fast integration (2–3 days)", body: "From sandbox credentials to production in under a week. Dedicated integration support included." },
              { title: "No PII storage", body: "User identity is an opaque token you generate. MBO cannot reverse-map it." },
              { title: "Fully white-label", body: "MBO is invisible to your users. Your brand, your UX, your product." },
              { title: "Built for regulated environments", body: "Designed for banks and fintech platforms from day one — not retrofitted." },
            ].map(v => (
              <div key={v.title} className="lift" style={{ padding: "24px 22px", borderRadius: 12, border: "1px solid #edf0f7", background: "#ffffff" }}>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700, color: "#0d1b3e", marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ background: "#ffffff", padding: "72px 32px", scrollMarginTop: 90 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>FAQ</span>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 40 }}>Frequently asked questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { q: "What is MBO Rewards?", a: "MBO Rewards is an affiliate commerce infrastructure API that enables banks, fintech apps, and digital platforms to integrate cashback, offers, and monetisation through a single REST API. One integration replaces multiple affiliate network contracts." },
              { q: "How is MBO Rewards different from an affiliate network?", a: "MBO Rewards is not an affiliate network. It is the infrastructure layer beneath them — aggregating campaigns from multiple networks and delivering them to client applications through a unified API with server-side tracking." },
              { q: "Does MBO Rewards work inside mobile banking apps?", a: "Yes. MBO Rewards uses server-side attribution with no cookies or client-side scripts, making it specifically suited for authenticated mobile environments where browser-based tracking fails." },
              { q: "How much does MBO Rewards cost?", a: "There are no setup fees, no monthly charges, and no per-call API fees. MBO Rewards earns a percentage of confirmed affiliate commissions generated through your integration. The revenue share rate is agreed at onboarding." },
            ].map((faq, i, arr) => (
              <div key={faq.q} style={{ padding: "28px 0", borderBottom: i < arr.length - 1 ? "1px solid #edf0f7" : "none" }}>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#0d1b3e", marginBottom: 10 }}>{faq.q}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75 }}>{faq.a}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 36, display: "flex", gap: 24 }}>
            <a href="/product" style={{ fontSize: 13, fontWeight: 600, color: "#c9a227", textDecoration: "none" }}>See the product →</a>
            <a href="/use-cases" style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none" }}>Explore use cases →</a>
          </div>
        </div>
      </section>

      {/* Category + CTA */}
      <section style={{ background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 40%, #1a3070 65%, #2952a8 82%, #4a84c4 100%)", padding: "88px 32px", position: "relative" }}>
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(201,162,39,0.5)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24 }}>Category</p>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 3vw, 38px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 40 }}>
            MBO Rewards is infrastructure. Not a marketplace. Not a network. The layer beneath both.
          </h2>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/contact" className="btn-cta" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700, padding: "14px 32px", borderRadius: 9, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textDecoration: "none", boxShadow: "0 6px 28px rgba(201,162,39,0.4)" }}>
              Book Demo
            </a>
            <a href="/revenue-simulator" className="btn-cta" style={{ display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 600, padding: "14px 32px", borderRadius: 9, border: "1px solid rgba(168,207,240,0.25)", color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>
              Try the Simulator
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
