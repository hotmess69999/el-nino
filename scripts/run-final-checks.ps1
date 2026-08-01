# The complete Phase 9 quality gate. Requires scripts/setup-phase9.ps1 to
# have succeeded first (Postgres up, migrated, seeded). Every step's
# pass/fail is tracked and printed in one final summary -- the script does
# not stop on the first failure, so a single broken step doesn't hide the
# status of everything else.
#
# Run from the repository root:
#   powershell -ExecutionPolicy Bypass -File scripts\run-final-checks.ps1
$ErrorActionPreference = "Continue"

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

$results = [ordered]@{}

function Step($name, [scriptblock]$action) {
    Write-Host ""
    Write-Host "== $name =="
    & $action
    $results[$name] = ($LASTEXITCODE -eq 0)
}

Step "Lint" { npm run lint }
Step "Typecheck" { npm run typecheck }

Write-Host ""
Write-Host "== Unit + integration tests (RUN_DB_TESTS=1 -- zero unexplained skips) =="
$env:RUN_DB_TESTS = "1"
npx vitest run
$results["Unit + integration tests"] = ($LASTEXITCODE -eq 0)
Remove-Item Env:\RUN_DB_TESTS

Step "Clean database migration (reset-database.ps1)" { & "$PSScriptRoot\reset-database.ps1" }
Step "Database verification incl. seed idempotency (verify-database.ps1)" { & "$PSScriptRoot\verify-database.ps1" }

Step "Playwright -- desktop + Pixel 7 (full suite)" { npx playwright test }

Step "Production build" { npm run build }

Write-Host ""
Write-Host "== Production-route smoke test =="
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:rootDir
    npm run start
}
Start-Sleep -Seconds 5
$smokeRoutes = @("/", "/feed", "/alerts", "/space-weather", "/sign-in", "/sign-up")
$smokeOk = $true
foreach ($route in $smokeRoutes) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000$route" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -ne 200) {
            Write-Host "FAIL: $route returned $($response.StatusCode)"
            $smokeOk = $false
        } else {
            Write-Host "PASS: $route ($($response.StatusCode))"
        }
    } catch {
        Write-Host "FAIL: $route -- $($_.Exception.Message)"
        $smokeOk = $false
    }
}
Stop-Job $serverJob | Out-Null
Remove-Job $serverJob -Force | Out-Null
$results["Production-route smoke test"] = $smokeOk

Step "Dependency audit (npm audit)" { npm audit --audit-level=high }

Write-Host ""
Write-Host "== Lighthouse baseline (optional -- best-effort, fetches lighthouse via npx on first run) =="
Write-Host "This downloads the lighthouse CLI on demand outside this project's install-security guard;"
Write-Host "review before accepting if that matters for your environment."
# Needs its own running server -- the smoke-test server above is already
# stopped by this point (caught live: Lighthouse hit a closed port and
# every audit failed with CHROME_INTERSTITIAL_ERROR).
$lhServerJob = Start-Job -ScriptBlock {
    Set-Location $using:rootDir
    npm run start
}
Start-Sleep -Seconds 5
try {
    $lhDir = Join-Path $rootDir "docs\performance"
    if (-not (Test-Path $lhDir)) { New-Item -ItemType Directory -Path $lhDir | Out-Null }
    npx --yes lighthouse http://localhost:3000 --output=json --output-path="$lhDir\lighthouse-baseline.json" --chrome-flags="--headless"
    $results["Lighthouse baseline"] = ($LASTEXITCODE -eq 0)
} catch {
    Write-Host "Lighthouse baseline skipped/failed: $($_.Exception.Message)"
    $results["Lighthouse baseline"] = $false
} finally {
    Stop-Job $lhServerJob | Out-Null
    Remove-Job $lhServerJob -Force | Out-Null
}

Write-Host ""
Write-Host "=================================================="
Write-Host " Final quality gate summary"
Write-Host "=================================================="
$allPassed = $true
foreach ($key in $results.Keys) {
    $status = if ($results[$key]) { "PASS" } else { "FAIL"; $allPassed = $false }
    $color = if ($results[$key]) { "Green" } else { "Red" }
    Write-Host ("{0,-55} {1}" -f $key, $status) -ForegroundColor $color
}
Write-Host "=================================================="

if ($allPassed) {
    Write-Host "ALL CHECKS PASSED." -ForegroundColor Green
    exit 0
} else {
    Write-Host "ONE OR MORE CHECKS FAILED -- see above. Do not treat the project as complete." -ForegroundColor Red
    exit 1
}
