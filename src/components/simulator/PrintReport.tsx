"use client";
import {
  SimulatorInputs,
  SimulatorResults,
  SIMULATOR_CONFIG,
  businessTypeLabel,
  countryLabel,
  formatUsd,
  formatCount,
  monthlyProjection,
  calculationSteps,
  generateExecutiveSummary,
  generateInsights,
  generateAssessment,
  annualRange,
} from "@/lib/simulator";

export interface LeadInfo {
  name: string;
  company: string;
  email: string;
  jobtitle: string;
}

// Print-only branded business case. Hidden on screen; revealed by print CSS
// (see globals.css `#sim-print-report` rules) when the download CTA is clicked.
export default function PrintReport({ inputs, results, lead }: { inputs: SimulatorInputs; results: SimulatorResults; lead: LeadInfo | null }) {
  const summary = generateExecutiveSummary(inputs, results);
  const insights = generateInsights(inputs, results);
  const assessment = generateAssessment(inputs, results);
  const calcs = calculationSteps(inputs, results);
  const projection = monthlyProjection(results.expected.monthlyCommission);
  const max = Math.max(...projection, 1);
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const selectedCats = SIMULATOR_CONFIG.categories.filter(c => inputs.categories.includes(c.id));
  const totalWeight = selectedCats.reduce((s, c) => s + (inputs.categoryWeights[c.id] ?? 1), 0) || 1;
  const mixText = selectedCats.length
    ? selectedCats.map(c => `${c.label} ${Math.round(((inputs.categoryWeights[c.id] ?? 1) / totalWeight) * 100)}%`).join(" · ")
    : "Broad merchant mix";

  const th: React.CSSProperties = { textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "2px solid #0d1b3e" };
  const td: React.CSSProperties = { padding: "8px 12px", fontSize: 12, color: "#1e293b", borderBottom: "1px solid #e2e8f0" };
  const h2: React.CSSProperties = { fontFamily: "var(--font-jakarta)", fontSize: 15, fontWeight: 800, margin: "0 0 12px" };

  const assessmentRows = [
    { label: "Revenue Opportunity", ...assessment.revenueOpportunity },
    { label: "Estimated Business Fit", ...assessment.businessFit },
    { label: "Implementation Complexity", ...assessment.complexity },
    { label: "Recommended Next Step", ...assessment.nextStep },
  ];

  return (
    <div id="sim-print-report" style={{ background: "#ffffff", color: "#0d1b3e", fontFamily: "var(--font-inter), Arial, sans-serif" }}>
      {/* ─── Cover page ─── */}
      <div style={{ minHeight: "96vh", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 56px 40px", pageBreakAfter: "always", boxSizing: "border-box", borderTop: "8px solid #c9a227" }}>
        <div>
          <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 26, fontWeight: 800, color: "#0d1b3e", margin: 0 }}>MBO Rewards</p>
          <p style={{ fontSize: 12, color: "#64748b", margin: "6px 0 0" }}>Affiliate Commerce Infrastructure API</p>
        </div>

        <div>
          <div style={{ width: 56, height: 4, background: "#c9a227", marginBottom: 24 }} />
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: 38, fontWeight: 800, color: "#0d1b3e", letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 16px" }}>
            Revenue Opportunity<br />Assessment
          </h1>
          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, maxWidth: 420, margin: "0 0 40px" }}>
            An executive estimate of the affiliate commission revenue opportunity from integrating the MBO Rewards API.
          </p>
          <table style={{ borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Prepared for", lead ? `${lead.name}${lead.jobtitle ? `, ${lead.jobtitle}` : ""} — ${lead.company}` : "—"],
                ["Prepared by", "MBO Rewards — Partnerships Team"],
                ["Date", date],
                ["Profile", `${businessTypeLabel(inputs.businessType)} · ${countryLabel(inputs.country)} · ${formatCount(inputs.mau)} MAU`],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ padding: "7px 24px 7px 0", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", verticalAlign: "top" }}>{k}</td>
                  <td style={{ padding: "7px 0", fontSize: 13, fontWeight: 600, color: "#0d1b3e" }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
          <p style={{ fontSize: 10, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
            CONFIDENTIAL — Prepared for the named recipient to support internal business planning. Contains estimates based on
            recipient-selected assumptions; not a guarantee of revenue. mborewards.com · partnerships@mborewards.com
          </p>
        </div>
      </div>

      {/* ─── Report body ─── */}
      <div style={{ padding: "40px 48px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid #c9a227", paddingBottom: 16, marginBottom: 24 }}>
          <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 16, fontWeight: 800, color: "#0d1b3e", margin: 0 }}>MBO Rewards — Revenue Opportunity Assessment</p>
          <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{date}</p>
        </div>

        {/* Headline */}
        <div style={{ background: "#0d1b3e", borderRadius: 10, padding: "24px 28px", marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#c9a227", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Estimated Annual Commission Revenue — Conservative to Optimistic</p>
          <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 34, fontWeight: 800, color: "#e8c55a", margin: "0 0 6px" }}>{annualRange(results)}</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0 }}>Expected scenario: <strong style={{ color: "#ffffff" }}>{formatUsd(results.expected.annualCommission)}</strong> · Estimate based on the selected assumptions</p>
        </div>

        {/* Executive assessment */}
        <h2 style={h2}>Executive Assessment</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
          <tbody>
            {assessmentRows.map(row => (
              <tr key={row.label}>
                <td style={{ ...td, width: "26%", color: "#64748b", verticalAlign: "top" }}>{row.label}</td>
                <td style={{ ...td, width: "22%", fontWeight: 800, color: "#c9a227", verticalAlign: "top" }}>{row.value}</td>
                <td style={{ ...td, color: "#334155" }}>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Inputs */}
        <h2 style={h2}>Business Profile & Assumptions</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
          <tbody>
            {[
              ["Business type", businessTypeLabel(inputs.businessType)],
              ["Market", countryLabel(inputs.country)],
              ["Monthly active users", formatCount(inputs.mau)],
              ["Merchant mix", mixText],
              ["Reward adoption rate", `${Math.round(inputs.adoptionRate * 100)}%`],
              ["Avg. orders per reward user / month", `${inputs.ordersPerUser}`],
              ["Average order value (weighted)", `$${inputs.aov}`],
              ["Blended affiliate commission (weighted)", `${(inputs.commissionRate * 100).toFixed(1)}%`],
            ].map(([k, v]) => (
              <tr key={k}>
                <td style={{ ...td, width: "45%", color: "#64748b" }}>{k}</td>
                <td style={{ ...td, fontWeight: 600 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Scenario comparison */}
        <h2 style={h2}>Scenario Comparison</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
          <thead>
            <tr>
              <th style={th}>Metric</th>
              {SIMULATOR_CONFIG.scenarios.map(s => (
                <th key={s.id} style={{ ...th, color: s.id === "expected" ? "#c9a227" : th.color }}>{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([
              ["Reward users / mo", (r: typeof results.expected) => formatCount(r.rewardUsers)],
              ["Monthly orders", (r: typeof results.expected) => formatCount(r.monthlyOrders)],
              ["Monthly GMV", (r: typeof results.expected) => formatUsd(r.monthlyGmv)],
              ["Monthly commission", (r: typeof results.expected) => formatUsd(r.monthlyCommission)],
              ["Annual commission", (r: typeof results.expected) => formatUsd(r.annualCommission)],
            ] as const).map(([label, fn], i, arr) => (
              <tr key={label}>
                <td style={{ ...td, color: "#64748b", fontWeight: i === arr.length - 1 ? 700 : 400 }}>{label}</td>
                {SIMULATOR_CONFIG.scenarios.map(s => (
                  <td key={s.id} style={{ ...td, fontWeight: i === arr.length - 1 ? 700 : 500, color: i === arr.length - 1 && s.id === "expected" ? "#c9a227" : td.color }}>
                    {fn(results[s.id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* How we calculated this */}
        <h2 style={h2}>How We Calculated This</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
          <tbody>
            {calcs.map(s => (
              <tr key={s.label}>
                <td style={{ ...td, width: 30, textAlign: "center", fontWeight: 800, color: s.operation === "=" || s.operation === "≈" ? "#c9a227" : "#64748b" }}>{s.operation ?? ""}</td>
                <td style={{ ...td, color: s.operation === "=" || s.operation === "≈" ? "#0d1b3e" : "#64748b", fontWeight: s.operation === "=" || s.operation === "≈" ? 600 : 400 }}>{s.label}</td>
                <td style={{ ...td, textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Projection chart (print-safe divs) */}
        <h2 style={{ ...h2, marginBottom: 14 }}>12-Month Ramp-Up Projection — Expected Scenario</h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, marginBottom: 6 }}>
          {projection.map((v, i) => (
            <div key={i} style={{ flex: 1, height: `${Math.max(4, (v / max) * 100)}%`, background: i === 11 ? "#c9a227" : "#2952a8", borderRadius: "3px 3px 0 0" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {projection.map((_, i) => (
            <p key={i} style={{ flex: 1, textAlign: "center", fontSize: 8, color: "#94a3b8", margin: 0 }}>M{i + 1}</p>
          ))}
        </div>

        {/* Executive summary */}
        <h2 style={h2}>Executive Summary</h2>
        {summary.map((p, i) => (
          <p key={i} style={{ fontSize: 12, color: "#334155", lineHeight: 1.75, margin: "0 0 10px" }}>{p}</p>
        ))}

        {/* Insights */}
        <h2 style={{ ...h2, marginTop: 20 }}>Key Takeaways</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {insights.map((t, i) => (
            <li key={i} style={{ fontSize: 12, color: "#334155", lineHeight: 1.75, marginBottom: 6 }}>{t}</li>
          ))}
        </ul>

        {/* Assumptions & disclaimer */}
        <h2 style={{ ...h2, marginTop: 20 }}>Assumptions & Disclaimer</h2>
        <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.7, margin: 0 }}>
          All figures in this document are estimates generated from the assumptions listed above. Scenarios apply configurable factors to the selected
          adoption, order frequency, and commission assumptions. Actual earnings depend on merchant mix, campaign performance, affiliate commission rates,
          and customer behaviour on your platform. This assessment is intended to support business planning and does not constitute a guarantee of revenue.
          Commission is earned only on confirmed conversions. Gift card capability is available on request.
        </p>

        {/* Footer */}
        <div style={{ marginTop: 28, paddingTop: 16, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between" }}>
          <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>
            MBO Rewards — one unified API for affiliate commerce. Merchant rewards through a single integration. CONFIDENTIAL.
          </p>
          <p style={{ fontSize: 10, color: "#0d1b3e", fontWeight: 600, margin: 0 }}>partnerships@mborewards.com</p>
        </div>
      </div>
    </div>
  );
}
