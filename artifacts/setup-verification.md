# Setup verification report

## Runtimes

| Tool | Present | Version |
|---|---|---|
| node | yes | v24.16.0 |
| npm | yes | 11.17.0 |
| git | yes | git version 2.51.2.windows.1 |
| docker | no | - |
| docker compose | no | - |

## Environment variables (presence only — no values printed)

Missing: APP_ENV, APP_BASE_URL, DATABASE_URL, REDIS_URL, OBJECT_STORAGE_ENDPOINT, OBJECT_STORAGE_BUCKET, OBJECT_STORAGE_ACCESS_KEY, OBJECT_STORAGE_SECRET_KEY, AUTH_SECRET, WEATHER_PROVIDER_PRIMARY, WEATHER_PROVIDER_API_KEY, SPACE_WEATHER_PROVIDER, MAP_STYLE_URL, MAP_TILE_TOKEN, PUSH_PUBLIC_KEY, PUSH_PRIVATE_KEY, FCM_CREDENTIALS_PATH, SENTRY_DSN, POSTHOG_KEY, FEATURE_FLAGS_SOURCE

## Docker Compose

docker-compose.yml present: yes

## Notes

- This is a Phase 0 scaffold. Application dependencies (Next.js, Prisma, etc.) are not installed yet — see docs/SETUP.md.
- Docker was not detected as installed when this repo was scaffolded (2026-07-31); install Docker Desktop to bring up Postgres/Redis via docker-compose.yml.
