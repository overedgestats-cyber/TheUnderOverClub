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

$targets = @(
  @{ slug = "premier-league"; search = "Premier League"; country = "England" },
  @{ slug = "ligue-1"; search = "Ligue 1"; country = "France" },
  @{ slug = "bundesliga"; search = "Bundesliga"; country = "Germany" },
  @{ slug = "serie-a"; search = "Serie A"; country = "Italy" },
  @{ slug = "laliga"; search = "La Liga"; country = "Spain" },

  @{ slug = "efl-championship"; search = "Championship"; country = "England" },
  @{ slug = "segunda-division"; search = "Segunda Division"; country = "Spain" },
  @{ slug = "serie-b"; search = "Serie B"; country = "Italy" },
  @{ slug = "2-bundesliga"; search = "2. Bundesliga"; country = "Germany" },
  @{ slug = "ligue-2"; search = "Ligue 2"; country = "France" },

  @{ slug = "uefa-champions-league"; search = "UEFA Champions League"; country = "World" },
  @{ slug = "uefa-europa-league"; search = "UEFA Europa League"; country = "World" },
  @{ slug = "uefa-conference-league"; search = "UEFA Europa Conference League"; country = "World" },
  @{ slug = "uefa-super-cup"; search = "UEFA Super Cup"; country = "World" },

  @{ slug = "fifa-world-cup"; search = "World Cup"; country = "World" },
  @{ slug = "uefa-euro"; search = "Euro Championship"; country = "World" },
  @{ slug = "uefa-nations-league"; search = "UEFA Nations League"; country = "World" },
  @{ slug = "afcon"; search = "Africa Cup of Nations"; country = "World" },
  @{ slug = "copa-america"; search = "Copa America"; country = "World" },
  @{ slug = "concacaf"; search = "CONCACAF"; country = "World" },

  @{ slug = "copa-libertadores"; search = "CONMEBOL Libertadores"; country = "World" },
  @{ slug = "afc-champions-league"; search = "AFC Champions League"; country = "World" }
)

$rows = @()

foreach ($target in $targets) {
  $encoded = [uri]::EscapeDataString($target.search)
  $url = "https://v3.football.api-sports.io/leagues?search=$encoded"

  $response = Invoke-RestMethod `
    -Uri $url `
    -Method Get `
    -Headers @{ "x-apisports-key" = $apiKey }

  if ($response.errors -and $response.errors.Count -gt 0) {
    throw "API error for $($target.search): $($response.errors | ConvertTo-Json -Compress)"
  }

  foreach ($item in @($response.response)) {
    $activeSeasons = @(
      $item.seasons |
        Where-Object { $_.current -eq $true } |
        ForEach-Object { $_.year }
    )

    $rows += [pscustomobject]@{
      slug = $target.slug
      searched = $target.search
      expected_country = $target.country
      league_id = $item.league.id
      league_name = $item.league.name
      league_type = $item.league.type
      country = $item.country.name
      active_seasons = ($activeSeasons -join ",")
    }
  }
}

$outputPath = Join-Path $project "paid_competition_candidates.csv"
$rows |
  Sort-Object slug, league_id |
  Export-Csv -Path $outputPath -NoTypeInformation -Encoding UTF8

$rows |
  Sort-Object slug, league_id |
  Format-Table slug, league_id, league_name, country, active_seasons -AutoSize

Write-Host ""
Write-Host "Saved candidates to:" -ForegroundColor Green
Write-Host $outputPath
