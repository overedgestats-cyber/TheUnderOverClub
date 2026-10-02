import type {
  NextRequest,
} from "next/server";

import {
  isAuthorizedCron,
} from "@/lib/automation/cron-auth";
import {
  runFreeOddsEnrichment,
} from "@/lib/automation/free-odds";

export const dynamic =
  "force-dynamic";

export const maxDuration = 60;

export async function GET(
  request: NextRequest,
) {
  try {
    if (
      !isAuthorizedCron(
        request,
      )
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const result =
      await runFreeOddsEnrichment();

    return Response.json({
      ok: true,
      schedule:
        request.headers.get(
          "x-vercel-cron-schedule",
        ),
      window:
        "morning",
      ...result,
    });
  } catch (
    error
  ) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown morning odds cron error";

    console.error(
      "Morning odds cron failed:",
      error,
    );

    return Response.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}
