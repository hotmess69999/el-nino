# Starts the local Postgres/Redis containers (docker-compose.yml) and waits
# for Postgres to pass its healthcheck before returning. Idempotent -- safe
# to rerun; `docker compose up -d` no-ops on an already-running service.
$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Write-Error "Docker is not installed or not on PATH. Install Docker Desktop, start it, then rerun this script."
    exit 1
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker is installed but not running. Start Docker Desktop, then rerun this script."
    exit 1
}

Write-Host "Starting Postgres and Redis (docker compose up -d)..."
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Error "docker compose up failed -- see output above."
    exit 1
}

Write-Host "Waiting for Postgres healthcheck..."
$healthy = $false
for ($i = 0; $i -lt 60; $i++) {
    $status = docker compose ps postgres --format json 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($status -and $status.Health -eq "healthy") {
        $healthy = $true
        break
    }
    Start-Sleep -Seconds 1
}

if (-not $healthy) {
    Write-Error "Postgres did not become healthy within 60 seconds. Run 'docker compose logs postgres' to investigate."
    exit 1
}

Write-Host "== Postgres is healthy and accepting connections. =="
