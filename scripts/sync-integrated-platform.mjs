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

// Local sync defaults to local API. For production deploys set:
//   VITE_API_BASE_URL=https://your-api.example.com/api npm run sync:platform
const apiBase =
  process.env.VITE_API_BASE_URL || "http://127.0.0.1:4001/api";

console.log(`→ Building Integrated Platform frontend (API: ${apiBase})…`);
run("npm", ["run", "build"], platformFrontend, {
  ...process.env,
  VITE_API_BASE_URL: apiBase,
});

if (!existsSync(distDir)) {
  console.error(`Build output missing: ${distDir}`);
  process.exit(1);
}

console.log(`→ Syncing into ${outDir}`);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(distDir, outDir, { recursive: true });

console.log("✓ Integrated Platform available at /mbointegratedPlatform");
