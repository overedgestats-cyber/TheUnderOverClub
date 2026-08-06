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

function getSofiaOffsetForDate(
  date: string,
): string {
  const reference = new Date(`${date}T12:00:00Z`);

  const offsetPart = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: PRODUCT_TIMEZONE,
      timeZoneName: "shortOffset",
      hour: "2-digit",
    },
  )
    .formatToParts(reference)
    .find((part) => part.type === "timeZoneName")
    ?.value;

  const match = offsetPart?.match(
    /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/,
  );

  if (!match) {
    throw new Error(
      `Could not determine ${PRODUCT_TIMEZONE} offset for ${date}`,
    );
  }

  const [, sign, hour, minute = "00"] = match;

  return `${sign}${hour.padStart(2, "0")}:${minute}`;
}

export function getSofiaPublicationDeadline(
  date: string,
): string {
  const offset = getSofiaOffsetForDate(date);

  return new Date(
    `${date}T07:30:00${offset}`,
  ).toISOString();
}
