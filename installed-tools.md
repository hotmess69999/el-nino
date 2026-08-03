# Installed tools

Every tool installed on this machine during this engagement, why, and how it
was verified. Package-level dependencies for the El Niño codebase itself
(npm packages) are tracked separately in `docs/dependency-security-log.md`
and `security/approved-packages.json` — this file is for machine-level
tooling.

| Tool | Version | Source | Why | Verified |
|---|---|---|---|---|
| Docker Desktop | 4.84.0 | `winget install Docker.DockerDesktop` (official winget source) | Needed a real PostgreSQL instance to verify Phase 4-9's database-backed features (migrations, seed, auth, Watch Zones, etc.) against a live database instead of only reasoning about the code. | `docker info` returns a healthy engine; `docker compose up -d` brought up Postgres/Redis; full quality gate passed against it (`scripts/run-final-checks.ps1`). |
| GitHub CLI (`gh`) | 2.97.0 | `winget install GitHub.cli` (official winget source) | After pushing to GitHub, CI failures needed real log access to diagnose — GitHub's REST API requires repo-admin auth to download job logs, and the public web view also requires sign-in for step detail. `gh` was the fastest reputable way to get that access without hand-rolling OAuth. | `gh auth status` confirms logged in as `hotmess69999`; `gh run view --log-failed` successfully pulled real CI failure logs, which led directly to fixing two genuine bugs. |
| ImageMagick | 7.1.2-26 Q16-HDRI | Already present on this machine (not installed this session) | Used to generate the favicon, app icons, social preview image, and Phase 9 visual-package contact sheets. | `magick -version` confirmed present; output files opened and visually checked. |

## Not installed (considered, rejected)

- **A general browser-automation/login tool for social platforms** — no
  such tool exists in this environment, and none was installed, because
  publishing to X/Instagram/Reddit on the user's behalf requires either
  their own session (which nothing here can drive interactively) or
  official API credentials (which the user hasn't provided yet — see
  `project-log.md`). Installing a scraping/automation tool to fake a login
  wouldn't fix that gap and would risk violating platform ToS.
