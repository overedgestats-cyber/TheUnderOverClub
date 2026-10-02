param([string]$ProjectPath = 'C:\Users\Marty\Desktop\TheUnderOverClub')
$ErrorActionPreference = 'Stop'
$ProjectPath = (Resolve-Path $ProjectPath).Path
if (!(Test-Path (Join-Path $ProjectPath 'package.json'))) { throw 'Select the actual project folder.' }
$manifest = Get-Content (Join-Path $PSScriptRoot 'manifest.json') -Raw | ConvertFrom-Json
# Verify all files before changing any of them; do not overwrite newer local work.
foreach ($item in $manifest) {
  $target = Join-Path $ProjectPath $item.path
  if ($item.originalHash) {
    if (!(Test-Path $target)) { throw "Missing original file: $($item.path)" }
    $hash = (Get-FileHash $target -Algorithm SHA256).Hash.ToLower()
    if ($hash -ne $item.originalHash -and $hash -ne $item.updatedHash) { throw "Local file changed since upload: $($item.path). Stop and share this filename in chat." }
  } elseif (Test-Path $target) {
    if ((Get-FileHash $target -Algorithm SHA256).Hash.ToLower() -ne $item.updatedHash) { throw "Newer local file already exists: $($item.path)" }
  }
}
$backup = Join-Path (Split-Path $ProjectPath -Parent) ('TUOC-backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
foreach ($item in $manifest) {
  $target = Join-Path $ProjectPath $item.path
  if (Test-Path $target) {
    $backupFile = Join-Path $backup $item.path
    New-Item (Split-Path $backupFile -Parent) -ItemType Directory -Force | Out-Null
    Copy-Item $target $backupFile
  }
  New-Item (Split-Path $target -Parent) -ItemType Directory -Force | Out-Null
  Copy-Item (Join-Path (Join-Path $PSScriptRoot 'payload') $item.path) $target -Force
}
Write-Host "Installed. Backup: $backup"
Write-Host 'Next: open a terminal in your project folder and run npm run build, then npx vercel --prod.'
Write-Host 'After deployment: node scripts/settle-history.mjs --from 2026-08-01'
Write-Host 'To settle verified final results: node scripts/settle-history.mjs --from 2026-08-01 --commit'
