$ErrorActionPreference =
  "Stop"

$project =
  "C:\Users\Marty\Desktop\theunderoverclub"

Set-Location $project

$path =
  Join-Path $project "vercel.json"

if (
  Test-Path $path
) {
  $stamp =
    Get-Date -Format
      "yyyyMMdd-HHmmss"

  Copy-Item `
    $path `
    "$path.backup-$stamp"

  $config =
    Get-Content `
      $path `
      -Raw |
    ConvertFrom-Json
} else {
  $config =
    [PSCustomObject]@{}

  $config |
    Add-Member `
      -NotePropertyName '$schema' `
      -NotePropertyValue 'https://openapi.vercel.sh/vercel.json'
}

$ourPaths = @(
  "/api/cron/fixture-sync",
  "/api/cron/free-odds-morning",
  "/api/cron/free-odds-afternoon",
  "/api/cron/settlement"
)

$existing = @()

if (
  $config.PSObject.Properties.Name `
    -contains "crons"
) {
  $existing =
    @(
      $config.crons |
      Where-Object {
        $ourPaths `
          -notcontains `
          [string]$_.path
      }
    )
}

$newCrons = @(
  [PSCustomObject]@{
    path =
      "/api/cron/fixture-sync"
    schedule =
      "0 15 * * *"
  },
  [PSCustomObject]@{
    path =
      "/api/cron/free-odds-morning"
    schedule =
      "0 8 * * *"
  },
  [PSCustomObject]@{
    path =
      "/api/cron/free-odds-afternoon"
    schedule =
      "0 13 * * *"
  },
  [PSCustomObject]@{
    path =
      "/api/cron/settlement"
    schedule =
      "0 4 * * *"
  }
)

$merged =
  @(
    $existing
  ) +
  $newCrons

if (
  $config.PSObject.Properties.Name `
    -contains "crons"
) {
  $config.crons =
    $merged
} else {
  $config |
    Add-Member `
      -NotePropertyName "crons" `
      -NotePropertyValue $merged
}

$config |
  ConvertTo-Json `
    -Depth 100 |
  Set-Content `
    -Path $path `
    -Encoding UTF8

Write-Host ""
Write-Host "Vercel cron configuration installed." -ForegroundColor Green
Write-Host "Existing non-Under-Over cron entries were preserved." -ForegroundColor DarkGray
Write-Host ""
Get-Content $path
