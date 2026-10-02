$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
Set-Location $project

$path = Join-Path $project "src\lib\analysis\store-paid-analysis.ts"

if (-not (Test-Path $path)) {
  throw "Missing file: $path"
}

$content = Get-Content $path -Raw

$pattern = '(?s)function ensurePreKickoff\(\s*fixtures:\s*FixtureRow\[\],\s*\)\s*\{.*?\n\}'

$replacement = @'
function ensurePreKickoff(
  fixtures: FixtureRow[],
) {
  const now = Date.now();

  const started =
    fixtures.filter(
      (fixture) => {
        const kickoffAt =
          new Date(
            fixture.kickoff_at,
          ).getTime();

        return (
          !Number.isFinite(
            kickoffAt,
          ) ||
          kickoffAt <= now
        );
      },
    );

  if (
    started.length === 0
  ) {
    return;
  }

  const eligible =
    fixtures.filter(
      (fixture) => {
        const kickoffAt =
          new Date(
            fixture.kickoff_at,
          ).getTime();

        return (
          Number.isFinite(
            kickoffAt,
          ) &&
          kickoffAt > now
        );
      },
    );

  const skippedNames =
    started
      .map(
        (fixture) =>
          `${fixture.home_team_name} vs ${fixture.away_team_name}`,
      )
      .join(", ");

  console.warn(
    `[Paid analysis] Skipping ${started.length} already-started/invalid-kickoff fixtures. ${skippedNames}`,
  );

  if (
    eligible.length === 0
  ) {
    throw new Error(
      "No pre-kickoff paid fixtures remain. Refusing to save historical paid analysis.",
    );
  }

  /*
   * Mutate the existing array in place.
   * The caller already holds `fixtures` as a const array, so this safely
   * removes started fixtures without changing the rest of the storage flow.
   */
  fixtures.splice(
    0,
    fixtures.length,
    ...eligible,
  );
}
'@

$updated = [regex]::Replace(
  $content,
  $pattern,
  $replacement,
  1
)

if ($updated -eq $content) {
  throw "Could not locate ensurePreKickoff(). No file was changed."
}

Copy-Item $path "$path.before-pre-kickoff-guard-v3.bak" -Force

[System.IO.File]::WriteAllText(
  $path,
  $updated,
  [System.Text.UTF8Encoding]::new($false)
)

Write-Host ""
Write-Host "Pre-kickoff storage guard v3 installed." -ForegroundColor Green
Write-Host "Started fixtures will now be skipped instead of aborting the whole commit." -ForegroundColor Cyan
Write-Host "If every fixture has already started, the commit will still be refused." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backup created:" -ForegroundColor DarkGray
Write-Host "src\lib\analysis\store-paid-analysis.ts.before-pre-kickoff-guard-v3.bak" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Next run: npm run build" -ForegroundColor White
