export const PRODUCT_TIMEZONE = "Europe/Sofia";

export function getSofiaDate(
  input = new Date(),
): string {
  const parts = new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: PRODUCT_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(input);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function isValidDateString(
  value: string,
): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
