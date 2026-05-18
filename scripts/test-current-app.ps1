param(
  [string]$WebUrl = "http://localhost:3000",
  [string]$MobileUrl = "http://localhost:8082"
)

$ErrorActionPreference = "Stop"

function Test-Endpoint {
  param(
    [string]$Name,
    [string]$Url,
    [int[]]$Expected
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 20 -ErrorAction Stop
    $status = [int]$response.StatusCode
  } catch {
    if ($_.Exception.Response) {
      $status = [int]$_.Exception.Response.StatusCode
    } else {
      Write-Output "FAIL  $Name  -> request error: $($_.Exception.Message)"
      return $false
    }
  }

  if ($Expected -contains $status) {
    Write-Output "PASS  $Name  -> $status"
    return $true
  }

  Write-Output "FAIL  $Name  -> $status (expected: $($Expected -join ', '))"
  return $false
}

$results = @()

$results += Test-Endpoint -Name "web health" -Url "$WebUrl/api/health" -Expected @(200)
$results += Test-Endpoint -Name "web home" -Url "$WebUrl/" -Expected @(200)
$results += Test-Endpoint -Name "web login" -Url "$WebUrl/login" -Expected @(200)
$results += Test-Endpoint -Name "web signup" -Url "$WebUrl/signup" -Expected @(200)
$results += Test-Endpoint -Name "web events (protected)" -Url "$WebUrl/events" -Expected @(200, 307)
$results += Test-Endpoint -Name "mobile web root" -Url "$MobileUrl/" -Expected @(200)

if ($results -contains $false) {
  exit 1
}

Write-Output "All smoke checks passed."
