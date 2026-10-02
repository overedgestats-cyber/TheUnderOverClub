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
  $url = "https://v3.football.api-sports.io/odds/bets?page=$page"

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

  foreach ($bet in @($response.response)) {
    $name = [string]$bet.name

    if (
      $name -match '(?i)^match winner$' -or
      $name -match '(?i)^goals over/under$' -or
      $name -match '(?i)^both teams score$' -or
      $name -match '(?i)^double chance$'
    ) {
      $rows += [pscustomobject]@{
        BetId = $bet.id
        BetName = $bet.name
      }
    }
  }

  $page++
} while ($page -le $totalPages)

if ($rows.Count -eq 0) {
  Write-Host "No exact target market names found." -ForegroundColor Yellow
}
else {
  Write-Host ""
  Write-Host "EXACT TARGET MARKET IDS" -ForegroundColor Cyan
  $rows |
    Sort-Object BetId -Unique |
    Format-Table -AutoSize
}
