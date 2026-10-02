import { NextResponse } from "next/server";

import {
  getRecommendationStatistics,
} from "@/lib/statistics/recommendation-statistics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const statistics =
      await getRecommendationStatistics(
        "paid",
      );

    return NextResponse.json({
      ok: true,
      statistics,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown paid statistics error";

    console.error(
      "Paid statistics failed:",
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
