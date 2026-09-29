import type { NextRequest } from "next/server";

export function isAuthorizedCron(
  request: NextRequest,
) {
  const secret =
    process.env.CRON_SECRET;

  if (!secret) {
    throw new Error(
      "Missing CRON_SECRET",
    );
  }

  return (
    request.headers.get(
      "authorization",
    ) ===
    `Bearer ${secret}`
  );
}
