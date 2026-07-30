#!/usr/bin/env bash
# Resets local Postgres/Redis data and reseeds deterministic sample data.
# Destructive to LOCAL data only — never point this at a shared or remote database.
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker not found — nothing to reset (no local Postgres/Redis containers)." >&2
  exit 1
fi

echo "Stopping and removing local Postgres/Redis containers and volumes..."
docker compose down -v

echo "Starting fresh containers..."
docker compose up -d

echo "Waiting for Postgres to accept connections..."
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U el_nino >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if [ -f prisma/schema.prisma ]; then
  echo "Running migrations and seed..."
  npx prisma migrate deploy
  npx prisma db seed
else
  echo "No prisma/schema.prisma yet — skipping migrate/seed (not implemented past Phase 0)."
fi

echo "== Local data reset complete. =="
