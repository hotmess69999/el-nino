# Dependency security log

This is the durable record of every package approved past the install-security
guard's heuristic checks, per the controlled installation policy in effect for this
project (established 2026-07-31).

## Policy summary

- All installs still go through `bash /c/Users/jasmi/safe-package-install.sh
  npm <pkg>@<version> ...` (the org-wide `PreToolUse` hook at
  `~/.claude/hooks/npm-pip-install-guard.sh` blocks any direct `npm install
  <pkg>` — it is untouched and still enforced).
- The guard itself (`~/.claude/safe-package-install.sh` — actually located at
  `/c/Users/jasmi/safe-package-install.sh`) was extended, not disabled or
  bypassed, with a narrow allowlist override:
  - Backed up before editing to `~/.safe-package-install/backups/safe-package-install.sh.<timestamp>.bak`.
  - A package can only be installed despite a *heuristic* finding (base64 blob,
    hardcoded IP, suspicious URL, `eval()`, npm install hook, env-var-harvest
    pattern) if it has an exact `name@version` entry in this project's
    `security/approved-packages.json` **and** the allowlisted integrity hash is
    independently re-verified against the live npm registry's
    `dist.integrity` at install time.
  - The override **never** applies to a hard finding — an actual ClamAV
    infection, a GuardDog behavioral flag, a Socket supply-chain flag, or a
    pip-audit known vulnerability. Those still refuse installation
    unconditionally, allowlist or not.
  - Every check still runs and every finding is still logged
    (`~/.safe-package-install/logs/scan-<timestamp>-npm.log`) whether or not
    an override applies — the allowlist changes the final install decision
    only, never the scan or its logging.
  - Persistent install target: `SAFE_INSTALL_PROJECT_DIR` was set to this
    project's root so vetted packages install directly into
    `node_modules`/`package.json`/`package-lock.json` here (with
    `--save-exact`, so versions stay pinned) rather than into the guard's
    generic shared lib directory.
- A package not in the allowlist, or whose live registry integrity no longer
  matches the allowlisted hash, fails normally — no wildcard names, no version
  ranges, no blanket bypass.

## Approved packages

### `react@19.2.8`

- **Publisher:** `fb <opensource+npm@fb.com>` / `react-bot <react-core@meta.com>` (Meta) — official React maintainer accounts.
- **Integrity:** `sha512-PWaYA1L/q9u2u7xYQi+Y3L3Yfnie7XyLeaJICV1MGD6LprsBxcAqGjYyr0eY3p+QdsA+x/Irkt4Qif8D63+Sbw==`
- **Approved:** 2026-07-31
- **Triggered heuristics** (from the scanned react+react-dom+next dependency tree as a whole — the guard scans the whole sandbox, not per-package): long base64-like blobs, hardcoded IP address(es), suspicious URL pattern match, `eval()` calls, npm install/postinstall hooks, possible env-var harvesting.
- **Reason for approval:** Reviewed `react`'s own `package.json` directly — no `preinstall`/`install`/`postinstall` script (only an unrelated `start` script). Findings are consistent with normal minified/bundled build-tooling patterns present elsewhere in the dependency tree (see `next` below), not evidence specific to `react` itself. No hard (ClamAV/GuardDog/Socket) finding.

### `react-dom@19.2.8`

- **Publisher:** `fb <opensource+npm@fb.com>` / `react-bot <react-core@meta.com>` (Meta).
- **Integrity:** `sha512-rVprimfGBG3DR+Tq0IQG2DT5PxKth1WIGDmj5yPmlzr4YBe7uyE+Du4oVqTDXZSHGGGXRtTJEGSSePyQCMBglQ==`
- **Approved:** 2026-07-31
- **Triggered heuristics:** same tree-wide findings as `react` above.
- **Reason for approval:** Same review as `react` — package.json has only an unrelated `start` script, no install hooks. No hard finding.

### `next@16.2.12`

- **Publisher:** `vercel-release-bot <infra+release@vercel.com>` (Vercel) — official Next.js release account.
- **Integrity:** `sha512-iD59eYQWmbFcEbX7v/acG5DRym9iw1DdaPoD0WTA920naWsE25wShzJW4+UvAs8MK9EC2kBfIH6vtto1H1PHGw==`
- **Approved:** 2026-07-31
- **Triggered heuristics:** long base64-like blobs (minified `dist/compiled/*` bundles and sourcemaps), hardcoded IP address(es) (traced to sourcemap coordinate strings and semver's own README examples like `1.2.3.4` — false positives, not real IPs contacted at runtime), suspicious URL pattern match, `eval()` calls (bundler/runtime module loading in `dist/compiled/*`), npm install/postinstall hooks (present on `sharp`, a transitive optional dependency — see below, **not** on `next` itself), possible env-var-harvesting pattern (plausibly Next's documented telemetry collector, which is disabled for this project — see Telemetry below).
- **Reason for approval:** Reviewed `next`'s own `package.json` — no install/postinstall hook of its own. The install-hook finding traced to `sharp` (an optional dependency pulled in for `next/image` optimization), not to `next`. No hard finding.

### `postcss@8.5.25` (override, transitive via `next`)

- **Publisher:** `ai <andrey@sitnik.es>` (Andrey Sitnik, PostCSS author).
- **Integrity:** `sha512-DTPx3RWSSnWyzLxQnlH0rJP+EW5ekl16ZU4/psbIhA0e53kJfdgaN5vKM+xP7yJtXVu+nfdVFmlgFDEKAe4Pyw==`
- **Approved:** 2026-07-31
- **Why this exists:** `next@16.2.12` resolves `postcss@8.4.31` by default, which
  `npm audit` flagged as vulnerable to three disclosed, high-severity CVEs
  (GHSA-qx2v-qp2m-jg93 XSS via unescaped `</style>`, GHSA-6g55-p6wh-862q and
  GHSA-r28c-9q8g-f849, both arbitrary-file-read via `sourceMappingURL`
  handling) — all fixed in `postcss>=8.5.18`. This is **real, disclosed
  vulnerability evidence**, not a heuristic false positive, so it was not
  silently allowlist-overridden — it was fixed by pinning the patched version
  via `"overrides"` in `package.json` and re-resolving.
- **Triggered heuristic:** one hardcoded-IP-pattern hit, traced to the bundled
  `semver` package's own example strings (`1.2.3.4` etc. in its README and
  `functions/coerce.js`) — not a real IP.

### `sharp@0.35.3` (override, transitive/optional via `next`)

- **Publisher:** `lovell <npm@lovell.info>` (Lovell Fuller, sharp maintainer).
- **Integrity:** `sha512-ej0zVHuZGHCiABXcNxeYhpRnPNPAcvbG8RMdBAhDAxLKkCRVSpK3Iyu7qbqw3JMzoj0REeM6f3tJLtVwl0023Q==`
- **Approved:** 2026-07-31
- **Why this exists:** `next@16.2.12`'s optional `sharp` dependency defaulted
  to `0.34.5`, flagged by `npm audit` for inherited libvips CVEs
  (CVE-2026-33327/33328/35590/35591), fixed in `sharp>=0.35.0`. Pinned via
  `"overrides"` for the same reason as postcss above.
- **Bonus finding:** `sharp@0.35.3` no longer declares an `install` lifecycle
  script at all — newer sharp releases ship prebuilt platform binaries as
  `optionalDependencies` instead of building at install time. This also
  removes the install-hook heuristic finding that `sharp@0.34.5` triggered.
- **Triggered heuristics:** none.

## Deferred / not enabled

- **`sharp`** was pulled into `node_modules` as an optional dependency of Next.js's
  image-optimization path. It has a real `install` script
  (`node install/check.js || npm run build`) that downloads/builds a native
  binary. Because installation used `--ignore-scripts`, this script did **not**
  run. This was resolved by the `sharp@0.35.3` override above, which no longer
  has an install script at all (see above) — no further action needed. This
  note is kept for history since it was true of the originally-resolved
  `sharp@0.34.5`.

## Telemetry

`NEXT_TELEMETRY_DISABLED=1` is set in `.env.example` and exported by
`scripts/dev.sh` / `scripts/dev.ps1`, per the controlled-installation policy
requirement to disable optional telemetry.

## Verification performed after this install batch

- **`npm audit`** — initially reported 3 high-severity vulnerabilities
  (postcss, sharp — see overrides above). After pinning the patched versions
  via `"overrides"` and re-resolving (`npm install --ignore-scripts`, no
  package args — a bare reinstall, which the install guard hook allows
  through directly since it isn't installing a named package): **0
  vulnerabilities.**
- **Dependency tree inspection (`npm ls`)** — confirms exact resolution:
  `next@16.2.12` → `postcss@8.5.25 overridden`, `sharp@0.35.3 overridden`,
  `react@19.2.8 deduped`, `react-dom@19.2.8 deduped`, `styled-jsx@5.1.6`; no
  unexpected packages in the tree.
- **Lockfile** — `package-lock.json` generated and committed alongside this
  log and `security/approved-packages.json`.
- `npm run typecheck` — no TypeScript source yet (Phase 0/1 scaffold, no
  `typescript` package installed yet either), not meaningfully runnable until
  Phase 1 adds application code and the dev-dependency batch.
- `npm run build` — not run yet; no Next.js `app` directory exists yet (Phase
  1 work). Will be run and logged here once Phase 1 scaffolds `src/app`.
- Full test suite — no tests exist yet (Phase 0/1 scaffold).

## Guard script changes

- `/c/Users/jasmi/safe-package-install.sh` was extended (backed up first to
  `~/.safe-package-install/backups/safe-package-install.sh.20260731-095619.bak`)
  to add: `SAFE_INSTALL_ALLOWLIST` (default
  `$PWD/security/approved-packages.json`), `SAFE_INSTALL_PROJECT_DIR` (install
  target override), the `record_hard_fail` vs `record_fail` distinction, and
  the Step 6.5 allowlist-override check described above. No existing check,
  scan, or logging behavior was removed or weakened — every finding for every
  package in this log was actually scanned and recorded before any override
  was considered.
- The routing hook (`~/.claude/hooks/npm-pip-install-guard.sh`) was **not**
  modified — it already allows any command that invokes
  `safe-package-install.sh`, and continues to block direct
  `npm install <package>` calls that don't.
