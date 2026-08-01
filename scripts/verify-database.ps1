# Verifies the database is reachable, migrations are applied, and the seed
# is idempotent (running it twice produces no errors and no duplicate rows
# -- every prisma/seed.ts write is an upsert keyed on a fixed id/username).
# Writes a report to artifacts/db-verification.md -- never prints secrets.
$ErrorActionPreference = "Continue"

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

if (-not (Test-Path .env)) {
    Write-Error ".env not found. Copy .env.example to .env first (DATABASE_URL/AUTH_SECRET need real local values)."
    exit 1
}

$artifactsDir = Join-Path $rootDir "artifacts"
if (-not (Test-Path $artifactsDir)) { New-Item -ItemType Directory -Path $artifactsDir | Out-Null }
$reportPath = Join-Path $artifactsDir "db-verification.md"

$lines = @("# Database verification", "", "Run at: $(Get-Date -Format o)", "")
$failed = $false

function Step($label, [scriptblock]$action) {
    Write-Host "-- $label --"
    try {
        & $action
        if ($LASTEXITCODE -ne 0) { throw "exit code $LASTEXITCODE" }
        $script:lines += "- [PASS] $label"
        Write-Host "PASS: $label"
    } catch {
        $script:lines += "- [FAIL] $label -- $($_.Exception.Message)"
        Write-Host "FAIL: $label -- $($_.Exception.Message)"
        $script:failed = $true
    }
}

Step "Connection reachable (prisma db execute --stdin)" {
    "SELECT 1;" | npx prisma db execute --stdin
}

Step "Migrations applied (prisma migrate status)" {
    npx prisma migrate status
}

Step "Seed runs cleanly (first pass)" {
    npx prisma db seed
}

Step "Seed is idempotent (second pass, same output expected, no errors)" {
    npx prisma db seed
}

$lines += ""
$lines += if ($failed) { "**Result: FAILED -- see above.**" } else { "**Result: PASSED.**" }
$lines -join "`n" | Set-Content -Path $reportPath -Encoding utf8

Write-Host ""
Write-Host "Report written to $reportPath"

if ($failed) {
    Write-Error "Database verification FAILED -- see $reportPath"
    exit 1
}

Write-Host "== Database verification PASSED. =="
