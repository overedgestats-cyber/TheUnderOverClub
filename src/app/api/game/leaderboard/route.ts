import {
  auth,
} from "@clerk/nextjs/server";

import {
  monthKeyFromDate,
} from "@/lib/game/config";
import {
  getLeaderboard,
} from "@/lib/game/server";
import {
  getSofiaDate,
} from "@/lib/time/sofia";

export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    const {
      userId,
    } =
      await auth();

    const monthKey =
      monthKeyFromDate(
        getSofiaDate(),
      );

    const leaderboard =
      await getLeaderboard(
        monthKey,
        userId ??
          undefined,
      );

    return Response.json({
      ok: true,
      leaderboard,
    });
  } catch (
    error
  ) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown leaderboard error";

    return Response.json(
      {
        ok: false,
        error:
          message,
      },
      {
        status: 500,
      },
    );
  }
}
