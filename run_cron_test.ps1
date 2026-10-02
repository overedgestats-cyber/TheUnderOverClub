param(
  [Parameter(Mandatory = $true)]
  [ValidateSet(
    "fixture-sync",
    "free-odds-morning",
    "free-odds-afternoon",
    "settlement"
  )]
  [string]$Job
)

$ErrorActionPreference =
  "Stop"

$project =
  "C:\Users\Marty\Desktop\theunderoverclub"

Set-Location $project

$keyLine =
  Get-Content ".env.local" |
  Where-Object {
    $_ -match
      '^\s*CRON_SECRET='
  } |
  Select-Object -Last 1

if (-not $keyLine) {
  throw "CRON_SECRET was not found in .env.local. Run setup_cron_secret.ps1 first."
}

$key =
  (($keyLine -split "=", 2)[1]).
  Trim().
  Trim('"').
  Trim("'")

$result =
  Invoke-RestMethod `
    -Uri "http://localhost:3000/api/cron/$Job" `
    -Method Get `
    -Headers @{
      Authorization =
        "Bearer $key"
    }

$result |
  ConvertTo-Json `
    -Depth 40
