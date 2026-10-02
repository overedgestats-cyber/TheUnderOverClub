$ErrorActionPreference = "Stop"

$project =
  "C:\Users\Marty\Desktop\theunderoverclub"

Set-Location $project

$keyLine = Get-Content ".env.local" |
  Where-Object {
    $_ -match '^\s*INTERNAL_API_SECRET='
  } |
  Select-Object -Last 1

if (-not $keyLine) {
  throw "INTERNAL_API_SECRET was not found in .env.local"
}

$key = (
  ($keyLine -split "=", 2)[1]
).Trim().Trim('"').Trim("'")

$body = "{}"

if ($args.Count -gt 0) {
  $date = $args[0]

  if (
    $date -notmatch
    '^\d{4}-\d{2}-\d{2}$'
  ) {
    throw "Date must use YYYY-MM-DD format"
  }

  $body = @{
    date = $date
  } | ConvertTo-Json
}

$result = Invoke-RestMethod `
  -Uri "http://localhost:3000/api/admin/analysis-day-preview" `
  -Method Post `
  -Headers @{
    Authorization = "Bearer $key"
  } `
  -ContentType "application/json" `
  -Body $body

Write-Host ""
Write-Host "PAID ANALYSIS PREVIEW - EXACT MARKET IDS" -ForegroundColor Cyan
Write-Host "Date: $($result.date) | Fixtures: $($result.fixtureCount) | Qualifying recommendations: $($result.qualifyingRecommendationCount)"
Write-Host ""

foreach ($match in $result.matches) {
  Write-Host "[$($match.competition)] $($match.match)" -ForegroundColor Yellow
  Write-Host "Fixture ID: $($match.providerFixtureId) | Kickoff: $($match.kickoffAt)"
  Write-Host ("xG estimate: {0} - {1} | Total {2}" -f `
    $match.expectedGoals.home, `
    $match.expectedGoals.away, `
    $match.expectedGoals.total)

  $table = foreach ($candidate in $match.candidates) {
    [pscustomobject]@{
      Market = $candidate.market
      Pick = $candidate.selection
      "Model %" = $candidate.modelProbabilityPct
      Odds = $candidate.odds
      Source = $candidate.oddsSource
      "Fair Book %" = $candidate.bookmakerProbabilityPct
      "Edge %" = $candidate.valueEdgePct
      "Confidence %" = $candidate.confidencePct
      Label = $candidate.confidenceLabel
      Qualifies = $candidate.qualifies
    }
  }

  $table | Format-Table -AutoSize

  if ($match.qualifyingRecommendations.Count -gt 0) {
    Write-Host "QUALIFYING PICKS:" -ForegroundColor Green

    foreach ($pick in $match.qualifyingRecommendations) {
      Write-Host (
        "  {0} | {1} | Odds {2} ({3}) | Model {4}% | Fair Book {5}% | Edge {6}% | Confidence {7}% ({8})" -f `
        $pick.market, `
        $pick.selection, `
        $pick.odds, `
        $pick.oddsSource, `
        $pick.modelProbabilityPct, `
        $pick.bookmakerProbabilityPct, `
        $pick.valueEdgePct, `
        $pick.confidencePct, `
        $pick.confidenceLabel
      ) -ForegroundColor Green
    }
  }
  else {
    Write-Host "No qualifying recommendation." -ForegroundColor DarkGray
  }

  Write-Host ""
}
