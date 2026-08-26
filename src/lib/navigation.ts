// Header navigation structure — config-driven so future pages (Developer
// Portal, API Reference, Case Studies, Status Page, Trust Center, …) are
// added here without touching the Nav component.

import { SOLUTIONS } from "./solutions";

export interface NavItem {
  label: string;
  href: string;
  description: string;
  /** Key into the icon set in Nav.tsx. */
  icon: string;
}

/** Hero card rendered at the top of a mega menu, with its own CTA. */
export interface NavHero {
  label: string;
  href: string;
  description: string;
  icon: string;
  cta: string;
  badge?: string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface NavMenu {
  label: string;
  /** One-line purpose shown at the top of the mega menu. */
  tagline: string;
  hero?: NavHero;
  groups: NavGroup[];
  /** Small trust line rendered at the bottom of the menu. */
  trustNote?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_MENUS: NavMenu[] = [
  {
    label: "Platform",
    tagline: "Unified rewards infrastructure",
    groups: [
      {
        items: [
          { label: "Platform Overview", href: "/", icon: "layers", description: "One API for affiliate commerce — campaigns, tracking, and commission." },
          { label: "Product", href: "/product", icon: "boxes", description: "Campaign engine, tracking engine, fraud scoring, and dashboard." },
          { label: "API & Integration", href: "/how-it-works", icon: "code", description: "REST endpoints, sandbox access, and the 5-step path to production." },
          { label: "Security & Compliance", href: "/security", icon: "shield", description: "Zero PII. Server-side tracking. Built for regulated platforms." },
        ],
      },
    ],
  },
  {
    label: "Solutions",
    tagline: "Built for regulated platforms",
    groups: [
      {
        items: SOLUTIONS.map(s => ({
          label: s.navLabel,
          href: `/solutions/${s.slug}`,
          icon: s.icon,
          description: s.navDescription,
        })),
      },
    ],
  },
  {
    label: "Resources",
    tagline: "Interactive tools and documentation",
    hero: {
      label: "Revenue Opportunity Simulator",
      href: "/revenue-simulator",
      icon: "sparkles",
      description: "Estimate the affiliate commission revenue your platform could generate — and download an executive business case.",
      cta: "Try the Simulator",
      badge: "NEW",
    },
    groups: [
      {
        label: "Business Resources",
        items: [
          { label: "Business Case Builder", href: "/revenue-simulator", icon: "file", description: "Generate a branded executive business case as a PDF." },
          { label: "Blog", href: "/blog", icon: "book", description: "Insights on affiliate infrastructure and embedded commerce." },
          { label: "About MBO Rewards", href: "/about", icon: "info", description: "The team and thesis behind the infrastructure layer." },
        ],
      },
      {
        label: "Developer Resources",
        items: [
          { label: "Integration Guide", href: "/how-it-works", icon: "code", description: "REST API, sandbox access, and the integration steps." },
          { label: "API Overview", href: "/product", icon: "terminal", description: "The API layer, data flow, and what your platform receives." },
          { label: "FAQ", href: "/#faq", icon: "help", description: "Common questions on integration, pricing, and data handling." },
        ],
      },
    ],
    trustNote: "Built for banks, fintechs and enterprise platforms.",
  },
];

export const NAV_LINKS: NavLink[] = [{ label: "Pricing", href: "/pricing" }];

export const NAV_CTAS = {
  primary: { label: "Book Demo", href: "/contact" },
};

// Homepage-only promotional announcement — not part of global navigation.
// Dismissal or click-through is persisted per id; change the id to re-show
// a new announcement to users who dismissed an old one.
export const ANNOUNCEMENT = {
  id: "sim-launch",
  title: "Revenue Opportunity Simulator",
  subtitle: "Estimate your affiliate revenue in minutes",
  cta: "Estimate Revenue →",
  href: "/revenue-simulator",
};

/** Flip on when site search ships — the header already reserves the slot. */
export const SEARCH_ENABLED = false;
