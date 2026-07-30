#!/usr/bin/env node
// Verifies the local dev environment without printing secret values.
// Writes artifacts/setup-verification.json and artifacts/setup-verification.md.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const artifactsDir = join(root, "artifacts");

function tryRun(cmd, args) {
  try {
    return execFileSync(cmd, args, {
      encoding: "utf8",
      shell: process.platform === "win32",
    }).trim();
  } catch {
    return null;
  }
}

function checkBinary(name, versionArgs = ["--version"], label = name) {
  const version = tryRun(name, versionArgs);
  return { name: label, present: version !== null, version };
}

function requiredEnvVarsFromExample() {
  const examplePath = join(root, ".env.example");
  if (!existsSync(examplePath)) return [];
  return readFileSync(examplePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => line.split("=")[0]);
}

function checkEnvVars() {
  const names = requiredEnvVarsFromExample();
  const envPath = join(root, ".env");
  const localEnv = {};
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...rest] = trimmed.split("=");
      localEnv[key] = rest.join("=");
    }
  }
  // Never record or print the actual value — presence only.
  return names.map((name) => ({
    name,
    present: Boolean(process.env[name] || localEnv[name]),
  }));
}

const results = {
  timestamp: "unknown", // stamped by caller if needed; avoided here to stay deterministic
  runtimes: [
    checkBinary("node"),
    checkBinary("npm"),
    checkBinary("git"),
    checkBinary("docker"),
    checkBinary("docker", ["compose", "version"], "docker compose"),
  ],
  envVars: checkEnvVars(),
  dockerCompose: {
    filePresent: existsSync(join(root, "docker-compose.yml")),
  },
  packageJson: {
    present: existsSync(join(root, "package.json")),
  },
  notes: [
    "This is a Phase 0 scaffold. Application dependencies (Next.js, Prisma, etc.) are not installed yet — see docs/SETUP.md.",
    "Docker was not detected as installed when this repo was scaffolded (2026-07-31); install Docker Desktop to bring up Postgres/Redis via docker-compose.yml.",
  ],
};

mkdirSync(artifactsDir, { recursive: true });

writeFileSync(
  join(artifactsDir, "setup-verification.json"),
  JSON.stringify(results, null, 2) + "\n",
);

const REQUIRED_RUNTIMES = new Set(["node", "npm", "git"]);
const missingEnv = results.envVars.filter((v) => !v.present).map((v) => v.name);
const missingRuntimes = results.runtimes
  .filter((r) => !r.present && REQUIRED_RUNTIMES.has(r.name))
  .map((r) => r.name);
const missingOptional = results.runtimes
  .filter((r) => !r.present && !REQUIRED_RUNTIMES.has(r.name))
  .map((r) => r.name);

const md = [
  "# Setup verification report",
  "",
  "## Runtimes",
  "",
  "| Tool | Present | Version |",
  "|---|---|---|",
  ...results.runtimes.map((r) => `| ${r.name} | ${r.present ? "yes" : "no"} | ${r.version ?? "-"} |`),
  "",
  "## Environment variables (presence only — no values printed)",
  "",
  missingEnv.length
    ? `Missing: ${missingEnv.join(", ")}`
    : "All variables from .env.example are set (or not yet required for Phase 0).",
  "",
  "## Docker Compose",
  "",
  `docker-compose.yml present: ${results.dockerCompose.filePresent ? "yes" : "no"}`,
  "",
  "## Notes",
  "",
  ...results.notes.map((n) => `- ${n}`),
  "",
].join("\n");

writeFileSync(join(artifactsDir, "setup-verification.md"), md);

console.log(md);
if (missingOptional.length > 0) {
  console.log(`\n(Optional, not required for Phase 0: ${missingOptional.join(", ")})`);
}
if (missingRuntimes.length > 0) {
  console.error(`\nMissing required runtimes: ${missingRuntimes.join(", ")}`);
  process.exitCode = 1;
}
