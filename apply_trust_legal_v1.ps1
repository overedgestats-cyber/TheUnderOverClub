
$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
$package = Split-Path -Parent $MyInvocation.MyCommand.Path

Set-Location $project

$copyItems = @(
  "src\components\legal\LegalShell.tsx",
  "src\components\legal\LegalShell.module.css",
  "src\app\terms\page.tsx",
  "src\app\privacy\page.tsx",
  "src\app\responsible-play\page.tsx",
  "src\app\contact\page.tsx"
)

foreach ($relative in $copyItems) {
  $source = Join-Path $package $relative
  $target = Join-Path $project $relative

  New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
  Copy-Item $source $target -Force
}

$homePath = Join-Path $project "src\app\page.tsx"

if (Test-Path $homePath) {
  $home = Get-Content $homePath -Raw

  if ($home -notmatch 'href="/terms"') {
    $marker = @'
            <Link
              href={
                isSignedIn
                  ? "/account"
                  : "/sign-in"
              }
            >
              {isSignedIn
                ? "Account"
                : "Sign In"}
            </Link>
'@

    $addition = $marker + @'

            <Link href="/terms">
              Terms
            </Link>
            <Link href="/privacy">
              Privacy
            </Link>
            <Link href="/responsible-play">
              Responsible Play
            </Link>
            <Link href="/contact">
              Contact
            </Link>
'@

    if ($home.Contains($marker)) {
      Copy-Item $homePath "$homePath.before-trust-legal-v1.bak" -Force
      $home = $home.Replace($marker, $addition)
      [System.IO.File]::WriteAllText(
        $homePath,
        $home,
        [System.Text.UTF8Encoding]::new($false)
      )

      Write-Host "Homepage footer links added." -ForegroundColor Green
    }
    else {
      Write-Host "Homepage footer marker not found. Legal pages were installed, but footer links were not patched automatically." -ForegroundColor Yellow
    }
  }
  else {
    Write-Host "Homepage already contains legal links." -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "Trust/legal pages installed:" -ForegroundColor Cyan
Write-Host "/terms"
Write-Host "/privacy"
Write-Host "/responsible-play"
Write-Host "/contact"
Write-Host ""
Write-Host "Next: npm run build" -ForegroundColor White
