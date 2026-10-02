import { NextResponse } from "next/server";

import {
  getCombinedStatistics,
} from "@/lib/statistics/recommendation-statistics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const statistics =
      await getCombinedStatistics();

    return NextResponse.json({
      ok: true,
      statistics,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown statistics overview error";

    console.error(
      "Statistics overview failed:",
      error,
    );

    return NextResponse.json(
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
