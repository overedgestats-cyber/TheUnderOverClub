$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
Set-Location $project

$homePath = Join-Path $project "src\app\page.tsx"

if (-not (Test-Path $homePath)) {
  throw "Missing homepage: $homePath"
}

$homeContent = Get-Content $homePath -Raw

if ($homeContent -match 'href="/terms"') {
  Write-Host "Homepage legal footer links are already present." -ForegroundColor Yellow
  Write-Host "Nothing else to patch." -ForegroundColor DarkGray
  exit 0
}

$footerStart = $homeContent.IndexOf('<footer className={styles.footer}>')

if ($footerStart -lt 0) {
  throw "Could not find homepage footer block."
}

$footerNavStart = $homeContent.IndexOf('<nav>', $footerStart)

if ($footerNavStart -lt 0) {
  throw "Could not find footer navigation block."
}

$footerNavEnd = $homeContent.IndexOf('</nav>', $footerNavStart)

if ($footerNavEnd -lt 0) {
  throw "Could not find footer navigation closing tag."
}

$legalLinks = @'
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

$homeContent =
  $homeContent.Substring(0, $footerNavEnd) +
  $legalLinks +
  $homeContent.Substring($footerNavEnd)

Copy-Item $homePath "$homePath.before-trust-legal-v3.bak" -Force

[System.IO.File]::WriteAllText(
  $homePath,
  $homeContent,
  [System.Text.UTF8Encoding]::new($false)
)

Write-Host ""
Write-Host "Homepage legal footer links installed." -ForegroundColor Green
Write-Host "Added: Terms / Privacy / Responsible Play / Contact" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backup:" -ForegroundColor DarkGray
Write-Host "src\app\page.tsx.before-trust-legal-v3.bak" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Next: npm run build" -ForegroundColor White
