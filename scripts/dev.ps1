# Starts local infra (if Docker is available) and the dev server.
$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

$env:NEXT_TELEMETRY_DISABLED = "1"

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
    docker compose up -d
} else {
    Write-Warning "docker not found — skipping Postgres/Redis. Install Docker Desktop for full local functionality."
}

npm run dev
