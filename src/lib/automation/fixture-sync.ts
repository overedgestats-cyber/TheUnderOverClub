import "server-only";

import {
  automationDates,
} from "@/lib/automation/dates";
import {
  importFixturesForDate,
} from "@/lib/fixtures/import-fixtures";

export async function runFixtureSync() {
  const {
    twoDaysAgo,
    yesterday,
    today,
    tomorrow,
  } = automationDates();

  const dates = [
    twoDaysAgo,
    yesterday,
    today,
    tomorrow,
  ];

  const results = [];

  for (const date of dates) {
    results.push(
      await importFixturesForDate(
        date,
      ),
    );
  }

  return {
    job:
      "fixture-sync",
    timezone:
      "Europe/Sofia",
    ranAt:
      new Date()
        .toISOString(),
    dates,
    results,
  };
}
