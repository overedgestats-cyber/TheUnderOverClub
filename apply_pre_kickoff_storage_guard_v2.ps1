$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
Set-Location $project

$path = Join-Path $project "src\lib\analysis\store-paid-analysis.ts"

if (-not (Test-Path $path)) {
  throw "Missing file: $path"
}

$content = Get-Content $path -Raw

$oldGuardPattern = '(?s)function ensurePreKickoff\(\s*fixtures:\s*FixtureRow\[\],\s*\)\s*\{.*?\n\}\n'

$newGuard = @'
function splitPreKickoffFixtures(
  fixtures: FixtureRow[],
) {
  const now = Date.now();

  const eligible: FixtureRow[] = [];
  const started: FixtureRow[] = [];

  for (const fixture of fixtures) {
    const kickoffAt =
      new Date(
        fixture.kickoff_at,
      ).getTime();

    if (
      !Number.isFinite(
        kickoffAt,
      ) ||
      kickoffAt <= now
    ) {
      started.push(
        fixture,
      );
      continue;
    }

    eligible.push(
      fixture,
    );
  }

  return {
    eligible,
    started,
  };
}

function logSkippedStartedFixtures(
  date: string,
  started: FixtureRow[],
) {
  if (
    started.length === 0
  ) {
    return;
  }

  const ids =
    started
      .map(
        (fixture) =>
          String(
            (
              fixture as any
            ).provider_fixture_id ??
              (
                fixture as any
              ).id ??
              "unknown",
          ),
      )
      .join(", ");

  console.warn(
    `[Paid analysis] Skipping ${started.length} already-started/invalid-kickoff fixtures for ${date}. Fixture IDs: ${ids}`,
  );
}

'@

$updated = [regex]::Replace(
  $content,
  $oldGuardPattern,
  $newGuard,
  1
)

if ($updated -eq $content) {
  throw "Could not locate ensurePreKickoff() exactly. No file was changed."
}

$content = $updated

$boardPattern = '(?s)const\s*\{\s*run,\s*fixtures\s*\}\s*=\s*await\s+getPublishedBoard\(\s*date,\s*\);'

$boardReplacement = @'
const {
    run,
    fixtures:
      publishedFixtures,
  } =
    await getPublishedBoard(
      date,
    );

  const {
    eligible: fixtures,
    started:
      skippedStartedFixtures,
  } =
    splitPreKickoffFixtures(
      publishedFixtures,
    );

  logSkippedStartedFixtures(
    date,
    skippedStartedFixtures,
  );

  if (
    publishedFixtures.length > 0 &&
    fixtures.length === 0
  ) {
    throw new Error(
      `No pre-kickoff paid fixtures remain for ${date}. Refusing to analyze/store a historical slate.`,
    );
  }
'@

$matches = [regex]::Matches(
  $content,
  $boardPattern
).Count

if ($matches -lt 1) {
  throw "Could not find getPublishedBoard(date) destructuring. No file was changed."
}

$content = [regex]::Replace(
  $content,
  $boardPattern,
  $boardReplacement
)

$content = [regex]::Replace(
  $content,
  '(?s)\s*ensurePreKickoff\(\s*fixtures,\s*\);\s*',
  "`r`n"
)

$content = $content.Replace(
  'fixtureCount:' + "`r`n" + '      fixtures.length,',
  'publishedFixtureCount:' + "`r`n" +
  '      publishedFixtures.length,' + "`r`n" +
  '    fixtureCount:' + "`r`n" +
  '      fixtures.length,' + "`r`n" +
  '    skippedStartedFixtureCount:' + "`r`n" +
  '      skippedStartedFixtures.length,'
)

$content = $content.Replace(
  'fixtureCount:' + "`n" + '      fixtures.length,',
  'publishedFixtureCount:' + "`n" +
  '      publishedFixtures.length,' + "`n" +
  '    fixtureCount:' + "`n" +
  '      fixtures.length,' + "`n" +
  '    skippedStartedFixtureCount:' + "`n" +
  '      skippedStartedFixtures.length,'
)

Copy-Item $path "$path.before-pre-kickoff-guard-v2.bak" -Force

[System.IO.File]::WriteAllText(
  $path,
  $content,
  [System.Text.UTF8Encoding]::new($false)
)

Write-Host ""
Write-Host "Pre-kickoff paid-analysis storage guard v2 installed." -ForegroundColor Green
Write-Host "Updated: src\lib\analysis\store-paid-analysis.ts" -ForegroundColor White
Write-Host "Backup: store-paid-analysis.ts.before-pre-kickoff-guard-v2.bak" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Behavior now:" -ForegroundColor Cyan
Write-Host "- already-started fixtures are skipped, not allowed to abort future fixtures"
Write-Host "- invalid kickoff timestamps are also skipped conservatively"
Write-Host "- if every published fixture has already started, analysis/storage is refused"
Write-Host "- dry run and commit use the same pre-kickoff filtering"
Write-Host ""
Write-Host "Next: npm run build" -ForegroundColor Yellow
