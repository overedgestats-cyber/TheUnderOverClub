$ErrorActionPreference = "Stop"

$project =
  "C:\Users\Marty\Desktop\theunderoverclub"

$packageRoot =
  Join-Path
    (Split-Path -Parent $MyInvocation.MyCommand.Path)
    "_analytics_purchase_v3"

Set-Location $project

$files = @(
  "src\app\api\billing\checkout\route.ts",
  "src\lib\analytics\client.ts",
  "src\components\analytics\AnalyticsProvider.tsx"
)

foreach ($relative in $files) {
  $source =
    Join-Path $packageRoot $relative

  $target =
    Join-Path $project $relative

  if (
    -not
    (Test-Path -LiteralPath $source)
  ) {
    throw "Missing package file: $source"
  }

  New-Item `
    -ItemType Directory `
    -Path (
      Split-Path -Parent $target
    ) `
    -Force |
    Out-Null

  if (
    Test-Path -LiteralPath $target
  ) {
    Copy-Item `
      -LiteralPath $target `
      -Destination "$target.before-analytics-purchase-v3.bak" `
      -Force
  }

  Copy-Item `
    -LiteralPath $source `
    -Destination $target `
    -Force

  Write-Host "Installed: $relative" -ForegroundColor Green
}

Write-Host ""
Write-Host "Analytics purchase attribution v3 installed." -ForegroundColor Cyan
Write-Host "Stripe entitlement/webhooks are unchanged." -ForegroundColor Yellow
Write-Host "Next: npm run build" -ForegroundColor White
