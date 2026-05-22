param(
  [string]$WebUrl = "",
  [string]$MobileUrl = ""
)

$ErrorActionPreference = "Stop"

function Resolve-BaseUrl {
  param(
    [string]$Name,
    [string]$Preferred,
    [string[]]$Candidates
  )

  if ($Preferred) {
    return $Preferred
  }

  foreach ($candidate in $Candidates) {
    try {
      Invoke-WebRequest -Uri $candidate -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 5 -ErrorAction Stop | Out-Null
      Write-Output "Using $Name URL: $candidate"
      return $candidate
    } catch {
      if ($_.Exception.Response) {
        Write-Output "Using $Name URL: $candidate"
        return $candidate
      }
    }
  }

  throw "Unable to resolve $Name URL. Provide it explicitly using script parameters."
}

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

$resolvedWebUrl = Resolve-BaseUrl -Name "web" -Preferred $WebUrl -Candidates @("http://localhost:3010", "http://localhost:3000")
$resolvedMobileUrl = Resolve-BaseUrl -Name "mobile" -Preferred $MobileUrl -Candidates @("http://localhost:8090", "http://localhost:8081", "http://localhost:8082")

$results += Test-Endpoint -Name "web health" -Url "$resolvedWebUrl/api/health" -Expected @(200)
$results += Test-Endpoint -Name "web home" -Url "$resolvedWebUrl/" -Expected @(200)
$results += Test-Endpoint -Name "web login" -Url "$resolvedWebUrl/login" -Expected @(200)
$results += Test-Endpoint -Name "web signup" -Url "$resolvedWebUrl/signup" -Expected @(200)
$results += Test-Endpoint -Name "web events (protected)" -Url "$resolvedWebUrl/events" -Expected @(200, 307)
$results += Test-Endpoint -Name "mobile web root" -Url "$resolvedMobileUrl/" -Expected @(200)

if ($results -contains $false) {
  exit 1
}

Write-Output "All smoke checks passed."
