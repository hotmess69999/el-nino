#!/usr/bin/env bash
# Starts local infra (if Docker is available) and the dev server.
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

if command -v docker >/dev/null 2>&1; then
  docker compose up -d
else
  echo "docker not found — skipping Postgres/Redis. Install Docker Desktop for full local functionality." >&2
fi

npm run dev
