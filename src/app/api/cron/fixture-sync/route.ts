import type {
  NextRequest,
} from "next/server";

import {
  isAuthorizedCron,
} from "@/lib/automation/cron-auth";
import {
  runFixtureSync,
} from "@/lib/automation/fixture-sync";

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
      await runFixtureSync();

    return Response.json({
      ok: true,
      schedule:
        request.headers.get(
          "x-vercel-cron-schedule",
        ),
      ...result,
    });
  } catch (
    error
  ) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown fixture cron error";

    console.error(
      "Fixture cron failed:",
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
