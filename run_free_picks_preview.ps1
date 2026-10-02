param(
  [string]$Date = ""
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
      '^\s*INTERNAL_API_SECRET='
  } |
  Select-Object -Last 1

if (-not $keyLine) {
  throw "INTERNAL_API_SECRET was not found in .env.local"
}

$key = (
  ($keyLine -split "=", 2)[1]
).Trim().Trim('"').Trim("'")

$payload = @{}

if ($Date) {
  if (
    $Date -notmatch
      '^\d{4}-\d{2}-\d{2}$'
  ) {
    throw "Date must use YYYY-MM-DD format"
  }

  $payload.date =
    $Date
}

$body =
  $payload |
  ConvertTo-Json

$result =
  Invoke-RestMethod `
    -Uri "http://localhost:3000/api/admin/free-picks-preview" `
    -Method Post `
    -Headers @{
      Authorization =
        "Bearer $key"
    } `
    -ContentType "application/json" `
    -Body $body

Write-Host ""
Write-Host "FREE PICKS - OVEREDGE MODEL PREVIEW" -ForegroundColor Cyan
Write-Host "Date: $($result.date)"
Write-Host "Fixtures: $($result.fixtureCount) | Eligible: $($result.eligibleFixtureCount) | Analyzed: $($result.analyzedFixtureCount) | Picks: $($result.pickCount)"
Write-Host ""

foreach ($pick in $result.picks) {
  Write-Host "[$($pick.competition)] $($pick.homeTeam) vs $($pick.awayTeam)" -ForegroundColor Yellow
  Write-Host "Kickoff: $($pick.kickoffAt)"
  Write-Host "Pick: $($pick.displaySelection)"
  Write-Host "Model probability: $($pick.modelProbabilityPct)%"
  Write-Host "Calibrated confidence: $($pick.confidencePct)% [$($pick.priorityBand)]"
  Write-Host "Odds: $($pick.odds) | Source: $($pick.oddsSource)"
  Write-Host ""
}

Write-Host "Preview only. Nothing was stored." -ForegroundColor DarkGray
