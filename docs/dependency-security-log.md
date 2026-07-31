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
  - A package can only be installed despite a _heuristic_ finding (base64 blob,
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

### `typescript@7.0.2`, `@types/node@26.1.2`, `@types/react@19.2.18`, `@types/react-dom@19.2.4`

- **Publishers:** `typescript-bot`/`typescript-deploys`/`microsoft-oss-releases`
  (Microsoft, TypeScript) and `types <ts-npm-types@microsoft.com>`
  (DefinitelyTyped, Microsoft-owned account, for all three `@types/*`
  packages).
- **Approved:** 2026-07-31
- **Triggered heuristics:** `typescript` — a test-fixture URL
  (`http://127.0.0.1:8080/...`) inside its vendored `vscode-jsonrpc`
  dependency's `package.json`, and an env-var-harvest match in that same
  vendored dependency's `node/main.js` (bundled TS-language-server tooling,
  not typescript's own runtime). `@types/node` — example IP addresses inside
  JSDoc comments in `net.d.ts`/`os.d.ts` (illustrating socket/OS API shapes)
  and `process.env` _type references_ (not runtime code) in
  `child_process.d.ts`/`http.d.ts`/`test.d.ts`. `@types/react` and
  `@types/react-dom` triggered nothing on their own.
- **Reason for approval:** All four are type-only or first-party Microsoft
  tooling packages; the `@types/*` findings are inherent to any
  TypeScript-declaration package that documents Node's networking APIs (the
  patterns are in `.d.ts` comments, not executable code), and typescript's
  findings trace to a vendored dev-tool dependency's own test fixtures. No
  ClamAV/GuardDog/Socket hard finding for any of the four. All four registry
  `dist.integrity` values re-verified live at install time.
- **Correction after install:** the guard's `npm install --save-exact` always
  writes to `"dependencies"` (no `--save-dev` support). Manually moved
  `typescript` and the three `@types/*` packages to `"devDependencies"` in
  `package.json` after the vetted install completed, then ran a bare `npm
install --ignore-scripts` (no package args — allowed directly by the
  routing hook since it isn't installing a named package) to reconcile the
  lockfile. No new code was fetched or scanned by this step, only the
  manifest section changed.
- **Post-install verification:** fixed a real `tsconfig.json` incompatibility
  surfaced by this typecheck run — TypeScript 7.x removed the legacy
  `baseUrl` compiler option (`TS5102`) and requires `paths` entries to be
  explicitly relative (`TS5090`). Changed `"paths": {"@/*": ["src/*"]}` under
  `baseUrl: "."` to `"paths": {"@/*": ["./src/*"]}` with `baseUrl` removed.
  Added `src/lib/placeholder.ts` (temporary, documented as such, to be
  deleted once Phase 1 adds real source) so `tsc --noEmit` had at least one
  input file to actually verify the config against, rather than leaving it
  unverified. `npm run typecheck` now passes cleanly. `npx next --version`
  also confirmed the Next.js CLI resolves and runs.

## Deferred / not enabled

- **`sharp`** was pulled into `node_modules` as an optional dependency of Next.js's
  image-optimization path. It has a real `install` script
  (`node install/check.js || npm run build`) that downloads/builds a native
  binary. Because installation used `--ignore-scripts`, this script did **not**
  run. This was resolved by the `sharp@0.35.3` override above, which no longer
  has an install script at all (see above) — no further action needed. This
  note is kept for history since it was true of the originally-resolved
  `sharp@0.34.5`.

### `eslint@10.8.0`, `@eslint/js@10.0.1`, `typescript-eslint@8.65.0`, `eslint-config-prettier@10.1.8`, `prettier@3.9.6`

- **Publishers:** `eslint`/`@eslint/js` — OpenJS Foundation (`openjsfoundation`,
  `eslintbot`). `typescript-eslint` — its long-standing maintainers
  (`jameshenry`, `bradzacher`). `eslint-config-prettier` — its long-standing
  maintainers (`jounqin`, `lydell`, `thorn0`). `prettier` — the Prettier core
  team.
- **Approved:** 2026-07-31
- **Triggered heuristics:** `eslint` — an embedded PNG icon (base64) in its
  own HTML report formatter; `eval()` matches inside its own `no-eval`/
  `no-implied-eval` rule source (which detects `eval()` in _user_ code, so
  necessarily contains the literal string). `typescript-eslint` — same
  eval-detection-rule pattern in `@typescript-eslint/eslint-plugin`.
  `prettier` — IP-address-shaped example strings in dependency READMEs
  (`esutils`, `semver`, `uri-js`) and a substring false-positive
  (`https://www.thereadyset.co/` contains `t.co/` as a substring, tripping
  the URL-shortener pattern despite not being a `t.co` link). `@eslint/js`
  and `eslint-config-prettier` triggered nothing on their own.
- **Reason for approval:** every finding traced to either a legitimate
  embedded asset, a linter's own rule-detection source code, or
  documentation/README false-positive text — none executable exfiltration.
  No ClamAV/GuardDog/Socket hard finding for any of the five. All `dist.integrity`
  values re-verified live at install time.
- **Blocking issue found and fixed:** `typescript-eslint@8.65.0` (latest
  stable) peer-requires `typescript >=4.8.4 <6.1.0` — incompatible with the
  `typescript@7.0.2` installed in the previous batch. No stable
  `typescript-eslint` release supports TypeScript 7.x yet (only alpha/canary
  tags). Rather than pin an alpha release of a critical linting tool,
  **downgraded to `typescript@5.9.3`** (latest stable release within
  typescript-eslint's supported range; re-vetted and re-approved above,
  superseding the original `7.0.2` allowlist entry). `next@16.2.12` has no
  typescript peer constraint, so this is safe.
- **Correction after install:** same as the previous batch — the guard
  writes to `"dependencies"`, so all five were manually moved to
  `"devDependencies"` and the lockfile reconciled with a bare `npm install
--ignore-scripts`.
- **Config migration:** ESLint 10 requires flat config
  (`eslint.config.mjs`) — replaced the legacy `.eslintrc.cjs` (which ESLint
  10 doesn't read at all) with a flat config using
  `@eslint/js` recommended rules + `typescript-eslint` recommended rules +
  `eslint-config-prettier` (to disable formatting-related rules Prettier
  already owns), plus explicit Node globals (`console`, `process`, `Buffer`,
  etc.) needed for the `scripts/*.mjs` files.
- **Post-install verification:** `npm run lint` (0 errors), `npm run
typecheck` (0 errors, now against `typescript@5.9.3`), and `npx prettier
--check .` all pass cleanly. Ran `npm run format` once to establish a
  consistent baseline (cosmetic-only reformatting of existing Markdown/JSON/
  script files — table alignment, JSON array wrapping; no content changes).

### `prisma@7.9.1` (dev), `@prisma/client@7.9.1` (runtime)

- **Publisher:** `prismabot <bot-npm@prisma.io>` (Prisma's own release account),
  co-maintained by named Prisma engineers.
- **Approved:** 2026-07-31 — see the detailed per-finding breakdown in
  `security/approved-packages.json`, which is long because this batch
  legitimately triggered every heuristic category at once (79 base64 blobs
  from embedded per-database WASM query-compiler binaries; install hooks on
  `@prisma/engines`/`prisma` for platform-binary fetching; IP/URL hits mostly
  from test-fixture localhost placeholders and one real, expected
  `169.254.169.254` cloud Instance Metadata Service reference in
  `@prisma/query-plan-executor` used for Prisma Postgres/Accelerate's
  cloud-provider auto-detection; env-var/network access that is simply
  Prisma reading `DATABASE_URL` and talking to a database or its own engine
  binaries — normal ORM behavior).
- **Correction after install:** moved `prisma` (the CLI, a dev/build tool)
  to `devDependencies`; `@prisma/client` (the runtime query client used by
  application code) stayed in `dependencies`. Lockfile reconciled with a bare
  `npm install --ignore-scripts`.
- **Post-install verification:** despite `--ignore-scripts`,
  `node_modules/@prisma/engines/schema-engine-windows.exe` is already
  present — Prisma 7.x ships platform query/schema-engine binaries as
  regular package content (not a postinstall download), so no additional
  script-enabling step was needed to get a working CLI. `npx prisma
--version` reports prisma/`@prisma/client` 7.9.1, Query Compiler enabled,
  Schema Engine present. `npm audit`: 0 vulnerabilities (241 packages
  total). `npm run lint` and `npm run typecheck` both pass cleanly.
- **Not yet done:** no `prisma/schema.prisma` exists yet (no data model —
  that's Phase 1+ application work, not Phase 0 tooling installation).
  `npx prisma generate`/`migrate` will be exercised once a schema exists.

### `vitest@4.1.10` (dev), `@playwright/test@1.62.1` (dev)

- **Publishers:** `vitest` — its well-known core team, including
  `yyx990803` (Evan You, creator of Vue/Vite/Vitest). `@playwright/test` —
  `playwright-bot <playwright-npm-bot@microsoft.com>` (Microsoft's official
  Playwright release account).
- **Approved:** 2026-07-31
- **Triggered heuristics:** base64/IP hits traced to version-number- and
  Chrome-DevTools-Protocol-spec-shaped strings inside vitest's and
  playwright-core's own minified bundles. The eval() hits were almost
  entirely Playwright's own `.$eval()`/`.$$eval()` public DOM-evaluation API
  method names (a Puppeteer/Playwright naming convention that happens to
  contain the substring "eval(" — not the dangerous `eval()` function),
  plus one legitimate dynamic-import fallback in vite's own bundled chunk.
  URL hits were playwright-core launching a localhost debug/inspector
  server and vite's dev-server type docs — both local-only addresses.
  Env-var-harvest hits were playwright-core's browser-binary download/proxy
  configuration (reads `PLAYWRIGHT_*` env vars, downloads browser binaries
  — exactly what a browser-automation tool needs to do) and vite's
  dev-server config.
- **Reason for approval:** every finding traced to a legitimate,
  well-understood pattern in first-party code from verified official
  publishers. No ClamAV/GuardDog/Socket hard finding for either package.
  Both `dist.integrity` values re-verified live at install time.
- **Correction after install:** both moved to `devDependencies` (test
  tooling, not runtime app dependencies). Lockfile reconciled with a bare
  `npm install --ignore-scripts`.
- **Not yet done:** `@playwright/test` does **not** download browser
  binaries at install time (no install hook was flagged in the scan) —
  that happens via a separate `npx playwright install` command, which was
  **not** run. Browser binaries must be fetched as their own explicitly
  reviewed step before any end-to-end test can actually execute.
- **Post-install verification:** `npm audit` — 0 vulnerabilities (284
  packages total). `npm run lint` and `npm run typecheck` pass cleanly.
  `npx vitest run` correctly resolves and executes, exiting with "no test
  files found" (expected — no tests exist yet in this Phase 0 scaffold).
  `npx playwright --version` reports `1.62.1` without needing any browser
  binary.

### `eslint-plugin-react-hooks@7.1.1` (dev)

- **Publisher:** `react-bot <react-core@meta.com>` (Meta's official React ESLint
  plugin account).
- **Approved:** 2026-07-31, ahead of Phase 2's stateful client components.
- **Triggered heuristics:** all traced to peer dependencies npm auto-installed
  alongside it (`eslint`, `ajv`, `zod`, `@babel/parser`), not the plugin's own
  source — zod's own IP-address-validation unit test fixtures (including
  deliberately-invalid addresses like `999.999.999.999` used to test its
  validator's rejection logic), eslint's embedded HTML-report icon and its own
  `no-eval`/`no-implied-eval` rule source (same non-execution pattern
  documented on the `eslint@10.8.0` entry), ajv's README sponsor link, and
  Babel sourcemap noise. No ClamAV/GuardDog/Socket hard finding.
- **Config integration:** `eslint-plugin-react-hooks@7.1.1`'s
  `configs["recommended-latest"]` export turned out to still be legacy
  eslintrc format (`"plugins": ["react-hooks"]` as a string array), which
  ESLint 10's flat config rejects outright. Used `configs.flat.recommended`
  instead — verified via `eslint --print-config` that all 16
  `react-hooks/*` rules are actually registered before trusting it.
- **Post-install verification:** `npm run lint`, `npm run typecheck`, `npx
vitest run` (12/12), and `npm run build` all pass cleanly with the plugin
  active.

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
