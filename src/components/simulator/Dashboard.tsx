"use client";
import {
  SimulatorInputs,
  SimulatorResults,
  formatUsd,
  formatCount,
  monthlyProjection,
  calculationSteps,
  generateInsights,
  generateExecutiveSummary,
  generateAssessment,
  adoptionSensitivity,
  annualRange,
  SIMULATOR_CONFIG,
} from "@/lib/simulator";
import { useState } from "react";
import { useAnimatedNumber } from "./useAnimatedNumber";

const CARD: React.CSSProperties = {
  padding: "24px 22px",
  borderRadius: 14,
  border: "1px solid rgba(168,207,240,0.12)",
  background: "rgba(13,27,62,0.5)",
  backdropFilter: "blur(12px)",
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "rgba(168,207,240,0.6)",
  letterSpacing: "0.08em", textTransform: "uppercase",
};

function Kpi({ label, value, format }: { label: string; value: number; format: (n: number) => string }) {
  const animated = useAnimatedNumber(value);
  return (
    <div style={CARD}>
      <p style={{ ...SECTION_LABEL, marginBottom: 10 }}>{label}</p>
      <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {format(animated)}
      </p>
    </div>
  );
}

function TextKpi({ label, value }: { label: string; value: string }) {
  return (
    <div style={CARD}>
      <p style={{ ...SECTION_LABEL, marginBottom: 10 }}>{label}</p>
      <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{value}</p>
    </div>
  );
}

// Hero card: scenario-derived range + expected estimate.
function RangeKpi({ results }: { results: SimulatorResults }) {
  const low = useAnimatedNumber(results.conservative.annualCommission);
  const high = useAnimatedNumber(results.optimistic.annualCommission);
  const mid = useAnimatedNumber(results.expected.annualCommission);
  return (
    <div
      style={{
        ...CARD,
        border: "1px solid rgba(201,162,39,0.4)",
        background: "linear-gradient(150deg, rgba(201,162,39,0.12), rgba(13,27,62,0.6))",
        boxShadow: "0 0 40px rgba(201,162,39,0.12)",
      }}
    >
      <p style={{ ...SECTION_LABEL, marginBottom: 12 }}>Estimated Annual Commission Revenue</p>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(232,197,90,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Conservative → Optimistic</p>
      <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 800, color: "#e8c55a", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 12 }}>
        {formatUsd(low)} – {formatUsd(high)}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, borderTop: "1px solid rgba(201,162,39,0.2)", paddingTop: 12 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Expected scenario</span>
        <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 17, fontWeight: 800, color: "#ffffff" }}>{formatUsd(mid)}</span>
      </div>
      <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", marginTop: 10, lineHeight: 1.5 }}>
        Estimate based on the selected assumptions.
      </p>
    </div>
  );
}

// Executive assessment for decision-makers.
function AssessmentCard({ inputs, results }: { inputs: SimulatorInputs; results: SimulatorResults }) {
  const a = generateAssessment(inputs, results);
  const items = [
    { label: "Revenue Opportunity", ...a.revenueOpportunity },
    { label: "Estimated Business Fit", ...a.businessFit },
    { label: "Implementation Complexity", ...a.complexity },
    { label: "Recommended Next Step", ...a.nextStep },
  ];
  return (
    <div style={{ ...CARD, border: "1px solid rgba(201,162,39,0.3)", background: "linear-gradient(150deg, rgba(13,27,62,0.75), rgba(6,13,31,0.75))" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#c9a227", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18 }}>Executive assessment</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {items.map(item => (
          <div key={item.label} style={{ padding: "16px 18px", borderRadius: 10, border: "1px solid rgba(168,207,240,0.12)", background: "rgba(255,255,255,0.02)" }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(168,207,240,0.55)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>{item.label}</p>
            <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 16, fontWeight: 800, color: "#e8c55a", marginBottom: 6 }}>{item.value}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Scenario comparison: Conservative / Expected / Optimistic + adoption sensitivity.
function ScenarioComparison({ inputs, results }: { inputs: SimulatorInputs; results: SimulatorResults }) {
  const scenarios = SIMULATOR_CONFIG.scenarios.map(s => ({ config: s, result: results[s.id] }));
  const sensitivity = adoptionSensitivity(inputs);
  const maxSens = Math.max(...sensitivity.map(p => p.annualCommission), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {scenarios.map(({ config: s, result: r }) => {
          const isExpected = s.id === "expected";
          return (
            <div key={s.id} style={{
              ...CARD,
              border: isExpected ? "1px solid rgba(201,162,39,0.45)" : "1px solid rgba(168,207,240,0.12)",
              background: isExpected ? "linear-gradient(150deg, rgba(201,162,39,0.1), rgba(13,27,62,0.6))" : CARD.background,
            }}>
              <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 800, color: isExpected ? "#e8c55a" : "#a8cff0", marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.55, marginBottom: 16, minHeight: 34 }}>{s.description}</p>
              <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 26, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 14 }}>{formatUsd(r.annualCommission)}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}> / yr</span></p>
              {[
                ["Reward users / mo", formatCount(r.rewardUsers)],
                ["Monthly orders", formatCount(r.monthlyOrders)],
                ["Monthly GMV", formatUsd(r.monthlyGmv)],
                ["Monthly commission", formatUsd(r.monthlyCommission)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: "1px solid rgba(168,207,240,0.08)" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{k}</span>
                  <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{v}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Adoption sensitivity */}
      <div style={CARD}>
        <p style={{ ...SECTION_LABEL, marginBottom: 6 }}>Adoption sensitivity — expected scenario</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 18 }}>How annual commission revenue responds to reward adoption on your platform.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sensitivity.map(p => (
            <div key={p.adoptionRate} className="m-keep" style={{ display: "grid", gridTemplateColumns: "90px 1fr 90px", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 12.5, fontWeight: p.isCurrent ? 700 : 400, color: p.isCurrent ? "#e8c55a" : "rgba(255,255,255,0.45)" }}>
                {Math.round(p.adoptionRate * 100)}%{p.isCurrent ? " ←" : ""}
              </span>
              <div style={{ height: 9, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 5, width: `${Math.max(2, (p.annualCommission / maxSens) * 100)}%`, background: p.isCurrent ? "#c9a227" : "rgba(107,168,216,0.7)", transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)" }} />
              </div>
              <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 700, color: p.isCurrent ? "#e8c55a" : "rgba(255,255,255,0.7)", textAlign: "right" }}>{formatUsd(p.annualCommission)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectionChart({ monthly }: { monthly: number }) {
  const data = monthlyProjection(monthly);
  const max = Math.max(...data, 1);
  const W = 560, H = 180, PAD = 4;
  const barW = (W - PAD * 2) / 12 - 8;
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="12 month revenue projection">
      {data.map((v, i) => {
        const h = Math.max(3, (v / max) * H);
        const x = PAD + i * ((W - PAD * 2) / 12) + 4;
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={barW} height={h} rx={4}
              fill={i === 11 ? "url(#simGold)" : "url(#simBlue)"}
              style={{ transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)" }} />
            <text x={x + barW / 2} y={H + 16} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.35)">M{i + 1}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="simBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ba8d8" />
          <stop offset="100%" stopColor="#2952a8" />
        </linearGradient>
        <linearGradient id="simGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8c55a" />
          <stop offset="100%" stopColor="#c9a227" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BreakdownChart({ results }: { results: SimulatorResults }) {
  const e = results.expected;
  const rows = [
    { label: "Monthly GMV", value: e.monthlyGmv, display: formatUsd(e.monthlyGmv), color: "rgba(107,168,216,0.85)" },
    { label: "Affiliate Commission / mo", value: e.monthlyCommission, display: formatUsd(e.monthlyCommission), color: "rgba(168,207,240,0.85)" },
    { label: "Annual Revenue Opportunity", value: e.annualCommission, display: annualRange(results), color: "#c9a227" },
  ];
  const max = Math.max(...rows.map(r => r.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {rows.map(r => (
        <div key={r.label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>{r.label}</span>
            <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 700, color: "#ffffff" }}>{r.display}</span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 5, width: `${Math.max(2, (r.value / max) * 100)}%`, background: r.color, transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// "How We Calculated This" — full transparent calculation trail.
function CalculationFlow({ inputs, results }: { inputs: SimulatorInputs; results: SimulatorResults }) {
  const steps = calculationSteps(inputs, results);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {steps.map((s, i) => {
        const isResult = s.operation === "=" || s.operation === "≈";
        const isFinal = i === steps.length - 1;
        return (
          <div key={s.label}>
            {s.operation && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 0 2px 18px" }}>
                <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 800, color: isResult ? "#e8c55a" : "rgba(168,207,240,0.7)", width: 14, textAlign: "center" }}>{s.operation}</span>
                <div style={{ width: 1, height: 14, background: "rgba(168,207,240,0.2)" }} />
              </div>
            )}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
              padding: "12px 18px", borderRadius: 10,
              border: isFinal ? "1px solid rgba(201,162,39,0.45)" : isResult ? "1px solid rgba(168,207,240,0.22)" : "1px solid rgba(168,207,240,0.1)",
              background: isFinal ? "rgba(201,162,39,0.1)" : isResult ? "rgba(41,82,168,0.18)" : "rgba(255,255,255,0.02)",
            }}>
              <span style={{ fontSize: 13, color: isFinal ? "#e8c55a" : isResult ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)", fontWeight: isResult || isFinal ? 600 : 400 }}>{s.label}</span>
              <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 800, color: isFinal ? "#e8c55a" : isResult ? "#a8cff0" : "rgba(255,255,255,0.7)", whiteSpace: "nowrap" }}>{s.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AssumptionsDisclaimer() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ ...CARD, padding: 0, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", background: "transparent", border: "none", cursor: "pointer" }}
      >
        <span style={{ ...SECTION_LABEL }}>Assumptions & disclaimer</span>
        <span style={{ color: "rgba(168,207,240,0.6)", fontSize: 14, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "0 22px 20px" }}>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "All figures shown are estimates generated from the assumptions you selected, not measured results.",
              "Actual earnings depend on merchant mix, campaign performance, affiliate commission rates, and customer behaviour on your platform.",
              "Scenarios apply configurable factors to your adoption, order frequency, and commission assumptions — see the scenario comparison for details.",
              "Default adoption rates, order values, and commission rates are indicative benchmarks and can be adjusted under “Adjust assumptions”.",
              "This simulator is intended to support business planning and does not constitute a guarantee of revenue.",
            ].map((t, i) => (
              <li key={i} style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ inputs, results, onDownload }: { inputs: SimulatorInputs; results: SimulatorResults; onDownload: () => void }) {
  const insights = generateInsights(inputs, results);
  const summary = generateExecutiveSummary(inputs, results);
  const [showScenarios, setShowScenarios] = useState(false);
  const e = results.expected;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        <Kpi label="Reward Users / mo" value={e.rewardUsers} format={formatCount} />
        <Kpi label="Monthly Orders" value={e.monthlyOrders} format={formatCount} />
        <Kpi label="Estimated GMV / mo" value={e.monthlyGmv} format={formatUsd} />
        <Kpi label="Commission / mo" value={e.monthlyCommission} format={formatUsd} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
        <RangeKpi results={results} />
        <TextKpi label="Estimated Launch" value={SIMULATOR_CONFIG.launchTime} />
        <TextKpi label="Integrations Replaced" value={`${results.integrationsReplaced}+`} />
      </div>

      {/* Executive assessment */}
      <AssessmentCard inputs={inputs} results={results} />

      {/* Scenario comparison (optional view) */}
      <div>
        <button
          onClick={() => setShowScenarios(v => !v)}
          aria-expanded={showScenarios}
          style={{
            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 22px", borderRadius: 14, cursor: "pointer",
            border: showScenarios ? "1px solid rgba(201,162,39,0.35)" : "1px solid rgba(168,207,240,0.12)",
            background: "rgba(13,27,62,0.5)", backdropFilter: "blur(12px)",
          }}
        >
          <span style={{ ...SECTION_LABEL, color: showScenarios ? "#e8c55a" : SECTION_LABEL.color }}>
            Scenario comparison — Conservative · Expected · Optimistic
          </span>
          <span style={{ color: "rgba(168,207,240,0.6)", fontSize: 14, transform: showScenarios ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
        </button>
        {showScenarios && (
          <div style={{ marginTop: 14 }}>
            <ScenarioComparison inputs={inputs} results={results} />
          </div>
        )}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14 }}>
        <div style={CARD}>
          <p style={{ ...SECTION_LABEL, marginBottom: 18 }}>12-month revenue projection — expected scenario</p>
          <ProjectionChart monthly={e.monthlyCommission} />
        </div>
        <div style={CARD}>
          <p style={{ ...SECTION_LABEL, marginBottom: 18 }}>Revenue breakdown</p>
          <BreakdownChart results={results} />
        </div>
      </div>

      {/* Executive summary + How We Calculated This */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14, alignItems: "start" }}>
        <div style={{ ...CARD, border: "1px solid rgba(201,162,39,0.25)", background: "linear-gradient(150deg, rgba(13,27,62,0.7), rgba(6,13,31,0.7))" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#c9a227", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Executive summary</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {summary.map((p, i) => (
              <p key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>{p}</p>
            ))}
          </div>
        </div>
        <div style={CARD}>
          <p style={{ ...SECTION_LABEL, marginBottom: 16 }}>How we calculated this</p>
          <CalculationFlow inputs={inputs} results={results} />
        </div>
      </div>

      {/* Insights */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {insights.map((text, i) => (
          <div key={i} style={{ ...CARD, padding: "18px 20px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg, #e8c55a, #c9a227)", flexShrink: 0, marginTop: 7 }} />
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{text}</p>
          </div>
        ))}
      </div>

      {/* Assumptions & disclaimer */}
      <AssumptionsDisclaimer />

      {/* Download */}
      <div style={{ textAlign: "center", paddingTop: 8 }}>
        <button
          onClick={onDownload}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700,
            padding: "14px 32px", borderRadius: 9, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e",
            boxShadow: "0 6px 28px rgba(201,162,39,0.35), 0 0 0 1px rgba(168,207,240,0.2)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download Executive Business Case (PDF)
        </button>
        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.25)", marginTop: 12 }}>
          Estimates are illustrative, based on the assumptions you provided. Actual results depend on merchant mix and campaign performance.
        </p>
      </div>
    </div>
  );
}
