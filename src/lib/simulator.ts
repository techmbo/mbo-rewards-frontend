// Revenue Opportunity Simulator — types, configuration, and business logic.
//
// ALL business assumptions live in SIMULATOR_CONFIG below. The UI reads only
// from this object, so assumptions can be tuned — or replaced by a CMS /
// backend API returning the same shape — without touching any component.

export type BusinessType = "bank" | "fintech" | "wallet" | "superapp" | "nbfc" | "insurance";
export type Country = "US" | "GB" | "AE" | "IN";
export type CategoryId = "travel" | "fashion" | "electronics" | "food" | "finance" | "lifestyle";
export type ScenarioId = "conservative" | "expected" | "optimistic";

export interface BusinessTypeConfig {
  id: BusinessType;
  label: string;
  /** Default share of MAU expected to engage with merchant rewards. */
  defaultAdoptionRate: number;
}

export interface CountryConfig {
  id: Country;
  label: string;
  /** Multiplier applied to category base AOVs for this market. */
  aovFactor: number;
}

export interface CategoryConfig {
  id: CategoryId;
  label: string;
  /** Base average order value in USD. */
  baseAov: number;
  /** Typical affiliate commission rate for the category. */
  commissionRate: number;
}

/** Scenario factors applied to the user's assumptions — not an arbitrary ±%. */
export interface ScenarioConfig {
  id: ScenarioId;
  label: string;
  description: string;
  adoptionFactor: number;
  ordersFactor: number;
  commissionFactor: number;
}

export interface SimulatorConfig {
  businessTypes: BusinessTypeConfig[];
  countries: CountryConfig[];
  categories: CategoryConfig[];
  scenarios: ScenarioConfig[];
  /** Default orders per engaged reward user per month. */
  defaultOrdersPerUser: number;
  /** Fallbacks used when no categories are selected. */
  fallbackAov: number;
  fallbackCommissionRate: number;
  /** Month-by-month ramp toward steady state for the 12-month projection (12 values, last = 1). */
  growthCurve: number[];
  /** Estimated direct merchant/network integrations replaced per selected category. */
  integrationsPerCategory: number;
  integrationsMinimum: number;
  /** Typical time to production. */
  launchTime: string;
  /** Adoption multipliers used by the sensitivity comparison. */
  adoptionSensitivitySteps: number[];
}

export const SIMULATOR_CONFIG: SimulatorConfig = {
  businessTypes: [
    { id: "bank", label: "Bank", defaultAdoptionRate: 0.06 },
    { id: "fintech", label: "Fintech", defaultAdoptionRate: 0.1 },
    { id: "wallet", label: "Wallet", defaultAdoptionRate: 0.12 },
    { id: "superapp", label: "Super App", defaultAdoptionRate: 0.14 },
    { id: "nbfc", label: "NBFC", defaultAdoptionRate: 0.07 },
    { id: "insurance", label: "Insurance", defaultAdoptionRate: 0.04 },
  ],
  countries: [
    { id: "US", label: "United States", aovFactor: 1.4 },
    { id: "GB", label: "United Kingdom", aovFactor: 1.2 },
    { id: "AE", label: "UAE", aovFactor: 1.1 },
    { id: "IN", label: "India", aovFactor: 0.6 },
  ],
  categories: [
    { id: "travel", label: "Travel", baseAov: 260, commissionRate: 0.055 },
    { id: "fashion", label: "Fashion", baseAov: 85, commissionRate: 0.09 },
    { id: "electronics", label: "Electronics", baseAov: 210, commissionRate: 0.035 },
    { id: "food", label: "Food & Grocery", baseAov: 45, commissionRate: 0.06 },
    { id: "finance", label: "Financial Products", baseAov: 140, commissionRate: 0.12 },
    { id: "lifestyle", label: "Lifestyle & Services", baseAov: 70, commissionRate: 0.08 },
  ],
  scenarios: [
    {
      id: "conservative",
      label: "Conservative",
      description: "Lower adoption, softer order frequency, and below-benchmark commission rates.",
      adoptionFactor: 0.7,
      ordersFactor: 0.85,
      commissionFactor: 0.85,
    },
    {
      id: "expected",
      label: "Expected",
      description: "The assumptions you selected, applied as-is.",
      adoptionFactor: 1,
      ordersFactor: 1,
      commissionFactor: 1,
    },
    {
      id: "optimistic",
      label: "Optimistic",
      description: "Stronger adoption, higher engagement, and favourable commission mix.",
      adoptionFactor: 1.3,
      ordersFactor: 1.15,
      commissionFactor: 1.1,
    },
  ],
  defaultOrdersPerUser: 2,
  fallbackAov: 120,
  fallbackCommissionRate: 0.06,
  growthCurve: [0.15, 0.3, 0.45, 0.58, 0.68, 0.76, 0.83, 0.88, 0.92, 0.95, 0.98, 1],
  integrationsPerCategory: 3,
  integrationsMinimum: 4,
  launchTime: "2–3 days",
  adoptionSensitivitySteps: [0.5, 0.75, 1, 1.25, 1.5],
};

export interface SimulatorInputs {
  businessType: BusinessType;
  country: Country;
  mau: number;
  categories: CategoryId[];
  /** Relative revenue weight per selected category (any positive scale; normalised internally). */
  categoryWeights: Partial<Record<CategoryId, number>>;
  adoptionRate: number;
  ordersPerUser: number;
  aov: number;
  commissionRate: number;
}

export interface ScenarioResult {
  rewardUsers: number;
  monthlyOrders: number;
  monthlyGmv: number;
  monthlyCommission: number;
  annualCommission: number;
}

export interface SimulatorResults {
  conservative: ScenarioResult;
  expected: ScenarioResult;
  optimistic: ScenarioResult;
  integrationsReplaced: number;
}

/** Weighted blend of category AOV / commission using the user's merchant mix. */
export function blendCategories(
  categories: CategoryId[],
  weights: Partial<Record<CategoryId, number>>,
  country: Country,
  config: SimulatorConfig = SIMULATOR_CONFIG
): { aov: number; commissionRate: number } {
  const co = config.countries.find(c => c.id === country) ?? config.countries[0];
  const cats = config.categories.filter(c => categories.includes(c.id));
  if (!cats.length) {
    return { aov: Math.round(config.fallbackAov * co.aovFactor), commissionRate: config.fallbackCommissionRate };
  }
  const totalWeight = cats.reduce((s, c) => s + (weights[c.id] ?? 1), 0) || cats.length;
  const aov = cats.reduce((s, c) => s + c.baseAov * ((weights[c.id] ?? 1) / totalWeight), 0);
  const commissionRate = cats.reduce((s, c) => s + c.commissionRate * ((weights[c.id] ?? 1) / totalWeight), 0);
  return {
    aov: Math.round(Math.min(1000, Math.max(20, aov * co.aovFactor))),
    commissionRate: Math.round(commissionRate * 1000) / 1000,
  };
}

// Derive default assumptions from the guided selections using config values.
export function deriveDefaults(
  businessType: BusinessType,
  country: Country,
  categories: CategoryId[],
  categoryWeights: Partial<Record<CategoryId, number>> = {},
  config: SimulatorConfig = SIMULATOR_CONFIG
) {
  const bt = config.businessTypes.find(b => b.id === businessType) ?? config.businessTypes[0];
  const blend = blendCategories(categories, categoryWeights, country, config);
  return {
    adoptionRate: bt.defaultAdoptionRate,
    ordersPerUser: config.defaultOrdersPerUser,
    aov: blend.aov,
    commissionRate: blend.commissionRate,
  };
}

function calculateScenario(inputs: SimulatorInputs, s: ScenarioConfig): ScenarioResult {
  const adoption = Math.min(0.5, inputs.adoptionRate * s.adoptionFactor);
  const rewardUsers = Math.round(inputs.mau * adoption);
  const monthlyOrders = Math.round(rewardUsers * inputs.ordersPerUser * s.ordersFactor);
  const monthlyGmv = monthlyOrders * inputs.aov;
  const monthlyCommission = monthlyGmv * inputs.commissionRate * s.commissionFactor;
  return {
    rewardUsers,
    monthlyOrders,
    monthlyGmv,
    monthlyCommission,
    annualCommission: monthlyCommission * 12,
  };
}

export function calculate(inputs: SimulatorInputs, config: SimulatorConfig = SIMULATOR_CONFIG): SimulatorResults {
  const byId = (id: ScenarioId) => {
    const s = config.scenarios.find(x => x.id === id);
    if (!s) throw new Error(`Scenario config missing: ${id}`);
    return calculateScenario(inputs, s);
  };
  return {
    conservative: byId("conservative"),
    expected: byId("expected"),
    optimistic: byId("optimistic"),
    integrationsReplaced: Math.max(config.integrationsMinimum, inputs.categories.length * config.integrationsPerCategory),
  };
}

/** Annual expected-scenario revenue at different adoption rates, for sensitivity comparison. */
export interface SensitivityPoint {
  adoptionRate: number;
  annualCommission: number;
  isCurrent: boolean;
}

export function adoptionSensitivity(inputs: SimulatorInputs, config: SimulatorConfig = SIMULATOR_CONFIG): SensitivityPoint[] {
  return config.adoptionSensitivitySteps.map(factor => {
    const adoptionRate = Math.min(0.3, Math.max(0.01, Math.round(inputs.adoptionRate * factor * 100) / 100));
    const r = calculate({ ...inputs, adoptionRate }, config);
    return { adoptionRate, annualCommission: r.expected.annualCommission, isCurrent: factor === 1 };
  });
}

export function monthlyProjection(steadyStateMonthly: number, config: SimulatorConfig = SIMULATOR_CONFIG): number[] {
  return config.growthCurve.map(r => steadyStateMonthly * r);
}

export function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 10_000) return `$${Math.round(value / 1000)}K`;
  if (value >= 1_000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${Math.round(value)}`;
}

export function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1000)}K`;
  return `${Math.round(value)}`;
}

export function businessTypeLabel(id: BusinessType, config: SimulatorConfig = SIMULATOR_CONFIG): string {
  return config.businessTypes.find(b => b.id === id)?.label ?? id;
}

export function countryLabel(id: Country, config: SimulatorConfig = SIMULATOR_CONFIG): string {
  return config.countries.find(c => c.id === id)?.label ?? id;
}

export function categoryLabels(ids: CategoryId[], config: SimulatorConfig = SIMULATOR_CONFIG): string[] {
  return config.categories.filter(c => ids.includes(c.id)).map(c => c.label);
}

export function annualRange(r: SimulatorResults): string {
  return `${formatUsd(r.conservative.annualCommission)} – ${formatUsd(r.optimistic.annualCommission)}`;
}

// Step-by-step calculation trail for the "How We Calculated This" section.
export interface CalcStep {
  label: string;
  value: string;
  operation?: string;
}

export function calculationSteps(inputs: SimulatorInputs, r: SimulatorResults): CalcStep[] {
  const e = r.expected;
  return [
    { label: "Monthly Active Users", value: formatCount(inputs.mau) },
    { label: "Reward Adoption Rate", value: `${Math.round(inputs.adoptionRate * 100)}%`, operation: "×" },
    { label: "Reward Users", value: formatCount(e.rewardUsers), operation: "=" },
    { label: "Orders per Reward User / mo", value: `${inputs.ordersPerUser}`, operation: "×" },
    { label: "Monthly Orders", value: formatCount(e.monthlyOrders), operation: "=" },
    { label: "Average Order Value (weighted by merchant mix)", value: `$${inputs.aov}`, operation: "×" },
    { label: "Gross Merchandise Value (GMV) / mo", value: formatUsd(e.monthlyGmv), operation: "=" },
    { label: "Affiliate Commission Rate (weighted by merchant mix)", value: `${(inputs.commissionRate * 100).toFixed(1)}%`, operation: "×" },
    { label: "Monthly Commission Revenue", value: formatUsd(e.monthlyCommission), operation: "=" },
    { label: "Months", value: "12", operation: "×" },
    { label: "Expected Annual Commission Revenue", value: formatUsd(e.annualCommission), operation: "=" },
    { label: "Conservative ↔ Optimistic scenarios", value: annualRange(r), operation: "≈" },
  ];
}

// Executive assessment for decision-makers.
export interface ExecutiveAssessment {
  revenueOpportunity: { value: string; note: string };
  businessFit: { value: string; note: string };
  complexity: { value: string; note: string };
  nextStep: { value: string; note: string };
}

export function generateAssessment(inputs: SimulatorInputs, r: SimulatorResults, config: SimulatorConfig = SIMULATOR_CONFIG): ExecutiveAssessment {
  const annual = r.expected.annualCommission;
  const fit =
    annual >= 1_000_000 && inputs.adoptionRate >= 0.08
      ? { value: "Strong", note: "Large engaged user base with revenue potential well above the integration effort." }
      : annual >= 250_000
        ? { value: "Good", note: "Meaningful revenue potential relative to a single lightweight integration." }
        : { value: "Emerging", note: "A sound foundation — revenue scales directly with user growth and adoption." };
  const nextStep =
    annual >= 1_000_000
      ? { value: "Scoping call", note: "Schedule a 30-minute scoping call to validate assumptions against live campaign data." }
      : annual >= 100_000
        ? { value: "Business case", note: "Request a personalised business case validated against your market's campaign mix." }
        : { value: "Sandbox access", note: "Start with sandbox API credentials and evaluate hands-on." };
  return {
    revenueOpportunity: { value: annualRange(r), note: `Expected midpoint ${formatUsd(annual)} per year in affiliate commission.` },
    businessFit: fit,
    complexity: { value: "Low", note: `One unified API. Typical time to production is ${config.launchTime}.` },
    nextStep,
  };
}

export function generateInsights(inputs: SimulatorInputs, r: SimulatorResults, config: SimulatorConfig = SIMULATOR_CONFIG): string[] {
  const insights: string[] = [];
  const range = annualRange(r);
  const annual = r.expected.annualCommission;
  if (annual >= 1_000_000) {
    insights.push(`Estimated annual affiliate commission of ${range} across scenarios — a material new revenue line for the business.`);
  } else if (annual >= 100_000) {
    insights.push(`Estimated ${range} in annual affiliate commission across scenarios, with no upfront investment.`);
  } else {
    insights.push(`Even in the conservative scenario, affiliate commerce adds an estimated ${formatUsd(r.conservative.annualCommission)} per year with zero setup cost.`);
  }
  if (inputs.adoptionRate >= 0.1) {
    insights.push(`A ${Math.round(inputs.adoptionRate * 100)}% reward adoption rate is strong — merchant offers surfaced at the point of spend typically sustain this level of engagement.`);
  } else {
    insights.push(`Reward adoption is modelled conservatively at ${Math.round(inputs.adoptionRate * 100)}%. Platforms that surface merchant offers contextually often see higher participation.`);
  }
  insights.push(`One MBO Rewards integration replaces an estimated ${r.integrationsReplaced}+ direct merchant and network integrations.`);
  insights.push(`Integration typically completes in ${config.launchTime} — from sandbox credentials to production.`);
  return insights;
}

// Professional executive summary — suitable for pasting into an internal
// business proposal. Scope: affiliate commission revenue, merchant rewards,
// optional gift cards, single API, fast implementation. Nothing else.
export function generateExecutiveSummary(inputs: SimulatorInputs, r: SimulatorResults, config: SimulatorConfig = SIMULATOR_CONFIG): string[] {
  const bt = businessTypeLabel(inputs.businessType, config);
  const co = countryLabel(inputs.country, config);
  const cats = categoryLabels(inputs.categories, config);
  const catText = cats.length ? cats.join(", ") : "a broad merchant mix";
  const e = r.expected;
  return [
    `Based on the selected assumptions, a ${bt.toLowerCase()} platform in ${co} with ${formatCount(inputs.mau)} monthly active users has the potential to generate approximately ${annualRange(r)} in annual affiliate commission revenue by integrating MBO Rewards, with an expected-scenario estimate of ${formatUsd(e.annualCommission)}.`,
    `With approximately ${formatCount(e.rewardUsers)} active reward users each month generating an estimated ${formatCount(e.monthlyOrders)} orders across ${catText}, the platform would drive ${formatUsd(e.monthlyGmv)} in monthly gross merchandise value. At a blended affiliate commission rate of ${(inputs.commissionRate * 100).toFixed(1)}% — weighted by the selected merchant mix — this represents an estimated ${formatUsd(e.monthlyCommission)} in monthly commission revenue.`,
    `This creates a new recurring revenue stream through affiliate commerce while providing customers access to merchant shopping rewards — delivered through a single API integration. Gift card capability is additionally available on request.`,
    `A single MBO Rewards integration replaces an estimated ${r.integrationsReplaced}+ separate merchant and network integrations, with typical time to production of ${config.launchTime}. Commission is earned only on confirmed conversions, requiring no upfront investment.`,
  ];
}
