#!/usr/bin/env bash
# Idempotent local setup for macOS/Linux. Safe to rerun.
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

echo "== El Nino local setup (unix) =="

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — fill in real values before running provider-backed features."
else
  echo ".env already exists — leaving it as-is."
fi

if command -v node >/dev/null 2>&1; then
  echo "node: $(node --version)"
else
  echo "node not found. Install Node.js LTS before continuing." >&2
  exit 1
fi

if command -v npm >/dev/null 2>&1; then
  echo "npm: $(npm --version)"
else
  echo "npm not found (expected to ship with Node.js)." >&2
  exit 1
fi

if [ -f package.json ] && node -e "const p=require('./package.json'); process.exit((p.dependencies||p.devDependencies)?0:1)" 2>/dev/null; then
  npm install
else
  echo "No dependencies declared in package.json yet — skipping npm install (Phase 0 scaffold has none)."
fi

if command -v docker >/dev/null 2>&1; then
  echo "docker: $(docker --version)"
  echo "Run 'docker compose up -d' to start local Postgres + Redis."
else
  echo "docker not found. Install Docker Desktop to run local Postgres/Redis via docker-compose.yml." >&2
fi

echo "Running environment verification..."
node scripts/verify-environment.mjs || true

echo "== Setup complete. See docs/SETUP.md for next steps. =="
