param(
  [string]$Date = "",
  [switch]$Commit
)

$ErrorActionPreference = "Stop"

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

$key =
  (($keyLine -split "=", 2)[1]).
  Trim().
  Trim('"').
  Trim("'")

if (-not $Date) {
  $Date =
    (Get-Date).ToString("yyyy-MM-dd")
}

$reviewFile =
  ".free-picks-review-$Date.json"

if (-not $Commit) {
  $body = @{
    date = $Date
    commit = $false
  } | ConvertTo-Json

  $result =
    Invoke-RestMethod `
      -Uri "http://localhost:3000/api/admin/publish-free-picks" `
      -Method Post `
      -Headers @{
        Authorization = "Bearer $key"
      } `
      -ContentType "application/json" `
      -Body $body

  Write-Host ""
  Write-Host "FREE PICKS REVIEW" -ForegroundColor Cyan
  Write-Host "Date: $($result.date)"
  Write-Host "Picks: $($result.pickCount)"
  Write-Host ""

  foreach ($pick in $result.picks) {
    Write-Host "#$($pick.rank) $($pick.home) vs $($pick.away)" -ForegroundColor Yellow
    Write-Host "Competition: $($pick.competition)"
    Write-Host "Kickoff: $($pick.kickoffAt)"
    Write-Host "Pick: $($pick.selection)"
    Write-Host "Model: $($pick.modelProbabilityPct)% | Confidence: $($pick.confidencePct)% [$($pick.priorityBand)]"
    Write-Host "Odds: $($pick.odds) | Source: $($pick.oddsSource)"
    Write-Host ""
  }

  if (-not $result.reviewToken) {
    Write-Host "No review token was produced. Nothing can be committed." -ForegroundColor Red
    $result | ConvertTo-Json -Depth 30
    exit 1
  }

  @{
    date = $result.date
    reviewToken = $result.reviewToken
    picks = $result.picks
  } |
    ConvertTo-Json -Depth 30 |
    Set-Content `
      -Path $reviewFile `
      -Encoding UTF8

  Write-Host "Nothing was stored." -ForegroundColor DarkGray
  Write-Host "Exact reviewed slate saved to $reviewFile" -ForegroundColor DarkGray
  Write-Host "Commit will NOT rerun the model." -ForegroundColor Green
  exit
}

if (-not (Test-Path $reviewFile)) {
  throw "No reviewed slate exists for $Date. Run without -Commit first."
}

$review =
  Get-Content $reviewFile -Raw |
  ConvertFrom-Json

if (
  -not $review.reviewToken
) {
  throw "Reviewed slate file has no reviewToken. Run a fresh review first."
}

$body = @{
  date = $Date
  commit = $true
  reviewedToken =
    [string]$review.reviewToken
} | ConvertTo-Json

$result =
  Invoke-RestMethod `
    -Uri "http://localhost:3000/api/admin/publish-free-picks" `
    -Method Post `
    -Headers @{
      Authorization = "Bearer $key"
    } `
    -ContentType "application/json" `
    -Body $body

Write-Host ""
Write-Host "FREE PICKS PUBLICATION COMMIT" -ForegroundColor Cyan
Write-Host "Date: $($result.date)"
Write-Host "Committed: $($result.committed)"
Write-Host "Created: $($result.created)"
Write-Host "Message: $($result.message)"
Write-Host ""

$result |
  ConvertTo-Json -Depth 30
