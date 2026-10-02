param(
  [int]$FixtureId = 1576135
)

$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
Set-Location $project

$keyLine = Get-Content ".env.local" |
  Where-Object { $_ -match '^\s*API_FOOTBALL_KEY=' } |
  Select-Object -Last 1

if (-not $keyLine) {
  throw "API_FOOTBALL_KEY was not found in .env.local"
}

$apiKey = (($keyLine -split "=", 2)[1]).Trim().Trim('"').Trim("'")

$page = 1
$totalPages = 1
$rows = @()
$allBookmakers = @()

do {
  $url = "https://v3.football.api-sports.io/odds?fixture=$FixtureId&page=$page"

  $response = Invoke-RestMethod `
    -Uri $url `
    -Method Get `
    -Headers @{ "x-apisports-key" = $apiKey }

  if ($response.errors -and $response.errors.Count -gt 0) {
    throw "API-Football error: $($response.errors | ConvertTo-Json -Compress)"
  }

  if ($response.paging -and $response.paging.total) {
    $totalPages = [int]$response.paging.total
  }

  foreach ($item in @($response.response)) {
    foreach ($bookmaker in @($item.bookmakers)) {
      $allBookmakers += [pscustomobject]@{
        Page = $page
        BookmakerId = $bookmaker.id
        Bookmaker = $bookmaker.name
      }

      foreach ($bet in @($bookmaker.bets)) {
        $betName = [string]$bet.name

        if (
          $betName -match '(?i)btts' -or
          $betName -match '(?i)both.*team' -or
          $betName -match '(?i)team.*score'
        ) {
          foreach ($value in @($bet.values)) {
            $rows += [pscustomobject]@{
              Page = $page
              BookmakerId = $bookmaker.id
              Bookmaker = $bookmaker.name
              BetId = $bet.id
              BetName = $bet.name
              Value = $value.value
              Odd = $value.odd
            }
          }
        }
      }
    }
  }

  $page++
} while ($page -le $totalPages)

Write-Host ""
Write-Host "BOOKMAKERS RETURNED FOR FIXTURE $FixtureId" -ForegroundColor Cyan
$allBookmakers |
  Sort-Object BookmakerId, Bookmaker -Unique |
  Format-Table -AutoSize

Write-Host ""
Write-Host "BTTS / BOTH-TEAMS-TO-SCORE-LIKE MARKETS" -ForegroundColor Cyan

if ($rows.Count -eq 0) {
  Write-Host "No matching BTTS-like markets were returned." -ForegroundColor Yellow
}
else {
  $rows |
    Sort-Object Bookmaker, BetId, Value |
    Format-Table Page, BookmakerId, Bookmaker, BetId, BetName, Value, Odd -AutoSize
}

$outputPath = Join-Path $project "odds_debug_$FixtureId.csv"
$rows |
  Sort-Object Bookmaker, BetId, Value |
  Export-Csv -Path $outputPath -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "Saved detailed results to:" -ForegroundColor Green
Write-Host $outputPath
