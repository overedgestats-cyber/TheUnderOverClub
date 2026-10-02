
$ErrorActionPreference = "Stop"

$project =
  "C:\Users\Marty\Desktop\theunderoverclub"

$packageRoot =
  Join-Path
    (Split-Path -Parent $MyInvocation.MyCommand.Path)
    "_analytics_v1"

Set-Location $project

$copyItems = @(
  "src\lib\analytics\client.ts",
  "src\components\analytics\AnalyticsProvider.tsx",
  "src\components\analytics\AnalyticsProvider.module.css",
  "src\components\analytics\TrackedCheckoutForm.tsx"
)

foreach (
  $relative in
    $copyItems
) {
  $source =
    Join-Path
      $packageRoot
      $relative

  $target =
    Join-Path
      $project
      $relative

  if (
    -not
    (Test-Path $source)
  ) {
    throw "Missing package file: $source"
  }

  New-Item `
    -ItemType Directory `
    -Force `
    -Path (
      Split-Path
        $target
        -Parent
    ) |
    Out-Null

  Copy-Item `
    $source `
    $target `
    -Force

  Write-Host `
    "Installed: $relative" `
    -ForegroundColor Green
}

# -----------------------------
# Root layout
# -----------------------------
$layoutPath =
  Join-Path
    $project
    "src\app\layout.tsx"

if (
  -not
  (Test-Path $layoutPath)
) {
  throw "Missing layout: $layoutPath"
}

$layout =
  Get-Content
    $layoutPath
    -Raw

if (
  $layout -notmatch
  'AnalyticsProvider'
) {
  $clerkImportPattern =
    '(import\s*\{\s*ClerkProvider\s*\}\s*from\s*"@clerk/nextjs";)'

  if (
    $layout -notmatch
    $clerkImportPattern
  ) {
    throw "Could not find ClerkProvider import in layout.tsx"
  }

  $layout =
    [regex]::Replace(
      $layout,
      $clerkImportPattern,
      '$1' +
      "`r`n" +
      'import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";',
      1
    )

  $childrenPattern =
    '(?s)(<ClerkProvider[^>]*>\s*)\{children\}(\s*</ClerkProvider>)'

  if (
    $layout -notmatch
    $childrenPattern
  ) {
    throw "Could not find ClerkProvider children block in layout.tsx"
  }

  $layout =
    [regex]::Replace(
      $layout,
      $childrenPattern,
      '$1<AnalyticsProvider>{children}</AnalyticsProvider>$2',
      1
    )

  Copy-Item `
    $layoutPath `
    "$layoutPath.before-analytics-v1.bak" `
    -Force

  [System.IO.File]::WriteAllText(
    $layoutPath,
    $layout,
    [System.Text.UTF8Encoding]::new($false)
  )

  Write-Host `
    "Patched root layout with AnalyticsProvider." `
    -ForegroundColor Green
}
else {
  Write-Host `
    "AnalyticsProvider is already present in layout.tsx." `
    -ForegroundColor Yellow
}

# -----------------------------
# Subscription checkout buttons
# -----------------------------
$subscriptionPath =
  Join-Path
    $project
    "src\app\subscription\page.tsx"

if (
  -not
  (Test-Path $subscriptionPath)
) {
  throw "Missing subscription page: $subscriptionPath"
}

$subscription =
  Get-Content
    $subscriptionPath
    -Raw

if (
  $subscription -notmatch
  'TrackedCheckoutForm'
) {
  $styleImport =
    'import styles from "./subscription.module.css";'

  if (
    -not
    $subscription.Contains(
      $styleImport
    )
  ) {
    throw "Could not find subscription CSS import."
  }

  $subscription =
    $subscription.Replace(
      $styleImport,
      'import TrackedCheckoutForm from "@/components/analytics/TrackedCheckoutForm";' +
      "`r`n" +
      $styleImport
    )

  $formPattern =
    '(?s)<form\s+action="/api/billing/checkout"\s+method="post">\s*<input\s+type="hidden"\s+name="plan"\s+value=\{plan\.key\}\s*/>\s*<button\s+type="submit">\s*\{plan\.key === "daily" \? "GET DAY PASS" : "CHOOSE PLAN"\}\s*</button>\s*</form>'

  if (
    $subscription -notmatch
    $formPattern
  ) {
    throw "Could not find the subscription checkout form block."
  }

  $replacement =
    @'
<TrackedCheckoutForm
                  plan={plan.key}
                  label={
                    plan.key === "daily"
                      ? "GET DAY PASS"
                      : "CHOOSE PLAN"
                  }
                />
'@

  $subscription =
    [regex]::Replace(
      $subscription,
      $formPattern,
      $replacement,
      1
    )

  Copy-Item `
    $subscriptionPath `
    "$subscriptionPath.before-analytics-v1.bak" `
    -Force

  [System.IO.File]::WriteAllText(
    $subscriptionPath,
    $subscription,
    [System.Text.UTF8Encoding]::new($false)
  )

  Write-Host `
    "Patched plan buttons with conversion events." `
    -ForegroundColor Green
}
else {
  Write-Host `
    "TrackedCheckoutForm already present." `
    -ForegroundColor Yellow
}

# -----------------------------
# Stripe success / cancel URLs
# -----------------------------
$checkoutPath =
  Join-Path
    $project
    "src\app\api\billing\checkout\route.ts"

if (
  -not
  (Test-Path $checkoutPath)
) {
  throw "Missing Stripe checkout route: $checkoutPath"
}

$checkout =
  Get-Content
    $checkoutPath
    -Raw

$changedCheckout =
  $false

if (
  $checkout.Contains(
    '${origin}/account?checkout=success'
  )
) {
  $checkout =
    $checkout.Replace(
      '${origin}/account?checkout=success',
      '${origin}/account?checkout=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}'
    )

  $changedCheckout =
    $true
}

if (
  $checkout.Contains(
    '${origin}/subscription?checkout=cancelled'
  )
) {
  $checkout =
    $checkout.Replace(
      '${origin}/subscription?checkout=cancelled',
      '${origin}/subscription?checkout=cancelled&plan=${plan}'
    )

  $changedCheckout =
    $true
}

if (
  $changedCheckout
) {
  Copy-Item `
    $checkoutPath `
    "$checkoutPath.before-analytics-v1.bak" `
    -Force

  [System.IO.File]::WriteAllText(
    $checkoutPath,
    $checkout,
    [System.Text.UTF8Encoding]::new($false)
  )

  Write-Host `
    "Patched Stripe success/cancel URLs for conversion attribution." `
    -ForegroundColor Green
}
else {
  Write-Host `
    "Stripe analytics query parameters are already present or URL format differs." `
    -ForegroundColor Yellow
}

Write-Host ""
Write-Host "ANALYTICS / CONVERSION V1 INSTALLED" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next:" -ForegroundColor White
Write-Host "1. npm run build"
Write-Host "2. Add NEXT_PUBLIC_GA_MEASUREMENT_ID and/or NEXT_PUBLIC_META_PIXEL_ID"
Write-Host "3. Restart npm run dev after changing .env.local"
Write-Host ""
