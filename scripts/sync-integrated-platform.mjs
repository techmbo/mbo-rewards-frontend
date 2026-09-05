#!/usr/bin/env node
/**
 * Build the Integrated Platform SPA (mbo_frontend/platform) and copy it into
 * public/mbointegratedPlatform so it is served at
 * https://www.mborewards.com/mbointegratedPlatform
 *
 * Backend stays separate: ../platform_backend
 */
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mboFrontendRoot = join(__dirname, "..");
const platformFrontend = join(mboFrontendRoot, "platform");
const distDir = join(platformFrontend, "dist");
const outDir = join(mboFrontendRoot, "public", "mbointegratedPlatform");

function run(command, args, cwd, env = process.env) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
    env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(platformFrontend)) {
  console.error(`Platform frontend not found at:\n  ${platformFrontend}`);
  process.exit(1);
}

if (!existsSync(join(platformFrontend, "node_modules"))) {
  console.log("→ Installing platform dependencies…");
  run("npm", ["install"], platformFrontend);
}

// The synced bundle is the PRODUCTION bundle served at /mbointegratedPlatform, so the API base
// comes from the platform's tracked production env (platform/.env.production) unless the caller
// explicitly overrides it:
//   VITE_API_BASE_URL=https://your-api.example.com/api npm run sync:platform
// Never default to a loopback API here — that bakes http://127.0.0.1 into the deployed SPA.
const explicitApiBase = String(process.env.VITE_API_BASE_URL || "").trim();
const productionEnvFile = join(platformFrontend, ".env.production");
const productionApiBase = existsSync(productionEnvFile)
  ? (readFileSync(productionEnvFile, "utf8").match(/^\s*VITE_API_BASE_URL\s*=\s*"?([^"\r\n]+)"?/m)?.[1] ?? "").trim()
  : "";
const apiBase = explicitApiBase || productionApiBase;
if (!apiBase) {
  console.error(
    "VITE_API_BASE_URL is not set and platform/.env.production does not define it; refusing to build the integrated platform without a backend URL.",
  );
  process.exit(1);
}

console.log(`→ Building Integrated Platform frontend (API: ${apiBase})…`);
run("npm", ["run", "build"], platformFrontend, {
  ...process.env,
  VITE_API_BASE_URL: apiBase,
});

if (!existsSync(distDir)) {
  console.error(`Build output missing: ${distDir}`);
  process.exit(1);
}

// Guard: a loopback backend must only ever be baked on explicit request (local previews).
if (!explicitApiBase && /^https?:\/\/(127\.0\.0\.1|localhost)\b/i.test(apiBase)) {
  console.error(`Refusing to sync an integrated platform bundle pointed at a loopback API: ${apiBase}`);
  process.exit(1);
}

console.log(`→ Syncing into ${outDir}`);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(distDir, outDir, { recursive: true });

console.log("✓ Integrated Platform available at /mbointegratedPlatform");
