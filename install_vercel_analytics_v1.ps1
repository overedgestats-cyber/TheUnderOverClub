$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
Set-Location $project

$layoutPath = Join-Path $project "src\app\layout.tsx"

if (-not (Test-Path -LiteralPath $layoutPath)) {
  throw "Missing layout: $layoutPath"
}

$content = Get-Content -LiteralPath $layoutPath -Raw

Copy-Item `
  -LiteralPath $layoutPath `
  -Destination "$layoutPath.before-vercel-analytics-v1.bak" `
  -Force

# Remove the custom analytics provider import if it exists.
$content = [regex]::Replace(
  $content,
  '(?m)^\s*import\s+AnalyticsProvider\s+from\s+["'']@/components/analytics/AnalyticsProvider["''];?\s*\r?\n',
  ''
)

# Add Vercel Analytics import if missing.
if ($content -notmatch '@vercel/analytics/next') {
  $importLine = 'import { Analytics } from "@vercel/analytics/next";'

  $clerkImportPattern =
    '(?s)(import\s*\{\s*ClerkProvider\s*\}\s*from\s*["'']@clerk/nextjs["''];?)'

  if ($content -notmatch $clerkImportPattern) {
    throw "Could not find ClerkProvider import in layout.tsx"
  }

  $content = [regex]::Replace(
    $content,
    $clerkImportPattern,
    '$1' + "`r`n" + $importLine,
    1
  )
}

# Remove custom provider wrapper if present.
$content = [regex]::Replace(
  $content,
  '(?s)<AnalyticsProvider>\s*\{children\}\s*</AnalyticsProvider>',
  '{children}'
)

# Add <Analytics /> immediately after ClerkProvider if missing.
if ($content -notmatch '<Analytics\s*/>') {
  $providerClose = '</ClerkProvider>'

  if (-not $content.Contains($providerClose)) {
    throw "Could not find closing ClerkProvider tag in layout.tsx"
  }

  $content = $content.Replace(
    $providerClose,
    $providerClose + "`r`n          <Analytics />"
  )
}

[System.IO.File]::WriteAllText(
  $layoutPath,
  $content,
  [System.Text.UTF8Encoding]::new($false)
)

Write-Host ""
Write-Host "Vercel Analytics installed in src\app\layout.tsx" -ForegroundColor Green
Write-Host "Custom AnalyticsProvider wrapper removed if it was present." -ForegroundColor Cyan
Write-Host "Backup: src\app\layout.tsx.before-vercel-analytics-v1.bak" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Next: npm run build" -ForegroundColor Yellow
