$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$package = Join-Path $root "_retro_ui_v1"

if (-not (Test-Path $package)) {
  throw "Missing _retro_ui_v1 package folder. Extract the whole ZIP before running this script."
}

Set-Location $project

$items = @(
  "src\components\retro\RetroNavigation.tsx",
  "src\components\retro\RetroShell.tsx",
  "src\components\retro\RetroShell.module.css",
  "src\components\retro\RetroHero.tsx",
  "src\components\retro\RetroHero.module.css",
  "src\components\paid-picks\PaidPicksBoard.tsx",
  "src\components\paid-picks\PaidPicksBoard.module.css",
  "src\components\free-picks\TodayFreePicks.tsx",
  "src\components\free-picks\TodayFreePicks.module.css",
  "src\components\statistics\StatisticsDashboard.tsx",
  "src\components\statistics\StatisticsDashboard.module.css",
  "src\components\legal\LegalShell.tsx",
  "src\components\legal\LegalShell.module.css",
  "src\app\page.tsx",
  "src\app\home.module.css",
  "src\app\layout.tsx",
  "src\app\today\layout.tsx",
  "src\app\paid-picks\layout.tsx",
  "src\app\paid-picks\page.tsx",
  "src\app\paid-picks\paid-picks.module.css",
  "src\app\statistics\layout.tsx",
  "src\app\subscription\layout.tsx",
  "src\app\subscription\page.tsx",
  "src\app\subscription\subscription.module.css",
  "src\app\account\layout.tsx",
  "src\app\account\page.tsx",
  "src\app\account\account.module.css",
  "src\app\robots.ts",
  "src\app\sitemap.ts",
  "src\app\manifest.ts",
  "src\app\icon.png",
  "src\app\opengraph-image.png",
  "src\app\twitter-image.png",
  "public\brand\under-over-club-logo.png"
)

foreach ($relative in $items) {
  $source = Join-Path $package $relative
  $target = Join-Path $project $relative

  if (-not (Test-Path $source)) {
    throw "Missing package file: $relative"
  }

  New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null

  if (Test-Path $target) {
    $backup = "$target.before-retro-ui-v1.bak"
    if (-not (Test-Path $backup)) {
      Copy-Item $target $backup -Force
    }
  }

  Copy-Item $source $target -Force
  Write-Host "Installed: $relative" -ForegroundColor Green
}

$conflicts = @(
  "src\app\icon.svg",
  "src\app\opengraph-image.tsx"
)

foreach ($relative in $conflicts) {
  $target = Join-Path $project $relative

  if (Test-Path $target) {
    $backup = "$target.before-retro-ui-v1.bak"

    if (-not (Test-Path $backup)) {
      Copy-Item $target $backup -Force
    }

    Remove-Item $target -Force
    Write-Host "Removed conflicting old metadata file: $relative" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "RETRO UI V1 INSTALLED" -ForegroundColor Cyan
Write-Host "Backend, prediction logic, Clerk access rules and Stripe actions were not changed." -ForegroundColor White
Write-Host ""
Write-Host "Next:" -ForegroundColor Yellow
Write-Host "npm run build"
Write-Host ""
Write-Host "If the build succeeds:" -ForegroundColor Yellow
Write-Host "npm run dev"
