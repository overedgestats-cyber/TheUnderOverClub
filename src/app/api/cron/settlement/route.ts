import type {
  NextRequest,
} from "next/server";

import {
  isAuthorizedCron,
} from "@/lib/automation/cron-auth";
import {
  runSettlementReconciliation,
} from "@/lib/automation/settlement";

export const dynamic =
  "force-dynamic";

export const maxDuration = 300;

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
      await runSettlementReconciliation();

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
        : "Unknown settlement cron error";

    console.error(
      "Settlement cron failed:",
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
