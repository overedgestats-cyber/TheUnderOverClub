import {
  auth,
} from "@clerk/nextjs/server";

import {
  getGameState,
} from "@/lib/game/server";

export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    const {
      isAuthenticated,
      userId,
    } =
      await auth();

    if (
      !isAuthenticated ||
      !userId
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "Authentication required",
        },
        {
          status: 401,
        },
      );
    }

    const state =
      await getGameState(
        userId,
      );

    return Response.json({
      ok: true,
      state,
    });
  } catch (
    error
  ) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown game state error";

    console.error(
      "[Penalty Game state]",
      error,
    );

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
