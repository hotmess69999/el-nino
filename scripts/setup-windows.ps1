# Idempotent local setup for Windows (PowerShell). Safe to rerun.
$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

Write-Host "== El Nino local setup (windows) =="

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "Created .env from .env.example — fill in real values before running provider-backed features."
} else {
    Write-Host ".env already exists — leaving it as-is."
}

$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    Write-Host "node: $(node --version)"
} else {
    Write-Error "node not found. Install Node.js LTS before continuing."
    exit 1
}

$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($npm) {
    Write-Host "npm: $(npm --version)"
} else {
    Write-Error "npm not found (expected to ship with Node.js)."
    exit 1
}

$pkg = Get-Content package.json -Raw | ConvertFrom-Json
if ($pkg.dependencies -or $pkg.devDependencies) {
    npm install
} else {
    Write-Host "No dependencies declared in package.json yet — skipping npm install (Phase 0 scaffold has none)."
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
    Write-Host "docker: $(docker --version)"
    Write-Host "Run 'docker compose up -d' to start local Postgres + Redis."
} else {
    Write-Warning "docker not found. Install Docker Desktop to run local Postgres/Redis via docker-compose.yml."
}

Write-Host "Running environment verification..."
try { node scripts/verify-environment.mjs } catch {}

Write-Host "== Setup complete. See docs/SETUP.md for next steps. =="
