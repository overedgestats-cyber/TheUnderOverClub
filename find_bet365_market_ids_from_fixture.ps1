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

do {
  $url = "https://v3.football.api-sports.io/odds?fixture=$FixtureId&page=$page"

  $response = Invoke-RestMethod `
    -Uri $url `
    -Method Get `
    -Headers @{ "x-apisports-key" = $apiKey }

  if ($response.errors -and @($response.errors).Count -gt 0) {
    $err = $response.errors | ConvertTo-Json -Compress
    if ($err -ne "[]") {
      throw "API-Football error: $err"
    }
  }

  if ($response.paging -and $response.paging.total) {
    $totalPages = [int]$response.paging.total
  }

  foreach ($item in @($response.response)) {
    foreach ($bookmaker in @($item.bookmakers)) {
      if ([string]$bookmaker.name -ne "Bet365") {
        continue
      }

      foreach ($bet in @($bookmaker.bets)) {
        $rows += [pscustomobject]@{
          BetId = [int]$bet.id
          BetName = [string]$bet.name
        }
      }
    }
  }

  $page++
} while ($page -le $totalPages)

$unique = $rows |
  Sort-Object BetId, BetName -Unique

Write-Host ""
Write-Host "ALL BET365 MARKET IDS FOR FIXTURE $FixtureId" -ForegroundColor Cyan
$unique | Format-Table -AutoSize

Write-Host ""
Write-Host "TARGET MARKET CANDIDATES" -ForegroundColor Green

$targets = $unique | Where-Object {
  $_.BetName -match '(?i)match winner|double chance|both teams score|goals over/under|over/under'
}

$targets | Format-Table -AutoSize

$outputPath = Join-Path $project "bet365_market_ids_$FixtureId.csv"
$unique | Export-Csv -Path $outputPath -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "Saved full Bet365 market list to:" -ForegroundColor Green
Write-Host $outputPath
