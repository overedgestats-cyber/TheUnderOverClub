import "server-only";

import {
  getSofiaDate,
} from "@/lib/time/sofia";

function shiftDate(
  date: string,
  days: number,
) {
  const value =
    new Date(
      `${date}T12:00:00Z`,
    );

  value.setUTCDate(
    value.getUTCDate() +
      days,
  );

  return value
    .toISOString()
    .slice(0, 10);
}

export function automationDates(
  input = new Date(),
) {
  const today =
    getSofiaDate(input);

  return {
    twoDaysAgo:
      shiftDate(
        today,
        -2,
      ),
    yesterday:
      shiftDate(
        today,
        -1,
      ),
    today,
    tomorrow:
      shiftDate(
        today,
        1,
      ),
  };
}
