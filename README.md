# El Niño

Weather-only social platform — globe-first UI with a TikTok-style vertical feed of
weather video content.

Phases 1–4 (design system/nav, globe/map, feed/playback, auth/profiles/Watch
Zones) are implemented — see `docs/checkpoints/` for per-phase status, per the
authoritative
[`specs/El_Nino_FULL_MASTER_Production_Prompt.md`](specs/El_Nino_FULL_MASTER_Production_Prompt.md)
(supersedes the earlier [3-page draft](specs/El_Nino_Master_Prompt_Draft_3_Pages.md)).

## Docs

- [Full master production prompt](specs/El_Nino_FULL_MASTER_Production_Prompt.md) — authoritative spec
- [Architecture](docs/ARCHITECTURE.md)
- [Database schema](docs/DATABASE.md)
- [Technical debt report](docs/TECH_DEBT.md)
- [Migration strategy](docs/MIGRATION_STRATEGY.md)
- [Setup log](docs/SETUP.md)
- [Phase checkpoints](docs/checkpoints/)
- [Project skills](.claude/skills/) — codebase-auditor, migration-planner,
  product-guardian, ui-consistency-reviewer, map-geospatial-engineer,
  weather-data-integrator, media-pipeline-engineer, trust-safety-reviewer,
  security-privacy-reviewer, test-quality-engineer, performance-cost-engineer,
  release-documentation-manager

## Local development (once dependencies are installed — see docs/SETUP.md)

```
npm install
docker compose up -d        # Postgres + Redis (requires Docker)
cp .env.example .env        # fill in DATABASE_URL/AUTH_SECRET
npm run db:migrate          # apply the database schema
npm run db:seed             # optional — deterministic dev fixtures
npm run dev
```

## Windows Phase 9 database bring-up + full verification

One-command setup, then the complete quality gate, from a Windows machine
with Docker Desktop, PostgreSQL client tooling not required (the scripts use
`docker compose exec`), Git, and a browser (for Playwright):

```
powershell -ExecutionPolicy Bypass -File scripts\setup-phase9.ps1
powershell -ExecutionPolicy Bypass -File scripts\run-final-checks.ps1
```

See `docs/checkpoints/PHASE-7-8-9.md` for what each script does and why
these were not run in the sandbox this repository was built in (no Docker
available there).
