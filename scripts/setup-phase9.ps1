# One-command Phase 9 database bring-up: verify Docker, start Postgres, wait
# for its healthcheck, apply migrations, seed, then run the database-backed
# test suites that were skipped/failing without a live database in every
# prior phase's checkpoint (see docs/checkpoints/PHASE-4.md,
# docs/checkpoints/PHASE-5-6.md, docs/checkpoints/PHASE-7-8-9.md).
#
# Run from the repository root:
#   powershell -ExecutionPolicy Bypass -File scripts\setup-phase9.ps1
$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

Write-Host "=================================================="
Write-Host " El Nino -- Phase 9 database bring-up"
Write-Host "=================================================="

# 1. Docker present and running
$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Write-Error "Docker is not installed or not on PATH. Install Docker Desktop, then rerun this script."
    exit 1
}
docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker is installed but not running. Start Docker Desktop, then rerun this script."
    exit 1
}
Write-Host "[1/7] Docker is installed and running."

# .env must exist with real local values (never edited by this script --
# .env.example's defaults already match docker-compose.yml's credentials).
if (-not (Test-Path .env)) {
    Write-Host "No .env found -- copying .env.example (its DATABASE_URL/dev defaults match docker-compose.yml)."
    Copy-Item .env.example .env
    Write-Host "Set a real AUTH_SECRET in .env before using this outside local development."
}

# 2-3. Start Postgres, wait for healthcheck
Write-Host "[2/7] Starting Postgres..."
& "$PSScriptRoot\start-database.ps1"
if ($LASTEXITCODE -ne 0) { Write-Error "Postgres did not start successfully."; exit 1 }
Write-Host "[3/7] Postgres healthcheck passed."

# 4. Apply migrations
Write-Host "[4/7] Applying Prisma migrations (prisma migrate deploy)..."
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) { Write-Error "prisma migrate deploy failed."; exit 1 }

# 5. Deterministic seed
Write-Host "[5/7] Running deterministic seed..."
npx prisma db seed
if ($LASTEXITCODE -ne 0) { Write-Error "prisma db seed failed."; exit 1 }

# 6. Database-dependent tests
Write-Host "[6/7] Running database-dependent unit tests (RUN_DB_TESTS=1)..."
$env:RUN_DB_TESTS = "1"
npx vitest run src/lib/db/integration.test.ts
$dbTestsPassed = ($LASTEXITCODE -eq 0)
Remove-Item Env:\RUN_DB_TESTS

# 7. Clear summary
Write-Host "=================================================="
if ($dbTestsPassed) {
    Write-Host "[7/7] SUCCESS -- Postgres is up, migrated, seeded, and the database" -ForegroundColor Green
    Write-Host "       integration tests pass." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next: powershell -ExecutionPolicy Bypass -File scripts\run-final-checks.ps1"
    exit 0
} else {
    Write-Host "[7/7] FAILURE -- database-dependent tests did not pass. See output above." -ForegroundColor Red
    exit 1
}
