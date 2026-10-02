import {
  auth,
} from "@clerk/nextjs/server";

import {
  isShotZone,
} from "@/lib/game/config";
import {
  playShot,
} from "@/lib/game/server";

export const dynamic =
  "force-dynamic";

export async function POST(
  request:
    Request,
) {
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

    const body =
      await request
        .json()
        .catch(
          () => ({}),
        ) as {
          zone?: unknown;
        };

    if (
      !isShotZone(
        body.zone,
      )
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "Invalid shot zone",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await playShot({
        userId,
        shotZone:
          body.zone,
      });

    return Response.json({
      ok: true,
      ...result,
    });
  } catch (
    error
  ) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown penalty shot error";

    const code =
      (
        error as
          | (
              Error & {
                code?: string;
              }
            )
          | null
      )?.code;

    console.error(
      "[Penalty Game shoot]",
      error,
    );

    return Response.json(
      {
        ok: false,
        error:
          message,
      },
      {
        status:
          code ===
          "DAILY_LIMIT_REACHED"
            ? 409
            : 500,
      },
    );
  }
}
