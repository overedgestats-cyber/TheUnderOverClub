$ErrorActionPreference = "Stop"

$required = @(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET"
)

$prices = @(
  "STRIPE_PRICE_DAILY",
  "STRIPE_PRICE_WEEKLY",
  "STRIPE_PRICE_MONTHLY",
  "STRIPE_PRICE_YEARLY"
)

$envPath =
  "C:\Users\Marty\Desktop\theunderoverclub\.env.local"

if (-not (Test-Path $envPath)) {
  throw ".env.local not found"
}

$lines =
  Get-Content $envPath

Write-Host ""
Write-Host "AUTH/BILLING ENV CHECK" -ForegroundColor Cyan

foreach ($name in $required) {
  $found =
    $lines |
    Where-Object {
      $_ -match "^\s*$([regex]::Escape($name))="
    } |
    Select-Object -Last 1

  if ($found) {
    Write-Host "$name : configured" -ForegroundColor Green
  } else {
    Write-Host "$name : MISSING" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "AGREED PRICE IDS" -ForegroundColor Cyan

foreach ($name in $prices) {
  $found =
    $lines |
    Where-Object {
      $_ -match "^\s*$([regex]::Escape($name))="
    } |
    Select-Object -Last 1

  if ($found) {
    Write-Host "$name : configured" -ForegroundColor Green
  } else {
    Write-Host "$name : MISSING" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "Expected Stripe configuration:" -ForegroundColor Cyan
Write-Host "Daily   EUR 2.49   one-time"
Write-Host "Weekly  EUR 6.99   recurring weekly"
Write-Host "Monthly EUR 17.99  recurring monthly"
Write-Host "Yearly  EUR 119.99 recurring yearly"
Write-Host ""
Write-Host "No secret values were printed." -ForegroundColor DarkGray
