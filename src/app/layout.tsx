import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = "https://mborewards.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MBO Rewards — Affiliate Commerce Infrastructure API",
    template: "%s | MBO Rewards",
  },
  description:
    "MBO Rewards is an infrastructure layer for affiliate commerce powered by a unified API. Integrate cashback, offers, and affiliate monetisation into any fintech platform in 2–3 days.",
  keywords: [
    "affiliate commerce API",
    "affiliate infrastructure",
    "fintech affiliate API",
    "cashback API",
    "affiliate tracking API",
    "embedded affiliate commerce",
    "banking rewards API",
    "MBO Rewards",
  ],
  authors: [{ name: "MBO Rewards", url: siteUrl }],
  creator: "MBO Rewards",
  publisher: "MBO Rewards",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "MBO Rewards",
    title: "MBO Rewards — Affiliate Commerce Infrastructure API",
    description:
      "MBO Rewards is an infrastructure layer for affiliate commerce powered by a unified API. One integration. Every campaign. Full tracking.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MBO Rewards — Affiliate Commerce Infrastructure" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MBO Rewards — Affiliate Commerce Infrastructure API",
    description:
      "One API. Every affiliate network. Cashback, offers, and commissions embedded in any app in 2–3 days.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: siteUrl },
  verification: {},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MBO Rewards",
    url: siteUrl,
    logo: `${siteUrl}/logos/mbo-logo.png`,
    description: "Affiliate commerce infrastructure API for banking and fintech platforms.",
    founder: { "@type": "Person", name: "Deepankar Chaudhary" },
    areaServed: ["IN", "AE", "SG", "GB", "SA", "QA", "ID", "MY", "PH", "TH", "VN"],
    contactPoint: { "@type": "ContactPoint", contactType: "sales", url: `${siteUrl}/contact` },
    sameAs: ["https://www.linkedin.com/company/mborewards"],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MBO Rewards",
    url: siteUrl,
    potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/blog?q={search_term_string}` }, "query-input": "required name=search_term_string" },
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MBO Rewards API",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    description: "A unified REST API for integrating affiliate commerce, cashback, and campaign tracking into any fintech or banking platform.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR", description: "No setup fee. Revenue share on confirmed conversions only." },
    provider: { "@type": "Organization", name: "MBO Rewards", url: siteUrl },
  };

  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <meta name="x-build" content={process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local"} />
        {/* Optimise Media verification. The account still awaiting verification must be
            FIRST — their checker reads only the first OMG-Verify-V1 tag. */}
        {/* UK account */}
        <meta name="OMG-Verify-V1" content="47b43ce0-bed5-41ff-bcef-9317c6ec9599" />
        {/* MENA account */}
        <meta name="OMG-Verify-V1" content="f0d912f9-9b03-4df3-b80c-01aca417555b" />
        {/* Optimise Media verification — SEA account */}
        <meta name="OMG-Verify-V1" content="3050d8d0-7c22-4ae7-b077-3eb94219fe5f" />
        {/* Admitad (Mitgo) verification */}
        <meta name="mitgo-verification" content="3ea4c77a-7faa-46da-b817-f485a4723154" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      </head>
      <body>
        {children}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-J7NBDNZLV0" strategy="lazyOnload" />
        <Script id="ga4" strategy="lazyOnload">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-J7NBDNZLV0');`}
        </Script>
      </body>
    </html>
  );
}
