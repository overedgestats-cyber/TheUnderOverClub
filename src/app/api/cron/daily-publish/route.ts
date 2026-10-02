import type {
  NextRequest,
} from "next/server";

import {
  runDailyAutoPublish,
} from "@/lib/automation/daily-publish";
import {
  getSofiaDate,
} from "@/lib/time/sofia";

export const dynamic =
  "force-dynamic";

export const maxDuration =
  300;

function isAuthorized(
  request:
    NextRequest,
) {
  const provided =
    request.headers.get(
      "authorization",
    );

  const allowedSecrets =
    [
      process.env
        .CRON_SECRET,
      process.env
        .INTERNAL_API_SECRET,
    ]
      .map(
        (value) =>
          value?.trim(),
      )
      .filter(
        (
          value,
        ): value is string =>
          Boolean(
            value,
          ),
      );

  if (
    allowedSecrets
      .length ===
    0
  ) {
    throw new Error(
      "Missing CRON_SECRET and INTERNAL_API_SECRET",
    );
  }

  return allowedSecrets
    .some(
      (secret) =>
        provided ===
        `Bearer ${secret}`,
    );
}

export async function GET(
  request:
    NextRequest,
) {
  try {
    if (
      !isAuthorized(
        request,
      )
    ) {
      return Response.json(
        {
          ok:
            false,
          error:
            "Unauthorized",
        },
        {
          status:
            401,
        },
      );
    }

    const date =
      getSofiaDate();

    const result =
      await runDailyAutoPublish(
        date,
      );

    return Response.json(
      result,
      {
        status:
          result.ok
            ? 200
            : 500,
      },
    );
  } catch (
    error
  ) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown daily publication error";

    console.error(
      "[daily-publish] fatal error",
      error,
    );

    return Response.json(
      {
        ok:
          false,
        date:
          getSofiaDate(),
        status:
          "failed",
        error:
          message,
      },
      {
        status:
          500,
      },
    );
  }
}
