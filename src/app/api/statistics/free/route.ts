import { NextResponse } from "next/server";

import {
  getRecommendationStatistics,
} from "@/lib/statistics/recommendation-statistics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const statistics =
      await getRecommendationStatistics(
        "free",
      );

    return NextResponse.json({
      ok: true,
      statistics,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown free statistics error";

    console.error(
      "Free statistics failed:",
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
