$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
$scriptDir = Split-Path -Parent $PSCommandPath
$packageRoot = [System.IO.Path]::Combine(
  $scriptDir,
  "_analytics_purchase_v3"
)

Set-Location $project

$files = @(
  "src\app\api\billing\checkout\route.ts",
  "src\lib\analytics\client.ts",
  "src\components\analytics\AnalyticsProvider.tsx"
)

foreach ($relative in $files) {
  $source = [System.IO.Path]::Combine(
    $packageRoot,
    $relative
  )

  $target = [System.IO.Path]::Combine(
    $project,
    $relative
  )

  if (-not (Test-Path -LiteralPath $source)) {
    throw "Missing package file: $source"
  }

  $targetDirectory = Split-Path -Parent $target

  New-Item `
    -ItemType Directory `
    -Path $targetDirectory `
    -Force | Out-Null

  if (Test-Path -LiteralPath $target) {
    Copy-Item `
      -LiteralPath $target `
      -Destination "$target.before-analytics-purchase-v4.bak" `
      -Force
  }

  Copy-Item `
    -LiteralPath $source `
    -Destination $target `
    -Force

  Write-Host "Installed: $relative" -ForegroundColor Green
}

Write-Host ""
Write-Host "Analytics purchase attribution v4 installed." -ForegroundColor Cyan
Write-Host "Stripe entitlement and webhook logic remain unchanged." -ForegroundColor Yellow
Write-Host "Next: npm run build" -ForegroundColor White
