$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
Set-Location $project

$clientPath = Join-Path $project "src\lib\api-football\client.ts"

if (-not (Test-Path $clientPath)) {
  throw "Missing file: $clientPath"
}

$content = Get-Content $clientPath -Raw

$pattern = '(?s)async function reserveApiFootballRequestSlot\(\) \{.*?\n\}\n\nfunction isApiFootballRateLimitPayload'

$replacement = @'
async function reserveApiFootballRequestSlot() {
  const reservation =
    apiFootballThrottleTail.then(
      async () => {
        const now =
          Date.now();

        const waitMs =
          Math.max(
            0,
            apiFootballNextRequestAt -
              now,
          );

        if (waitMs > 0) {
          await apiFootballSleep(
            waitMs,
          );
        }

        apiFootballNextRequestAt =
          Date.now() +
          API_FOOTBALL_MIN_INTERVAL_MS;
      },
    );

  apiFootballThrottleTail =
    reservation.catch(
      () => undefined,
    );

  await reservation;
}

function isApiFootballRateLimitPayload
'@

$updated = [regex]::Replace(
  $content,
  $pattern,
  $replacement,
  1
)

if ($updated -eq $content) {
  throw "Could not locate the installed reserveApiFootballRequestSlot() block. No file was changed."
}

Copy-Item $clientPath "$clientPath.before-typescript-fix-v2.bak" -Force

[System.IO.File]::WriteAllText(
  $clientPath,
  $updated,
  [System.Text.UTF8Encoding]::new($false)
)

Write-Host ""
Write-Host "API-Football throttle TypeScript fix installed." -ForegroundColor Green
Write-Host "Backup: src\lib\api-football\client.ts.before-typescript-fix-v2.bak" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Now run:" -ForegroundColor Cyan
Write-Host "npm run build"
