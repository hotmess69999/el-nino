# Destroys and recreates local Postgres/Redis data, then reapplies migrations
# and seed from scratch -- this is the "clean migration from an empty
# database" check. Destructive to LOCAL data only; never point this at a
# shared or remote database (docker-compose.yml only defines local services).
$ErrorActionPreference = "Continue"

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Write-Error "Docker is not installed or not on PATH."
    exit 1
}

Write-Host "Stopping and removing local containers and volumes (docker compose down -v)..."
docker compose down -v

& "$PSScriptRoot\start-database.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Applying migrations to the clean database (prisma migrate deploy)..."
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Error "prisma migrate deploy failed against a clean database -- see output above."
    exit 1
}

Write-Host "Running deterministic seed..."
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Error "prisma db seed failed."
    exit 1
}

Write-Host "== Database reset, migrated, and seeded from a clean state. =="
