# Environment variables

See [`.env.example`](../.env.example) for the current full list with defaults. Copy
it to `.env` for local development and never commit real values.

| Variable                                                  | Purpose                                              | Required for                                                                                              |
| --------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `APP_ENV`                                                 | `development` / `staging` / `production`             | always                                                                                                    |
| `APP_BASE_URL`                                            | Base URL the app is served from                      | always                                                                                                    |
| `NEXT_TELEMETRY_DISABLED`                                 | `1` disables Next.js's anonymous telemetry collector | always — set by `scripts/dev.sh`/`dev.ps1` and required by policy (see `docs/dependency-security-log.md`) |
| `DATABASE_URL`                                            | PostgreSQL connection string                         | database access — active as of Phase 4 (auth, profiles, Watch Zones; see `docs/DATABASE.md`)              |
| `REDIS_URL`                                               | Redis connection string                              | queues, rate limits, realtime coordination (Phase 3+)                                                     |
| `OBJECT_STORAGE_ENDPOINT`                                 | S3-compatible endpoint (MinIO locally)               | media upload (Phase 5)                                                                                    |
| `OBJECT_STORAGE_BUCKET`                                   | Bucket name                                          | media upload (Phase 5)                                                                                    |
| `OBJECT_STORAGE_ACCESS_KEY` / `OBJECT_STORAGE_SECRET_KEY` | Object storage credentials                           | media upload (Phase 5)                                                                                    |
| `AUTH_SECRET`                                             | Session/token signing secret (Better Auth)           | auth — active as of Phase 4                                                                                |
| `WEATHER_PROVIDER_PRIMARY` / `WEATHER_PROVIDER_API_KEY`   | Primary terrestrial weather/warning provider         | warnings (Phase 6)                                                                                        |
| `SPACE_WEATHER_PROVIDER`                                  | Space-weather data source                            | space weather (Phase 7)                                                                                   |
| `MAP_STYLE_URL` / `MAP_TILE_TOKEN`                        | MapLibre style + tile provider auth                  | globe/map (Phase 2)                                                                                       |
| `PUSH_PUBLIC_KEY` / `PUSH_PRIVATE_KEY`                    | Web Push VAPID keys                                  | push notifications (Phase 6+)                                                                             |
| `FCM_CREDENTIALS_PATH`                                    | Firebase Cloud Messaging service account             | mobile push (later)                                                                                       |
| `SENTRY_DSN`                                              | Error reporting                                      | after consent/retention rules are defined (section 26)                                                    |
| `POSTHOG_KEY`                                             | Product analytics                                    | after consent/retention rules are defined (section 26)                                                    |
| `FEATURE_FLAGS_SOURCE`                                    | `local` or a flag-service identifier                 | always                                                                                                    |

## Rules

- Never commit `.env` or any file containing real secret values.
- `scripts/verify-environment.mjs` checks that required variables are _present_ for
  the current phase without ever printing their values.
- Production, staging, and development use separate credentials and separate
  environment-specific accounts (section 26) — a staging `AUTH_SECRET` or DB must
  never be reused in production.
- Add a new variable here and in `.env.example` in the same change that introduces
  the code reading it — don't let this list drift from reality.
