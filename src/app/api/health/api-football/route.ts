import { NextResponse } from "next/server";

import { getApiFootballStatus } from "@/lib/api-football/client";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error: "Not found",
      },
      {
        status: 404,
      },
    );
  }

  try {
    const status = await getApiFootballStatus();

    const currentRequests =
      status.requests?.current ?? 0;

    const dailyLimit =
      status.requests?.limit_day ?? 0;

    return NextResponse.json({
      ok: true,
      api: "connected",
      subscription: {
        plan: status.subscription?.plan ?? null,
        active: status.subscription?.active ?? false,
        end: status.subscription?.end ?? null,
      },
      requests: {
        current: currentRequests,
        limitDay: dailyLimit,
        remaining: Math.max(
          dailyLimit - currentRequests,
          0,
        ),
      },
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown API-Football connection error";

    console.error(
      "API-Football health check failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        api: "connection_failed",
        message,
      },
      {
        status: 500,
      },
    );
  }
}
