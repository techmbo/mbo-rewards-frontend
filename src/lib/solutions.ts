// Per-vertical solution pages — content config for /solutions/[slug].
// Add a vertical here and it gets a full landing page, sitemap entry, and
// nav item. All copy targets enterprise decision-makers and claims only
// what the platform currently provides.

export interface Solution {
  slug: string;
  navLabel: string;
  /** Short one-liner for the navigation mega menu. */
  navDescription: string;
  name: string;
  icon: string;
  headline: string;
  subheadline: string;
  /** Industry challenges — the problems this vertical actually has. */
  challenges: { title: string; body: string }[];
  /** How MBO Rewards solves them. */
  points: { title: string; body: string }[];
  /** Concrete usage scenarios for this vertical. */
  useCases: { title: string; body: string }[];
  /** One-sentence architecture note rendered above the shared architecture section. */
  architectureNote: string;
  outcome: string;
  faqs: { q: string; a: string }[];
}

export const SOLUTIONS: Solution[] = [
  {
    slug: "banks",
    navLabel: "Banks",
    navDescription: "Embedded rewards inside authenticated banking apps.",
    name: "Banks",
    icon: "bank",
    headline: "Embedded rewards inside the banking app your customers already trust.",
    subheadline: "Turn everyday spend into engagement and a new commission revenue line — without building affiliate infrastructure in-house.",
    challenges: [
      { title: "Engagement is transactional", body: "Customers open the banking app to check a balance or make a payment, then leave. There is no reason to return between transactions, and every fintech competitor is trying to become that reason." },
      { title: "Browser-based tracking fails in-app", body: "Cookie and pixel-based affiliate tools were built for the open web. Inside an authenticated mobile banking session they cannot attribute purchases — which is why most banks have no affiliate revenue at all." },
      { title: "Compliance blocks third-party tools", body: "Any vendor that wants customer names, emails, or device identifiers will not pass a bank's security review. Most rewards vendors are built exactly that way." },
    ],
    points: [
      { title: "Works in authenticated environments", body: "Server-side tracking with zero cookies means attribution works inside logged-in mobile banking sessions, where browser-based tools fail." },
      { title: "Zero PII leaves the bank", body: "User identity is an opaque token you generate. No names, emails, or device identifiers ever enter MBO Rewards systems." },
      { title: "Compliance-first architecture", body: "Designed for regulated financial institutions from day one — built to pass a bank-grade security review without exceptions." },
    ],
    useCases: [
      { title: "Rewards tab in the mobile app", body: "A white-label offers section inside the banking app, populated by the unified campaign catalog and ranked server-side for your customer base." },
      { title: "Card-linked engagement", body: "Surface relevant merchant offers alongside card spend categories, giving debit and credit customers a reason to route spend through your cards." },
      { title: "Commission as a new P&L line", body: "Every confirmed purchase generates affiliate commission, reported per campaign with monthly statements your finance team can reconcile." },
    ],
    architectureNote: "MBO Rewards sits behind your existing mobile and internet banking stack — your app calls one REST API; no SDK, no client-side scripts, no third-party code in your app.",
    outcome: "Higher engagement in the banking app, and affiliate commission on every confirmed purchase.",
    faqs: [
      { q: "Does MBO Rewards store any customer PII?", a: "No. The bank generates an opaque user token; MBO Rewards cannot reverse-map it. No names, emails, phone numbers, or device identifiers enter MBO Rewards systems." },
      { q: "How does attribution work inside a mobile banking app?", a: "Attribution is fully server-side. A unique tracking token is generated when a customer taps an offer and passed server-to-server through the purchase flow — no cookies or client-side scripts, so it works in authenticated sessions." },
      { q: "How long does a bank integration take?", a: "The API integration itself typically takes 2–3 days. Bank procurement and security review timelines vary, and the zero-PII architecture is designed to make that review straightforward." },
      { q: "What does it cost the bank?", a: "There are no setup fees, monthly charges, or per-call API fees. MBO Rewards earns a share of the affiliate commission generated through the integration — agreed at onboarding." },
    ],
  },
  {
    slug: "fintech",
    navLabel: "Fintech",
    navDescription: "Monetise the point of spend with affiliate commerce.",
    name: "Fintech Platforms",
    icon: "smartphone",
    headline: "Monetise the point of spend with affiliate commerce.",
    subheadline: "Your users already make purchase decisions inside your app. One API adds merchant offers and commission revenue to that moment.",
    challenges: [
      { title: "Interchange and subscriptions aren't enough", body: "Payment margins are thin and subscription fatigue is real. Fintechs need revenue lines that grow with engagement rather than pricing pressure." },
      { title: "Building affiliate infrastructure is a distraction", body: "Direct merchant deals, network contracts, tracking, and reconciliation is a multi-quarter engineering project that has nothing to do with your core product." },
      { title: "Generic offer walls underperform", body: "Un-ranked, un-curated coupon feeds convert poorly and cheapen the product experience your team has worked hard to build." },
    ],
    points: [
      { title: "Revenue without new products", body: "No lending book, no card programme, no float. Affiliate commission is earned on purchases your users already make." },
      { title: "One integration, every network", body: "A single REST API replaces separate contracts and integrations with every affiliate network and merchant." },
      { title: "Live in days", body: "Sandbox credentials to production in 2–3 days, with schema-identical environments and a dedicated integration engineer." },
    ],
    useCases: [
      { title: "Offers at the point of spend", body: "Surface contextual merchant campaigns where users already make spending decisions — before checkout, after a transaction, or in a dedicated rewards surface." },
      { title: "White-label rewards experience", body: "Your brand and UX end to end. MBO Rewards supplies the campaign catalog, tracking, and commission engine invisibly behind it." },
      { title: "Webhook-driven engagement", body: "Conversion-confirmed webhooks let your product trigger notifications or in-app moments the instant a purchase is confirmed." },
    ],
    architectureNote: "One REST API call returns ranked campaigns with tracking identifiers; conversions come back as webhooks — your team never touches an affiliate network directly.",
    outcome: "A recurring, performance-based revenue stream with zero upfront investment.",
    faqs: [
      { q: "How quickly can a fintech go live?", a: "Most integrations complete in 2–3 days. The sandbox environment is schema-identical to production, so what you test is what you ship." },
      { q: "Do we need contracts with affiliate networks?", a: "No. MBO Rewards aggregates campaigns from every major network under a single agreement — one contract, one integration, one commission statement." },
      { q: "How is the revenue share structured?", a: "There are no setup or monthly fees. MBO Rewards takes a share of confirmed affiliate commission, agreed at onboarding. If your users don't buy, neither side earns." },
      { q: "Can we control which merchants and categories appear?", a: "Yes. Campaigns are normalised with standardised category, rate, and terms fields, so your team controls the mix your users see." },
    ],
  },
  {
    slug: "wallets",
    navLabel: "Wallets",
    navDescription: "Merchant offers where balances and payments live.",
    name: "Wallets",
    icon: "wallet",
    headline: "Merchant offers where balances and payments already live.",
    subheadline: "Wallet users check balances and pay daily. Embedded merchant rewards give them a reason to spend through you — and you a share of every purchase.",
    challenges: [
      { title: "High frequency, low margin", body: "Wallets win on daily active usage but monetise a sliver of it. MDR compression means transaction volume alone no longer pays for growth." },
      { title: "Users leave to shop", body: "The purchase intent is formed in your wallet, but the transaction — and all its economics — happens somewhere else." },
      { title: "Rewards budgets burn cash", body: "Cashback funded from your own margin buys engagement at a loss. Sustainable rewards need an external funding source." },
    ],
    points: [
      { title: "Offers at the moment of payment", body: "Surface relevant merchant campaigns contextually, right where spending decisions happen." },
      { title: "White-label by design", body: "Your brand, your UX. MBO Rewards operates invisibly behind your wallet experience." },
      { title: "Real-time tracking", body: "Clicks, conversions, GMV, and commission tracked server-side and reported in real time." },
    ],
    useCases: [
      { title: "Offers feed in the wallet home", body: "Ranked merchant campaigns rendered natively in your wallet UI, refreshed automatically from the unified catalog." },
      { title: "Post-payment offer moments", body: "After a successful payment, show a relevant merchant offer — the highest-intent moment in the wallet journey." },
      { title: "Commission-funded user rewards", body: "Fund user-facing rewards from affiliate commission earned on tracked purchases instead of your own margin." },
    ],
    architectureNote: "The wallet renders campaigns returned by one API; every click carries a server-generated tracking token, and confirmed conversions post back as webhooks with commission amounts.",
    outcome: "Higher wallet engagement and affiliate commission on tracked spend.",
    faqs: [
      { q: "Does this require changes to our payment flows?", a: "No. Merchant offers are a separate content and tracking layer — your payment rails and licences are untouched." },
      { q: "Can rewards be funded from commission?", a: "Yes. Affiliate commission earned on tracked purchases can offset or fully fund the user-facing rewards you choose to issue. How you pass value to users is your product decision." },
      { q: "How fresh is the campaign catalog?", a: "Campaigns are synchronised automatically from source networks, normalised, and deduplicated — expired offers are removed without manual curation." },
      { q: "What analytics do we get?", a: "Real-time clicks, conversions, GMV, and commission per campaign, available in the dashboard, as API responses, and as CSV export with monthly statements." },
    ],
  },
  {
    slug: "super-apps",
    navLabel: "Super Apps",
    navDescription: "One commerce layer across every mini-app.",
    name: "Super Apps",
    icon: "grid",
    headline: "A commerce layer across every mini-app and surface.",
    subheadline: "One API powers merchant offers across all your verticals — travel, food, shopping, payments — with unified tracking and one commission statement.",
    challenges: [
      { title: "Every surface builds its own commerce", body: "Travel, food, and shopping teams each negotiate merchant deals and build tracking separately — duplicated effort, inconsistent data, fragmented economics." },
      { title: "Cross-surface attribution is broken", body: "When each mini-app tracks independently, the platform cannot see one user's commerce journey or consolidate its commission position." },
      { title: "Merchant coverage is uneven", body: "Some surfaces have strong offer inventory, others none — because supply depends on which team did the business development." },
    ],
    points: [
      { title: "One catalog, every surface", body: "A unified, deduplicated campaign catalog serves every mini-app from a single integration." },
      { title: "Category-aware ranking", body: "Campaigns are ranked server-side by conversion likelihood for each surface and audience." },
      { title: "Unified reporting", body: "One dashboard and one monthly statement across all surfaces, with per-campaign breakdown." },
    ],
    useCases: [
      { title: "Vertical-specific offer feeds", body: "Travel offers in the travel mini-app, dining offers in food delivery — one API filtered by category, ranked per surface." },
      { title: "Platform-wide rewards surface", body: "A single destination aggregating the best campaigns across all categories, powered by the same integration." },
      { title: "Consolidated commission reporting", body: "Finance sees one statement across all surfaces with per-campaign and per-surface breakdown, instead of reconciling per team." },
    ],
    architectureNote: "Each surface calls the same API with a category filter; tracking tokens and webhooks are shared platform-wide, so attribution and commission consolidate automatically.",
    outcome: "Affiliate revenue from every vertical, without per-vertical integrations.",
    faqs: [
      { q: "Can different mini-apps show different campaigns?", a: "Yes. The API supports category and context filtering per request, and ranking is computed per surface — travel surfaces see travel campaigns ranked for travel intent." },
      { q: "Is it one integration or one per mini-app?", a: "One platform-level integration. Individual surfaces consume the same API with different parameters, sharing tracking and reporting." },
      { q: "How is commission split across surfaces?", a: "Every conversion carries its originating surface context, so reporting breaks down commission per surface, per campaign, and per period from one statement." },
      { q: "Does MBO Rewards appear anywhere in our UX?", a: "No. The platform is fully white-label — your surfaces render campaign data in your own components." },
    ],
  },
  {
    slug: "insurance",
    navLabel: "Insurance",
    navDescription: "Engagement between renewal cycles.",
    name: "Insurance Platforms",
    icon: "umbrella",
    headline: "Engagement between renewal cycles — without building a new product.",
    subheadline: "Policy apps get opened a few times a year. Embedded merchant rewards give customers a reason to return, and you a revenue line between renewals.",
    challenges: [
      { title: "The app is a renewal-time destination", body: "Customers interact at purchase, claim, and renewal. Between those moments the app is dormant — and dormant apps lose the renewal when a cheaper quote appears." },
      { title: "New engagement products carry regulatory weight", body: "Launching anything underwritten or financial to drive engagement means product approvals, capital, and risk review." },
      { title: "No monetisation between premiums", body: "Premium revenue arrives once a year per policy. There is no incremental revenue from the customer relationship in between." },
    ],
    points: [
      { title: "A daily-use reason to open the app", body: "Merchant offers and rewards turn a renewal-time app into a regular destination." },
      { title: "No underwriting, no risk", body: "Affiliate commission requires no new regulated product — it is earned on confirmed retail purchases." },
      { title: "Fast, lightweight integration", body: "A single REST API integration, typically live in 2–3 days." },
    ],
    useCases: [
      { title: "Member rewards section", body: "A white-label offers area inside the policy app, giving customers ongoing value beyond the policy itself." },
      { title: "Engagement before renewal", body: "Customers who open the app monthly for rewards are customers you can reach when renewal season arrives." },
      { title: "Commission between premiums", body: "Every confirmed purchase through embedded offers generates affiliate commission — incremental revenue on the existing customer base." },
    ],
    architectureNote: "The rewards layer is fully separate from policy administration systems — your app calls one REST API and no policy or claims data is involved in tracking.",
    outcome: "Higher app engagement and a commission revenue line that grows with usage.",
    faqs: [
      { q: "Does this touch policy or claims data?", a: "No. The rewards layer is entirely separate from policy administration. Tracking uses an opaque user token with zero PII — no policy data is shared with MBO Rewards." },
      { q: "Is this a regulated product?", a: "No. Merchant rewards and affiliate commission are retail commerce, not an insurance or financial product — no underwriting, capital, or product approval is involved." },
      { q: "What does the customer see?", a: "A rewards or offers section in your app, in your brand. Merchant campaigns are ranked and refreshed automatically from the unified catalog." },
      { q: "What is the commercial model?", a: "Revenue share on confirmed conversions only — no setup fees or monthly charges. Commission earned can also fund customer-facing reward value." },
    ],
  },
  {
    slug: "nbfc",
    navLabel: "NBFCs",
    navDescription: "Affiliate revenue from repayment traffic.",
    name: "NBFCs",
    icon: "building",
    headline: "Affiliate revenue for lending platforms and their borrowers.",
    subheadline: "Your borrowers repay through your app every month. Embedded merchant rewards make those visits worth more — to them and to you.",
    challenges: [
      { title: "Repayment traffic is unmonetised", body: "Borrowers visit monthly to pay EMIs — high-frequency, high-trust traffic that generates zero revenue beyond the loan itself." },
      { title: "Cross-sell has regulatory limits", body: "Pushing more credit products at repayment time invites both regulatory scrutiny and borrower fatigue." },
      { title: "Engagement ends with the loan", body: "When the loan closes, the relationship closes. There is nothing keeping the customer in the app between or after loans." },
    ],
    points: [
      { title: "Monetise repayment traffic", body: "EMI and repayment visits become commerce moments with contextual merchant offers." },
      { title: "Built for regulated lenders", body: "Zero PII storage and server-side tracking designed for compliance-conscious NBFCs." },
      { title: "Revenue share only", body: "No setup fees or monthly charges — commission is shared only on confirmed conversions." },
    ],
    useCases: [
      { title: "Offers on the repayment journey", body: "After an EMI payment, show relevant merchant offers — a value moment instead of a dead end." },
      { title: "Rewards for good repayment behaviour", body: "Commission-funded merchant rewards can recognise on-time repayment without touching loan pricing." },
      { title: "Relationship beyond the loan", body: "A rewards surface keeps closed-loan customers engaged until their next credit need." },
    ],
    architectureNote: "No loan, bureau, or KYC data is involved — the rewards layer runs on an opaque user token through one REST API, entirely separate from your lending stack.",
    outcome: "A new revenue line from existing traffic, with no upfront cost.",
    faqs: [
      { q: "Does MBO Rewards see any borrower data?", a: "No. Tracking runs on an opaque token your systems generate. No loan data, bureau data, KYC, or personal identifiers enter MBO Rewards." },
      { q: "Will this complicate our regulatory position?", a: "Merchant rewards are retail commerce, not a credit product. The zero-PII, server-side architecture is designed for compliance-conscious regulated lenders." },
      { q: "What's the effort for our engineering team?", a: "One REST API integration, typically 2–3 days from sandbox to production, with a dedicated integration engineer." },
      { q: "How do we earn?", a: "Affiliate commission on every confirmed purchase made through embedded offers, reported per campaign with monthly statements." },
    ],
  },
  {
    slug: "loyalty",
    navLabel: "Loyalty Platforms",
    navDescription: "Commission-funded rewards for loyalty catalogs.",
    name: "Loyalty Platforms",
    icon: "award",
    headline: "Real merchant rewards behind your loyalty programme.",
    subheadline: "Power your loyalty catalog with live affiliate campaigns — earn commission on redemptions instead of only funding them.",
    challenges: [
      { title: "Reward catalogs are a cost centre", body: "Every point redeemed is funded from programme budget. The better your programme performs, the more it costs." },
      { title: "Catalog management is manual", body: "Sourcing merchant offers, checking validity, and refreshing inventory consumes an operations team — and stale offers erode member trust." },
      { title: "Merchant supply is limited", body: "Direct merchant partnerships take business development effort per merchant, capping catalog breadth." },
    ],
    points: [
      { title: "500+ live campaigns", body: "A normalised, deduplicated catalog across travel, fashion, electronics, food, finance, and lifestyle." },
      { title: "Webhook-driven reward logic", body: "Conversion-confirmed webhooks trigger your points credit or reward fulfilment automatically." },
      { title: "Commission-funded rewards", body: "Affiliate commission on tracked purchases offsets — or exceeds — the cost of the rewards you issue." },
    ],
    useCases: [
      { title: "Earn-through-shopping catalog", body: "Members shop through tracked merchant offers and earn points automatically on confirmed conversions via webhooks." },
      { title: "Self-refreshing offer inventory", body: "The campaign catalog synchronises and deduplicates automatically — no manual sourcing or expiry checks." },
      { title: "Programme economics that improve with usage", body: "Commission earned on member purchases funds the points issued, turning redemption growth from a cost into revenue." },
    ],
    architectureNote: "Your loyalty engine consumes the campaign API and listens for conversion webhooks — points issuance stays entirely in your system, triggered by confirmed commission events.",
    outcome: "A loyalty catalog that generates revenue instead of only consuming budget.",
    faqs: [
      { q: "How do points get credited on purchases?", a: "A webhook fires when a conversion is confirmed, carrying the campaign and commission detail. Your loyalty engine credits points based on your own rules — issuance logic stays in your system." },
      { q: "How many merchants and categories are covered?", a: "500+ live campaigns across travel, fashion, electronics, food and grocery, financial products, and lifestyle — normalised and deduplicated across source networks." },
      { q: "Can commission fund our points liability?", a: "Yes. Commission is earned on every confirmed member purchase through tracked offers; many programmes size points issuance so commission covers or exceeds it." },
      { q: "Are gift cards available?", a: "Gift card capability is available on request as an additional reward option alongside merchant campaigns." },
    ],
  },
];

export function getSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find(s => s.slug === slug);
}

export function relatedSolutions(slug: string, count = 3): Solution[] {
  const idx = SOLUTIONS.findIndex(s => s.slug === slug);
  if (idx === -1) return SOLUTIONS.slice(0, count);
  return Array.from({ length: count }, (_, i) => SOLUTIONS[(idx + 1 + i) % SOLUTIONS.length]);
}
