# El Niño

Weather-only social platform — globe-first UI with a TikTok-style vertical feed of
weather video content.

This repository is currently in **Phase 0** (foundation): repo scaffold, tooling
config, and planning docs, per [`specs/El_Nino_Master_Prompt_Draft_3_Pages.md`](specs/El_Nino_Master_Prompt_Draft_3_Pages.md).
No product code has been written yet.

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Technical debt report](docs/TECH_DEBT.md)
- [Migration strategy](docs/MIGRATION_STRATEGY.md)
- [Setup log](docs/SETUP.md)

## Local development (once dependencies are installed — see docs/SETUP.md)

```
npm install
docker compose up -d      # Postgres + Redis (requires Docker)
npm run dev
```
