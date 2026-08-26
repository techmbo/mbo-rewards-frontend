"use client";
import { useMemo, useState } from "react";
import {
  SIMULATOR_CONFIG,
  BusinessType,
  Country,
  CategoryId,
  SimulatorInputs,
  deriveDefaults,
  calculate,
  formatUsd,
  formatCount,
} from "@/lib/simulator";
import { useAnimatedNumber } from "./useAnimatedNumber";
import Dashboard from "./Dashboard";
import PrintReport, { LeadInfo } from "./PrintReport";

const { businessTypes, countries, categories: categoryConfig } = SIMULATOR_CONFIG;

const MAU_STEPS = [10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000];

const PANEL: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(168,207,240,0.14)",
  background: "rgba(13,27,62,0.55)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 12px 48px rgba(6,13,31,0.5), inset 0 1px 0 rgba(168,207,240,0.08)",
};

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "rgba(168,207,240,0.65)",
  letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 12,
};

const INPUT: React.CSSProperties = {
  width: "100%", padding: "13px 15px", borderRadius: 9, boxSizing: "border-box",
  border: "1px solid rgba(168,207,240,0.2)", background: "rgba(6,13,31,0.6)",
  color: "#ffffff", fontSize: 14, fontFamily: "var(--font-inter)", outline: "none",
};

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 18px", borderRadius: 9, cursor: "pointer",
        fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 600,
        border: active ? "1px solid rgba(201,162,39,0.6)" : "1px solid rgba(168,207,240,0.15)",
        background: active ? "linear-gradient(135deg, rgba(232,197,90,0.18), rgba(201,162,39,0.1))" : "rgba(255,255,255,0.03)",
        color: active ? "#e8c55a" : "rgba(255,255,255,0.55)",
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}

function Slider({ label, valueLabel, min, max, step, value, onChange }: {
  label: string; valueLabel: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700, color: "#a8cff0" }}>{valueLabel}</span>
      </div>
      <input
        type="range" className="sim-range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} aria-label={label}
      />
    </div>
  );
}

// Lead capture shown before the business case PDF is generated.
function LeadCaptureModal({ onSubmit, onClose, submitting }: {
  onSubmit: (lead: LeadInfo) => void; onClose: () => void; submitting: boolean;
}) {
  const [form, setForm] = useState<LeadInfo>({ name: "", company: "", email: "", jobtitle: "" });
  const valid = form.name.trim() && form.company.trim() && /.+@.+\..+/.test(form.email);
  return (
    <div
      role="dialog" aria-modal="true" aria-label="Download your business case"
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(6,13,31,0.8)", backdropFilter: "blur(6px)", padding: 20 }}
      onClick={onClose}
    >
      <div style={{ ...PANEL, background: "rgba(13,27,62,0.95)", maxWidth: 440, width: "100%", padding: "36px 36px" }} onClick={e => e.stopPropagation()}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#c9a227", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Executive Business Case</p>
        <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: 21, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 8 }}>
          Where should we address your business case?
        </h3>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: 24 }}>
          Your branded PDF will be prepared with your details and generated immediately.
        </p>
        <form
          onSubmit={e => { e.preventDefault(); if (valid && !submitting) onSubmit(form); }}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input style={INPUT} placeholder="Your name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input style={INPUT} placeholder="Company *" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          <input style={INPUT} type="email" placeholder="Work email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <input style={INPUT} placeholder="Job title (optional)" value={form.jobtitle} onChange={e => setForm(f => ({ ...f, jobtitle: e.target.value }))} />
          <button
            type="submit"
            disabled={!valid || submitting}
            style={{
              marginTop: 6, padding: "14px 0", borderRadius: 9, border: "none",
              fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700,
              background: valid && !submitting ? "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)" : "rgba(255,255,255,0.08)",
              color: valid && !submitting ? "#0d1b3e" : "rgba(255,255,255,0.3)",
              cursor: valid && !submitting ? "pointer" : "default",
              boxShadow: valid && !submitting ? "0 4px 20px rgba(201,162,39,0.3)" : "none",
            }}
          >
            {submitting ? "Preparing your business case…" : "Generate & Download PDF"}
          </button>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12.5, cursor: "pointer", padding: "4px 0" }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

// Relative weight sliders per selected category — drives the blended
// AOV / commission assumptions.
function MerchantMix({ categories, weights, onChange }: {
  categories: CategoryId[];
  weights: Partial<Record<CategoryId, number>>;
  onChange: (id: CategoryId, weight: number) => void;
}) {
  const selected = categoryConfig.filter(c => categories.includes(c.id));
  if (selected.length < 2) return null;
  const total = selected.reduce((s, c) => s + (weights[c.id] ?? 1), 0);
  return (
    <div>
      <span style={LABEL}>Merchant mix — share of expected order volume</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px 28px" }}>
        {selected.map(c => {
          const w = weights[c.id] ?? 1;
          const share = Math.round((w / total) * 100);
          return (
            <Slider
              key={c.id}
              label={c.label}
              valueLabel={`${share}%`}
              min={1} max={10} step={1}
              value={Math.round(w * 2)}
              onChange={v => onChange(c.id, v / 2)}
            />
          );
        })}
      </div>
      <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", marginTop: 14, lineHeight: 1.6 }}>
        Weighting adjusts the blended average order value and commission rate used in the projection.
      </p>
    </div>
  );
}

export default function RevenueSimulator({ variant = "full" }: { variant?: "full" | "embed" }) {
  const [businessType, setBusinessType] = useState<BusinessType | null>(variant === "embed" ? "fintech" : null);
  const [country, setCountry] = useState<Country | null>(variant === "embed" ? "IN" : null);
  const [mauIndex, setMauIndex] = useState(5); // 500K default
  const [categories, setCategories] = useState<CategoryId[]>(variant === "embed" ? ["travel", "fashion", "electronics"] : []);
  const [weights, setWeights] = useState<Partial<Record<CategoryId, number>>>({});
  const [step, setStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [overrides, setOverrides] = useState<Partial<Pick<SimulatorInputs, "adoptionRate" | "ordersPerUser" | "aov" | "commissionRate">>>({});
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [lead, setLead] = useState<LeadInfo | null>(null);

  const mau = MAU_STEPS[mauIndex];
  const defaults = useMemo(
    () => deriveDefaults(businessType ?? "fintech", country ?? "IN", categories, weights),
    [businessType, country, categories, weights]
  );
  const inputs: SimulatorInputs = useMemo(() => ({
    businessType: businessType ?? "fintech",
    country: country ?? "IN",
    mau,
    categories,
    categoryWeights: weights,
    adoptionRate: overrides.adoptionRate ?? defaults.adoptionRate,
    ordersPerUser: overrides.ordersPerUser ?? defaults.ordersPerUser,
    aov: overrides.aov ?? defaults.aov,
    commissionRate: overrides.commissionRate ?? defaults.commissionRate,
  }), [businessType, country, mau, categories, weights, defaults, overrides]);

  const results = useMemo(() => calculate(inputs), [inputs]);
  const animatedLow = useAnimatedNumber(results.conservative.annualCommission);
  const animatedHigh = useAnimatedNumber(results.optimistic.annualCommission);

  const toggleCategory = (id: CategoryId) =>
    setCategories(prev => (prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]));

  const setWeight = (id: CategoryId, weight: number) =>
    setWeights(prev => ({ ...prev, [id]: weight }));

  const printReport = () => {
    document.body.classList.add("sim-printing");
    const cleanup = () => {
      document.body.classList.remove("sim-printing");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  };

  const handleLeadSubmit = async (leadInfo: LeadInfo) => {
    setSubmittingLead(true);
    try {
      await fetch("/api/simulator-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadInfo,
          profile: {
            businessType: inputs.businessType,
            country: inputs.country,
            mau: inputs.mau,
            categories: inputs.categories,
            categoryWeights: inputs.categoryWeights,
            adoptionRate: inputs.adoptionRate,
            ordersPerUser: inputs.ordersPerUser,
            aov: inputs.aov,
            commissionRate: inputs.commissionRate,
          },
          estimates: {
            annualConservative: Math.round(results.conservative.annualCommission),
            annualExpected: Math.round(results.expected.annualCommission),
            annualOptimistic: Math.round(results.optimistic.annualCommission),
            monthlyCommission: Math.round(results.expected.monthlyCommission),
            monthlyGmv: Math.round(results.expected.monthlyGmv),
          },
        }),
      });
    } catch {
      // Lead logging must never block the download.
    }
    setLead(leadInfo);
    setSubmittingLead(false);
    setShowLeadForm(false);
    // Let the modal unmount before opening the print dialog.
    setTimeout(printReport, 150);
  };

  /* ---------- Embed variant ---------- */
  if (variant === "embed") {
    return (
      <div style={{ ...PANEL, padding: "36px 36px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 44, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div>
            <span style={LABEL}>Business type</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {businessTypes.map(b => (
                <Pill key={b.id} active={businessType === b.id} onClick={() => setBusinessType(b.id)}>{b.label}</Pill>
              ))}
            </div>
          </div>
          <div>
            <span style={LABEL}>Market</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {countries.map(c => (
                <Pill key={c.id} active={country === c.id} onClick={() => setCountry(c.id)}>{c.label}</Pill>
              ))}
            </div>
          </div>
          <Slider
            label="Monthly active users" valueLabel={formatCount(mau)}
            min={0} max={MAU_STEPS.length - 1} step={1} value={mauIndex} onChange={setMauIndex}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(168,207,240,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Estimated annual commission revenue</p>
          <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(34px, 4vw, 48px)", fontWeight: 800, color: "#e8c55a", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 8 }}>
            {formatUsd(animatedLow)} – {formatUsd(animatedHigh)}
          </p>
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>
            {formatCount(results.expected.rewardUsers)} reward users · {formatUsd(results.expected.monthlyGmv)} monthly GMV · conservative → optimistic
          </p>
          <a
            href="/revenue-simulator"
            style={{
              display: "inline-flex", fontFamily: "var(--font-jakarta)", fontSize: 13.5, fontWeight: 700,
              padding: "13px 28px", borderRadius: 9, textDecoration: "none",
              background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e",
              boxShadow: "0 6px 28px rgba(201,162,39,0.35)",
            }}
          >
            Build Your Full Business Case →
          </a>
        </div>
      </div>
    );
  }

  /* ---------- Full variant: guided steps → dashboard ---------- */
  const steps = [
    { title: "What kind of platform are you?", valid: businessType !== null },
    { title: "Which market do you operate in?", valid: country !== null },
    { title: "How many monthly active users?", valid: true },
    { title: "Which merchant categories fit your users?", valid: categories.length > 0 },
  ];
  const onResults = step >= steps.length;

  return (
    <div>
      {showLeadForm && (
        <LeadCaptureModal onSubmit={handleLeadSubmit} onClose={() => setShowLeadForm(false)} submitting={submittingLead} />
      )}
      {!onResults ? (
        <div style={{ ...PANEL, maxWidth: 720, margin: "0 auto", padding: "44px 48px" }}>
          {/* Progress */}
          <div style={{ display: "flex", gap: 8, marginBottom: 36 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? "linear-gradient(90deg, #e8c55a, #c9a227)" : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
            ))}
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#c9a227", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            Step {step + 1} of {steps.length}
          </p>
          <h3 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(20px, 2.2vw, 26px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 30 }}>
            {steps[step].title}
          </h3>

          {step === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {businessTypes.map(b => (
                <Pill key={b.id} active={businessType === b.id} onClick={() => setBusinessType(b.id)}>{b.label}</Pill>
              ))}
            </div>
          )}
          {step === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {countries.map(c => (
                <Pill key={c.id} active={country === c.id} onClick={() => setCountry(c.id)}>{c.label}</Pill>
              ))}
            </div>
          )}
          {step === 2 && (
            <div>
              <p style={{ fontFamily: "var(--font-jakarta)", fontSize: 44, fontWeight: 800, color: "#a8cff0", textAlign: "center", marginBottom: 24, letterSpacing: "-0.02em" }}>
                {formatCount(mau)}
              </p>
              <input
                type="range" className="sim-range" min={0} max={MAU_STEPS.length - 1} step={1}
                value={mauIndex} onChange={e => setMauIndex(Number(e.target.value))} aria-label="Monthly active users"
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>10K</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>10M</span>
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {categoryConfig.map(c => (
                <Pill key={c.id} active={categories.includes(c.id)} onClick={() => toggleCategory(c.id)}>
                  {c.label}
                </Pill>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{ fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 600, padding: "12px 24px", borderRadius: 8, border: "1px solid rgba(168,207,240,0.2)", background: "transparent", color: step === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)", cursor: step === 0 ? "default" : "pointer" }}
            >
              ← Back
            </button>
            <button
              onClick={() => steps[step].valid && setStep(s => s + 1)}
              style={{
                fontFamily: "var(--font-jakarta)", fontSize: 13.5, fontWeight: 700, padding: "12px 32px", borderRadius: 8, border: "none",
                background: steps[step].valid ? "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)" : "rgba(255,255,255,0.06)",
                color: steps[step].valid ? "#0d1b3e" : "rgba(255,255,255,0.25)",
                cursor: steps[step].valid ? "pointer" : "default",
                boxShadow: steps[step].valid ? "0 4px 20px rgba(201,162,39,0.3)" : "none",
                transition: "all 0.2s",
              }}
            >
              {step === steps.length - 1 ? "See My Revenue Opportunity →" : "Continue →"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Profile bar + advanced toggle */}
          <div style={{ ...PANEL, padding: "18px 26px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              <span style={{ color: "#e8c55a", fontWeight: 700 }}>{businessTypes.find(b => b.id === inputs.businessType)?.label}</span>
              {" · "}{countries.find(c => c.id === inputs.country)?.label}
              {" · "}{formatCount(mau)} MAU
              {" · "}{categories.length} categories
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ fontFamily: "var(--font-jakarta)", fontSize: 12.5, fontWeight: 600, padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(168,207,240,0.2)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
                Edit profile
              </button>
              <button onClick={() => setShowAdvanced(v => !v)} style={{ fontFamily: "var(--font-jakarta)", fontSize: 12.5, fontWeight: 600, padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(201,162,39,0.35)", background: showAdvanced ? "rgba(201,162,39,0.12)" : "transparent", color: "#e8c55a", cursor: "pointer" }}>
                {showAdvanced ? "Hide" : "Adjust"} assumptions
              </button>
            </div>
          </div>

          {showAdvanced && (
            <div style={{ ...PANEL, padding: "28px 30px", marginBottom: 20, display: "flex", flexDirection: "column", gap: 30 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 28 }}>
                <Slider label="Reward adoption rate" valueLabel={`${Math.round(inputs.adoptionRate * 100)}%`}
                  min={1} max={30} step={1} value={Math.round(inputs.adoptionRate * 100)}
                  onChange={v => setOverrides(o => ({ ...o, adoptionRate: v / 100 }))} />
                <Slider label="Orders per reward user / mo" valueLabel={`${inputs.ordersPerUser}`}
                  min={1} max={5} step={1} value={inputs.ordersPerUser}
                  onChange={v => setOverrides(o => ({ ...o, ordersPerUser: v }))} />
                <Slider label="Average order value" valueLabel={`$${inputs.aov}`}
                  min={20} max={1000} step={5} value={inputs.aov}
                  onChange={v => setOverrides(o => ({ ...o, aov: v }))} />
                <Slider label="Affiliate commission" valueLabel={`${(inputs.commissionRate * 100).toFixed(1)}%`}
                  min={10} max={150} step={5} value={Math.round(inputs.commissionRate * 1000)}
                  onChange={v => setOverrides(o => ({ ...o, commissionRate: v / 1000 }))} />
              </div>
              <MerchantMix categories={categories} weights={weights} onChange={setWeight} />
            </div>
          )}

          <Dashboard inputs={inputs} results={results} onDownload={() => setShowLeadForm(true)} />
          <PrintReport inputs={inputs} results={results} lead={lead} />
        </div>
      )}
    </div>
  );
}
