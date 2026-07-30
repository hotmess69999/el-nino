# Resets local Postgres/Redis data and reseeds deterministic sample data.
# Destructive to LOCAL data only — never point this at a shared or remote database.
$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Write-Error "docker not found — nothing to reset (no local Postgres/Redis containers)."
    exit 1
}

Write-Host "Stopping and removing local Postgres/Redis containers and volumes..."
docker compose down -v

Write-Host "Starting fresh containers..."
docker compose up -d

Write-Host "Waiting for Postgres to accept connections..."
for ($i = 0; $i -lt 30; $i++) {
    $ready = docker compose exec -T postgres pg_isready -U el_nino 2>$null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 1
}

if (Test-Path prisma/schema.prisma) {
    Write-Host "Running migrations and seed..."
    npx prisma migrate deploy
    npx prisma db seed
} else {
    Write-Host "No prisma/schema.prisma yet — skipping migrate/seed (not implemented past Phase 0)."
}

Write-Host "== Local data reset complete. =="
