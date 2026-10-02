$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
$packageRoot = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "_analytics_v2"

Set-Location $project

$files = @(
  "src\lib\analytics\client.ts",
  "src\components\analytics\AnalyticsProvider.tsx",
  "src\components\analytics\AnalyticsProvider.module.css",
  "src\components\analytics\TrackedCheckoutForm.tsx",
  "src\app\layout.tsx",
  "src\app\subscription\page.tsx"
)

foreach ($relative in $files) {
  $source = Join-Path $packageRoot $relative
  $target = Join-Path $project $relative
  $targetDirectory = Split-Path -Parent $target

  if (-not (Test-Path -LiteralPath $source)) {
    throw "Missing package file: $source"
  }

  New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null

  if (Test-Path -LiteralPath $target) {
    Copy-Item -LiteralPath $target -Destination "$target.before-analytics-v2.bak" -Force
  }

  Copy-Item -LiteralPath $source -Destination $target -Force
  Write-Host "Installed: $relative" -ForegroundColor Green
}

Write-Host ""
Write-Host "Analytics + conversion v2 installed." -ForegroundColor Cyan
Write-Host "This version intentionally does NOT modify the Stripe checkout route yet." -ForegroundColor Yellow
Write-Host "Next: npm run build" -ForegroundColor White
