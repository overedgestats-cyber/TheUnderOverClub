import {
  getSofiaDate,
} from "@/lib/time/sofia";

export function shiftDate(
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

export function automationDates() {
  const today =
    getSofiaDate();

  return {
    today,
    tomorrow:
      shiftDate(
        today,
        1,
      ),
    yesterday:
      shiftDate(
        today,
        -1,
      ),
    twoDaysAgo:
      shiftDate(
        today,
        -2,
      ),
  };
}
