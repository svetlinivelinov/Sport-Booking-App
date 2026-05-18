$ErrorActionPreference = "Stop"

if (!(Test-Path "apps/web/.env")) {
  Write-Output "apps/web/.env is missing"
  exit 1
}

$dbLine = (Get-Content "apps/web/.env" | Select-String '^DATABASE_URL=' | Select-Object -First 1).Line
$jwtLine = (Get-Content "apps/web/.env" | Select-String '^JWT_SECRET=' | Select-Object -First 1).Line

$ok = $true

if (-not $dbLine) {
  Write-Output "DATABASE_URL is missing"
  $ok = $false
} elseif ($dbLine -match 'USER:PASSWORD|localhost:5432/sport_booking|replace-with') {
  Write-Output "DATABASE_URL still looks like a placeholder"
  $ok = $false
}

if (-not $jwtLine) {
  Write-Output "JWT_SECRET is missing"
  $ok = $false
} elseif ($jwtLine -match 'replace-with|random-secret') {
  Write-Output "JWT_SECRET still looks like a placeholder"
  $ok = $false
}

if (-not $ok) {
  exit 1
}

Write-Output "Web env values look configured."
