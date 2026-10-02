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

  if (-not (Test-Path $source)) {
    # If the ZIP was extracted directly into the project, the target itself
    # is already the installed file.
    if (Test-Path $target) {
      Write-Host "Already installed: $relative" -ForegroundColor DarkGray
      continue
    }

    throw "Missing source and target file: $relative"
  }

  New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null

  $sourceFull = [System.IO.Path]::GetFullPath($source)
  $targetFull = [System.IO.Path]::GetFullPath($target)

  if ($sourceFull -ieq $targetFull) {
    Write-Host "Already installed: $relative" -ForegroundColor DarkGray
    continue
  }

  Copy-Item $source $target -Force
  Write-Host "Installed: $relative" -ForegroundColor Green
}

$homePath = Join-Path $project "src\app\page.tsx"

if (-not (Test-Path $homePath)) {
  throw "Missing homepage: $homePath"
}

$home = Get-Content $homePath -Raw

if ($home -match 'href="/terms"') {
  Write-Host "Homepage legal footer links are already present." -ForegroundColor Yellow
}
else {
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
    Copy-Item $homePath "$homePath.before-trust-legal-v2.bak" -Force
    $home = $home.Replace($marker, $addition)

    [System.IO.File]::WriteAllText(
      $homePath,
      $home,
      [System.Text.UTF8Encoding]::new($false)
    )

    Write-Host "Homepage footer links added." -ForegroundColor Green
  }
  else {
    Write-Host "Could not auto-patch homepage footer. Legal routes are still installed." -ForegroundColor Yellow
    Write-Host "Send the bottom of src\app\page.tsx and it can be patched safely." -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "Trust/legal installer v2 complete." -ForegroundColor Cyan
Write-Host "Now run: npm run build" -ForegroundColor White
