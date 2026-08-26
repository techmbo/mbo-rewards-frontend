"use client";
import PageShell from "@/components/PageShell";
import { useState, useRef } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

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
          <span className="section-label" style={{ color: "#c9a227", display: "block", marginBottom: 20 }}>Contact</span>
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
            Launch your rewards layer
            <br />
            <span className="text-gold">with MBO.</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 520 }}>
            Talk to our integration team. We'll scope your use case, walk you through the API, and get you live — in days, not months.
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section style={{ background: "#ffffff", padding: "100px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 100, alignItems: "start" }}>

          {/* Left — info */}
          <div>
            <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.025em", marginBottom: 24, lineHeight: 1.15 }}>
              What to expect
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { step: "1", title: "We review your platform", body: "Within one business day, our integration team reviews your submission and reaches out to schedule a call." },
                { step: "2", title: "Scoping call (30 min)", body: "We walk through your platform type, user model, compliance requirements, and technical stack to scope the integration." },
                { step: "3", title: "API credentials + sandbox", body: "You receive sandbox API credentials, integration documentation, and a dedicated integration engineer contact." },
                { step: "4", title: "Go live", body: "Most integrations complete in 2–3 days. We stay on the integration until you're live and generating revenue." },
              ].map((item, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 0, paddingBottom: i < 3 ? 24 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 2 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: "#0d1b3e", flexShrink: 0,
                      fontFamily: "var(--font-jakarta)",
                    }}>
                      {item.step}
                    </div>
                    {i < 3 && <div style={{ width: 1, flex: 1, background: "rgba(201,162,39,0.15)", margin: "4px 0" }} />}
                  </div>
                  <div style={{ paddingLeft: 16 }}>
                    <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 700, color: "#0d1b3e", marginBottom: 4 }}>{item.title}</p>
                    <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.65 }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 52, paddingTop: 40, borderTop: "1px solid #f0f4fa" }}>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>Direct contact</p>
              <a href="mailto:partnerships@mborewards.com" style={{ fontSize: 15, color: "#0d1b3e", fontWeight: 600, textDecoration: "none" }}>
                partnerships@mborewards.com
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div>
            {submitted ? (
              <div
                style={{
                  border: "1px solid rgba(201,162,39,0.3)",
                  borderRadius: 16,
                  padding: "56px 48px",
                  background: "rgba(201,162,39,0.03)",
                  textAlign: "center",
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a, #c9a227)", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d1b3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 22, fontWeight: 800, color: "#0d1b3e", marginBottom: 12 }}>Request received</h3>
                <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7 }}>
                  We'll be in touch within one business day to schedule a scoping call.
                </p>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={async e => {
                  e.preventDefault();
                  setLoading(true);
                  setError("");
                  const fd = new FormData(formRef.current!);
                  const payload = Object.fromEntries(fd.entries());
                  try {
                    const res = await fetch("/api/contact", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) throw new Error();
                    setSubmitted(true);
                  } catch {
                    setError("Something went wrong. Please try again or email us directly.");
                  } finally {
                    setLoading(false);
                  }
                }}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {/* Row: Name + Job title */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { placeholder: "Your name *", type: "text", name: "name", required: true },
                    { placeholder: "Job title *", type: "text", name: "jobtitle", required: true },
                  ].map(f => (
                    <input key={f.name} type={f.type} name={f.name} placeholder={f.placeholder} required={f.required}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#0d1b3e", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none", boxSizing: "border-box" }} />
                  ))}
                </div>

                {/* Row: Work email + Mobile */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input type="email" name="email" placeholder="Work email *" required
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#0d1b3e", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none", boxSizing: "border-box" }} />
                  <input type="tel" name="mobile" placeholder="Mobile number *" required
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#0d1b3e", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none", boxSizing: "border-box" }} />
                </div>

                {/* Row: Company + Website */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { placeholder: "Company / Platform name *", type: "text", name: "company", required: true },
                    { placeholder: "Website *", type: "url", name: "website", required: true },
                  ].map(f => (
                    <input key={f.name} type={f.type} name={f.name} placeholder={f.placeholder} required={f.required}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#0d1b3e", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none", boxSizing: "border-box" }} />
                  ))}
                </div>

                {/* Country */}
                <select name="country" required defaultValue=""
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none" }}>
                  <option value="" disabled>Country *</option>
                  <optgroup label="Key Markets">
                    <option value="IN">India</option>
                    <option value="AE">United Arab Emirates</option>
                    <option value="SG">Singapore</option>
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                  </optgroup>
                  <optgroup label="Southeast Asia">
                    <option value="ID">Indonesia</option>
                    <option value="MY">Malaysia</option>
                    <option value="PH">Philippines</option>
                    <option value="TH">Thailand</option>
                    <option value="VN">Vietnam</option>
                  </optgroup>
                  <optgroup label="Middle East">
                    <option value="SA">Saudi Arabia</option>
                    <option value="QA">Qatar</option>
                    <option value="KW">Kuwait</option>
                    <option value="BH">Bahrain</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="AU">Australia</option>
                    <option value="CA">Canada</option>
                    <option value="DE">Germany</option>
                    <option value="NL">Netherlands</option>
                    <option value="other">Other</option>
                  </optgroup>
                </select>

                {/* Platform type */}
                <select name="platform" required defaultValue=""
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none" }}>
                  <option value="" disabled>Platform type *</option>
                  <option value="bank">Bank / NBFC</option>
                  <option value="fintech">Fintech app</option>
                  <option value="ecommerce">E-commerce / Marketplace</option>
                  <option value="media">Media / Content platform</option>
                  <option value="loyalty">Loyalty platform</option>
                  <option value="travel">Travel &amp; Lifestyle</option>
                  <option value="publisher">Publisher / Aggregator</option>
                  <option value="other">Other</option>
                </select>

                {/* MAU */}
                <select name="mau" required defaultValue=""
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none" }}>
                  <option value="" disabled>Monthly active users *</option>
                  <option value="under-1k">Under 1,000</option>
                  <option value="1k-10k">1,000 – 10,000</option>
                  <option value="10k-50k">10,000 – 50,000</option>
                  <option value="50k-100k">50,000 – 100,000</option>
                  <option value="100k-500k">100,000 – 500,000</option>
                  <option value="500k-1m">500,000 – 1 million</option>
                  <option value="1m-5m">1 million – 5 million</option>
                  <option value="5m-10m">5 million – 10 million</option>
                  <option value="over-10m">Over 10 million</option>
                </select>

                {/* Row: Source + Timeline */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <select name="source" defaultValue=""
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none" }}>
                    <option value="" disabled>How did you hear about us?</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="google">Google Search</option>
                    <option value="referral">Referral</option>
                    <option value="event">Event / Conference</option>
                    <option value="press">Press / Media</option>
                    <option value="other">Other</option>
                  </select>
                  <select name="timeline" defaultValue=""
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none" }}>
                    <option value="" disabled>Expected go-live</option>
                    <option value="asap">As soon as possible</option>
                    <option value="1month">Within 1 month</option>
                    <option value="3months">1–3 months</option>
                    <option value="6months">3–6 months</option>
                    <option value="exploring">Just exploring</option>
                  </select>
                </div>

                {/* Message */}
                <textarea name="message" placeholder="Tell us about your use case (optional)" rows={3}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#0d1b3e", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none", resize: "vertical", boxSizing: "border-box" }} />

                <button type="submit" disabled={loading}
                  style={{ marginTop: 4, width: "100%", padding: "15px 0", borderRadius: 10, border: "none", background: loading ? "rgba(201,162,39,0.4)" : "linear-gradient(135deg, #f0d47a 0%, #e8c55a 30%, #c9a227 100%)", color: "#0d1b3e", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-jakarta)", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 24px rgba(201,162,39,0.3)", letterSpacing: "0.01em", transition: "background 0.2s" }}>
                  {loading ? "Sending…" : "Request a Demo"}
                </button>
                {error && <p style={{ fontSize: 13, color: "#e55a5a", textAlign: "center", marginTop: 4 }}>{error}</p>}
                <p style={{ fontSize: 11.5, color: "#94a3b8", textAlign: "center", marginTop: 2 }}>
                  Fields marked * are required. No commitments. We respond within one business day.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
