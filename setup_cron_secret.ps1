$ErrorActionPreference =
  "Stop"

$project =
  "C:\Users\Marty\Desktop\theunderoverclub"

Set-Location $project

$envFile =
  Join-Path $project ".env.local"

if (
  -not (
    Test-Path $envFile
  )
) {
  New-Item `
    -ItemType File `
    -Path $envFile `
    -Force |
    Out-Null
}

$existingLine =
  Get-Content $envFile |
  Where-Object {
    $_ -match
      '^\s*CRON_SECRET='
  } |
  Select-Object -Last 1

if ($existingLine) {
  $secret =
    (($existingLine -split "=", 2)[1]).
    Trim().
    Trim('"').
    Trim("'")
} else {
  $bytes =
    New-Object byte[] 32

  $rng =
    [System.Security.Cryptography.RandomNumberGenerator]::Create()

  try {
    $rng.GetBytes($bytes)
  } finally {
    $rng.Dispose()
  }

  $secret =
    -join (
      $bytes |
      ForEach-Object {
        $_.ToString("x2")
      }
    )

  Add-Content `
    -Path $envFile `
    -Value "`r`nCRON_SECRET=$secret"
}

Write-Host ""
Write-Host "Local CRON_SECRET is configured." -ForegroundColor Green
Write-Host "The value is not printed." -ForegroundColor DarkGray

$vercel =
  Get-Command vercel `
    -ErrorAction SilentlyContinue

if (-not $vercel) {
  Write-Host ""
  Write-Host "Vercel CLI is not installed." -ForegroundColor Yellow
  Write-Host "Add CRON_SECRET to the Production environment in the Vercel dashboard before deploying." -ForegroundColor Yellow
  Write-Host "You can view your local value yourself with:" -ForegroundColor DarkGray
  Write-Host '  Get-Content .env.local | Select-String "^CRON_SECRET="' -ForegroundColor DarkGray
  exit 0
}

Write-Host ""
Write-Host "Adding the same secret to the linked Vercel Production environment..." -ForegroundColor Cyan

$secret |
  vercel env add `
    CRON_SECRET `
    production `
    --sensitive `
    --force

if (
  $LASTEXITCODE -ne 0
) {
  throw "Vercel CLI could not configure CRON_SECRET. Confirm this folder is linked and that you are logged in."
}

Write-Host ""
Write-Host "CRON_SECRET is configured locally and in Vercel Production." -ForegroundColor Green
