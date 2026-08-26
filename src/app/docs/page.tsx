import PageShell from "@/components/PageShell";

const endpoints = [
  {
    method: "GET",
    path: "/v1/campaigns",
    desc: "Fetch a ranked list of live campaigns for a given user segment.",
    params: ["X-User-Token (header)", "X-Segment (header, optional)", "category (query, optional)", "limit (query, default 50)"],
  },
  {
    method: "POST",
    path: "/v1/clicks",
    desc: "Record a click event and receive an attribution token + tracking URL.",
    params: ["campaign_id (body)", "user_token (body)", "placement (body, optional)"],
  },
  {
    method: "POST",
    path: "/v1/conversions/postback",
    desc: "Receive a merchant conversion event and confirm attribution.",
    params: ["token (body)", "order_id (body)", "order_value (body)", "currency (body)", "status (body)"],
  },
  {
    method: "GET",
    path: "/v1/conversions",
    desc: "List conversion events for your platform with filtering and pagination.",
    params: ["status (query, optional)", "campaign_id (query, optional)", "from / to (query, ISO 8601)", "limit / offset (query)"],
  },
  {
    method: "GET",
    path: "/v1/commissions",
    desc: "List commission credits and pending amounts across all campaigns.",
    params: ["status (query: pending | credited | reversed)", "period (query: YYYY-MM)", "limit / offset (query)"],
  },
  {
    method: "GET",
    path: "/v1/merchants",
    desc: "Fetch merchant metadata including categories, average commission rates, and active status.",
    params: ["category (query, optional)", "active (query, boolean)"],
  },
];

const webhooks = [
  { event: "click.recorded", desc: "Fired when a click attribution token is generated." },
  { event: "conversion.received", desc: "Fired when a merchant postback arrives." },
  { event: "conversion.approved", desc: "Fired when fraud scoring completes and the conversion is confirmed." },
  { event: "conversion.rejected", desc: "Fired when a conversion fails fraud scoring or validation." },
  { event: "commission.credited", desc: "Fired when a commission amount is credited to your account." },
  { event: "commission.reversed", desc: "Fired when a merchant reverses a commission." },
];

const methodColor: Record<string, string> = {
  GET: "#2952a8",
  POST: "#0d4a2f",
  PUT: "#7c3aed",
  DELETE: "#be123c",
};

export default function DocsPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section
        style={{
          padding: "64px 32px 64px",
          background: "linear-gradient(160deg, #060d1f 0%, #0d1b3e 30%, #1a3070 55%, #2952a8 72%, #4a84c4 88%, #6ba8d8 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="gold-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 20 }}>API Reference</span>
          <h1
            style={{
              fontFamily: "var(--font-jakarta)",
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              lineHeight: 1.08,
              marginBottom: 24,
              maxWidth: 700,
            }}
          >
            MBO Rewards API
            <br />
            <span className="text-gold">Documentation</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 540, marginBottom: 36 }}>
            REST API. JSON over HTTPS. Bearer token authentication. Base URL: <span className="code-font" style={{ color: "#e8c55a", fontSize: 15 }}>https://api.mborewards.com</span>
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
              <span className="code-font" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Version: v1</span>
            </div>
            <div style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(201,162,39,0.2)", background: "rgba(201,162,39,0.04)" }}>
              <span className="code-font" style={{ fontSize: 13, color: "#e8c55a" }}>OpenAPI 3.1</span>
            </div>
          </div>
        </div>
      </section>

      {/* Auth */}
      <section style={{ background: "#f8f9fc", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Authentication</span>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 32 }}>
            Bearer token
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            <div>
              <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.75, marginBottom: 20 }}>
                All API requests require a Bearer token in the Authorization header. API keys are generated in the Partner Dashboard and have platform-level scope.
              </p>
              <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.75 }}>
                Keys are hashed server-side immediately on creation — the plaintext is shown exactly once. Store it in an environment variable and never expose it client-side.
              </p>
            </div>
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e8edf5", background: "#0a1428" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#3d3d3d" }} />
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#3d3d3d" }} />
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#3d3d3d" }} />
              </div>
              <pre className="code-font" style={{ margin: 0, padding: "20px 24px", overflowX: "auto", lineHeight: 1.8 }}>
                <code style={{ color: "#cdd6f4", fontSize: "0.73rem" }}>{`curl https://api.mborewards.com/v1/campaigns \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "X-Platform-Id: plat_abc123" \\
  -H "X-User-Token: opaque_user_id"`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section style={{ background: "#ffffff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Endpoints</span>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 48 }}>
            API reference
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {endpoints.map((ep, i) => (
              <div
                key={ep.path}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 48,
                  padding: "36px 0",
                  borderBottom: i < endpoints.length - 1 ? "1px solid #f0f4fa" : "none",
                  alignItems: "start",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span
                      className="code-font"
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#ffffff",
                        background: methodColor[ep.method] || "#475569",
                        padding: "3px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {ep.method}
                    </span>
                    <span className="code-font" style={{ fontSize: 14, color: "#0d1b3e", fontWeight: 600 }}>{ep.path}</span>
                  </div>
                  <p style={{ fontSize: 14.5, color: "#64748b", lineHeight: 1.7 }}>{ep.desc}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Parameters</p>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {ep.params.map(p => (
                      <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#c9a227", marginTop: 6, flexShrink: 0 }} />
                        <span className="code-font" style={{ color: "#475569" }}>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section style={{ background: "#f8f9fc", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 16 }}>Webhooks</span>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 16 }}>
            Event notifications
          </h2>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.75, maxWidth: 560, marginBottom: 48 }}>
            MBO sends a POST request to your configured webhook URL for every lifecycle event. Each payload includes a timestamp and an HMAC-SHA256 signature for verification.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {webhooks.map(w => (
              <div key={w.event} style={{ border: "1px solid #edf0f7", borderRadius: 12, padding: "24px 24px", background: "#ffffff", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a, #c9a227)", marginTop: 6, flexShrink: 0 }} />
                <div>
                  <p className="code-font" style={{ fontSize: 13, fontWeight: 700, color: "#0d1b3e", marginBottom: 6 }}>{w.event}</p>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get credentials */}
      <section style={{ background: "#ffffff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 16 }}>
            Get sandbox credentials
          </h2>
          <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7, marginBottom: 36 }}>
            Request a demo to receive sandbox API keys, test merchant campaigns, and full integration documentation.
          </p>
          <a
            href="/contact"
            style={{
              display: "inline-flex",
              fontFamily: "var(--font-jakarta)",
              fontSize: 14,
              fontWeight: 700,
              padding: "14px 36px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)",
              color: "#0d1b3e",
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(201,162,39,0.3)",
            }}
          >
            Request API Access
          </a>
        </div>
      </section>
    </PageShell>
  );
}
