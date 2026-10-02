$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
Set-Location $project

$path = Join-Path $project "src\lib\paid-board\create-paid-board.ts"

if (-not (Test-Path $path)) {
  throw "Missing file: $path"
}

$content = Get-Content $path -Raw

$old = @'
  const fixtures =
    await getPaidFixturesForDate(date);

  const deadlineAt =
    getSofiaPublicationDeadline(date);
'@

$new = @'
  const fixturesForDate =
    await getPaidFixturesForDate(date);

  const publicationCutoffMs =
    Date.now();

  const fixtures =
    fixturesForDate.filter(
      (fixture) => {
        const kickoffAt =
          new Date(
            fixture.kickoff_at,
          ).getTime();

        return (
          Number.isFinite(
            kickoffAt,
          ) &&
          kickoffAt >
            publicationCutoffMs
        );
      },
    );

  const excludedStartedFixtureCount =
    fixturesForDate.length -
    fixtures.length;

  if (
    excludedStartedFixtureCount >
    0
  ) {
    console.warn(
      `[Paid board] Excluded ${excludedStartedFixtureCount} already-started/invalid-kickoff fixtures from ${date} before immutable publication.`,
    );
  }

  const deadlineAt =
    getSofiaPublicationDeadline(date);
'@

if (-not $content.Contains($old)) {
  throw "Could not find the paid-fixtures publication block. No file was changed."
}

$content = $content.Replace(
  $old,
  $new
)

$oldConfig = @'
          stage: "fixture_board_only",
        },
'@

$newConfig = @'
          stage: "fixture_board_only",
          preKickoffOnly: true,
          excludedStartedFixtureCount,
        },
'@

if ($content.Contains($oldConfig)) {
  $content = $content.Replace(
    $oldConfig,
    $newConfig
  )
}
else {
  Write-Host "Warning: config_snapshot marker was not found; publication filtering is still installed." -ForegroundColor Yellow
}

# Add the excluded count to the newly-created result if the exact return block is present.
$oldReturnTail = @'
    publishedLate:
      publishedRunRow.published_late ?? false,
  };
'@

$newReturnTail = @'
    publishedLate:
      publishedRunRow.published_late ?? false,
    excludedStartedFixtureCount,
  };
'@

if ($content.Contains($oldReturnTail)) {
  $content = $content.Replace(
    $oldReturnTail,
    $newReturnTail
  )
}

Copy-Item $path "$path.before-future-only-v1.bak" -Force

[System.IO.File]::WriteAllText(
  $path,
  $content,
  [System.Text.UTF8Encoding]::new($false)
)

Write-Host ""
Write-Host "Paid-board future-only publication filter installed." -ForegroundColor Green
Write-Host "Updated: src\lib\paid-board\create-paid-board.ts" -ForegroundColor White
Write-Host ""
Write-Host "Behavior:" -ForegroundColor Cyan
Write-Host "- reads all paid-scope fixtures for the Sofia calendar date"
Write-Host "- excludes kickoff_at <= actual publication time"
Write-Host "- excludes invalid kickoff timestamps"
Write-Host "- only remaining future fixtures become immutable daily_board_fixtures"
Write-Host "- logs how many fixtures were excluded"
Write-Host ""
Write-Host "Backup:" -ForegroundColor DarkGray
Write-Host "src\lib\paid-board\create-paid-board.ts.before-future-only-v1.bak" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Next: npm run build" -ForegroundColor Yellow
