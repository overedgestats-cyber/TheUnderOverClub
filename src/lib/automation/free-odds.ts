import "server-only";

import {
  automationDates,
} from "@/lib/automation/dates";
import {
  enrichFreePickOdds,
} from "@/lib/free-picks/free-picks-storage";

export async function runFreeOddsEnrichment() {
  const {
    today,
    tomorrow,
  } = automationDates();

  const dates = [
    today,
    tomorrow,
  ];

  const results = [];

  for (const date of dates) {
    results.push(
      await enrichFreePickOdds({
        date,
        commit: true,
      }),
    );
  }

  return {
    job:
      "free-odds",
    timezone:
      "Europe/Sofia",
    ranAt:
      new Date()
        .toISOString(),
    dates,
    results,
  };
}
