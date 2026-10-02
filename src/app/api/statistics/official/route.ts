import { NextResponse } from "next/server";

import {
  getRecommendationStatistics,
} from "@/lib/statistics/recommendation-statistics";

export const dynamic = "force-dynamic";

// Backward-compatible alias.
// "Official" continues to mean paid official performance.
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
        : "Unknown official statistics error";

    console.error(
      "Official statistics failed:",
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
