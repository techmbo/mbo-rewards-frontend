import { MetadataRoute } from "next";
import { SOLUTIONS } from "@/lib/solutions";

const siteUrl = "https://mborewards.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    ...SOLUTIONS.map(s => ({ url: `/solutions/${s.slug}`, priority: 0.8, changeFrequency: "monthly" as const })),
    { url: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { url: "/product", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/how-it-works", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/use-cases", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/security", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/pricing", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/revenue-simulator", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
    { url: "/blog/affiliate-commerce-api-fintech", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/blog/server-side-attribution-vs-cookies", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/blog/embedded-affiliate-commerce-banking-apps", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/privacy", priority: 0.4, changeFrequency: "yearly" as const },
    { url: "/terms", priority: 0.4, changeFrequency: "yearly" as const },
    { url: "/cookies", priority: 0.4, changeFrequency: "yearly" as const },
  ];

  return pages.map(p => ({
    url: `${siteUrl}${p.url}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
