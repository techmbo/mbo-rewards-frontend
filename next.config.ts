import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * MBO Rewards marketing site + Integrated Platform SPA.
 *
 * Platform UI source: `./platform` (Vite)
 * Synced into `public/mbointegratedPlatform` via `npm run sync:platform`
 *
 * Live URL: https://www.mborewards.com/mbointegratedPlatform
 * API: separate repo folder `platform_backend` (Railway/Docker) — not this Next app.
 */
const nextConfig: NextConfig = {
  // Keep Turbopack rooted on this app (not the monorepo parent folder).
  turbopack: {
    root: projectRoot,
  },
  async rewrites() {
    return {
      // Serve static assets from public/ first; SPA routes fall through here.
      afterFiles: [
        {
          source: "/mbointegratedPlatform",
          destination: "/mbointegratedPlatform/index.html",
        },
        {
          source: "/mbointegratedPlatform/:path*",
          destination: "/mbointegratedPlatform/index.html",
        },
      ],
    };
  },
};

export default nextConfig;
