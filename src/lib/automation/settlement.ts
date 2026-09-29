import "server-only";

import {
  automationDates,
} from "@/lib/automation/dates";
import {
  settleFreePicks,
} from "@/lib/settlement/settle-free-picks";
import {
  settlePaidAnalysis,
} from "@/lib/settlement/settle-paid-analysis";

export async function runSettlementReconciliation() {
  const {
    today,
    yesterday,
    twoDaysAgo,
  } = automationDates();

  const dates = [
    twoDaysAgo,
    yesterday,
    today,
  ];

  const results = [];

  for (const date of dates) {
    const [
      free,
      paid,
    ] = await Promise.all([
      settleFreePicks({
        date,
        commit: true,
      }),
      settlePaidAnalysis({
        date,
        commit: true,
      }),
    ]);

    results.push({
      date,
      free,
      paid,
    });
  }

  return {
    job:
      "settlement",
    timezone:
      "Europe/Sofia",
    ranAt:
      new Date()
        .toISOString(),
    dates,
    results,
  };
}
