import "server-only";

import {
  currentUser,
} from "@clerk/nextjs/server";
import {
  randomInt,
} from "node:crypto";

import {
  getPaidEntitlement,
} from "@/lib/auth/entitlement";
import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";
import {
  getSofiaDate,
} from "@/lib/time/sofia";

import {
  FREE_DAILY_ATTEMPTS,
  GOAL_EXP,
  monthKeyFromDate,
  PREMIUM_DAILY_ATTEMPTS,
  SAVE_EXP,
  SAVE_PROBABILITY,
  SHOT_ZONES,
  type ShotZone,
} from "./config";

type AttemptRow = {
  id: string;
  attempt_number: number;
  shot_zone: ShotZone;
  keeper_zone: ShotZone;
  outcome: "goal" | "save";
  rule_exp_delta: number;
  applied_exp_delta: number;
  created_at: string;
};

type MonthlyRow = {
  clerk_user_id: string;
  display_name: string;
  exp: number;
  goals: number;
  saves: number;
  shots: number;
  updated_at: string;
};

type ProfileRow = {
  lifetime_exp: number;
  lifetime_goals: number;
  lifetime_saves: number;
  lifetime_shots: number;
};

function db() {
  return createAdminSupabaseClient() as any;
}

async function displayNameForUser(
  userId: string,
) {
  try {
    const user =
      await currentUser();

    if (
      user &&
      user.id === userId
    ) {
      const fullName =
        [
          user.firstName,
          user.lastName,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();

      if (fullName) {
        return fullName.slice(0, 40);
      }

      if (user.username) {
        return user.username.slice(0, 40);
      }

      const email =
        user.primaryEmailAddress
          ?.emailAddress;

      if (email) {
        return email
          .split("@")[0]
          .slice(0, 40);
      }
    }
  } catch (
    error
  ) {
    console.warn(
      "[Penalty Game] Could not read Clerk profile:",
      error,
    );
  }

  return `PLAYER ${userId.slice(-6).toUpperCase()}`;
}

export async function gameAccess(
  userId: string,
) {
  const date =
    getSofiaDate();

  const entitlement =
    await getPaidEntitlement(
      userId,
      date,
    );

  const premiumGameAccess =
    entitlement.isAdmin ||
    entitlement.hasSubscriptionAccess;

  return {
    date,
    monthKey:
      monthKeyFromDate(date),
    dailyLimit:
      premiumGameAccess
        ? PREMIUM_DAILY_ATTEMPTS
        : FREE_DAILY_ATTEMPTS,
    gameTier:
      premiumGameAccess
        ? "premium"
        : "free",
    entitlement,
  } as const;
}

async function ensureProfile(
  userId: string,
  monthKey: string,
) {
  const client = db();

  const displayName =
    await displayNameForUser(
      userId,
    );

  const {
    error: profileError,
  } = await client
    .from("game_profiles")
    .upsert(
      {
        clerk_user_id:
          userId,
        display_name:
          displayName,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "clerk_user_id",
      },
    );

  if (profileError) {
    throw new Error(
      `Could not sync game profile: ${profileError.message}`,
    );
  }

  const {
    error: monthError,
  } = await client
    .from(
      "game_monthly_stats",
    )
    .upsert(
      {
        clerk_user_id:
          userId,
        month_key:
          monthKey,
        display_name:
          displayName,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "clerk_user_id,month_key",
      },
    );

  if (monthError) {
    throw new Error(
      `Could not sync monthly game profile: ${monthError.message}`,
    );
  }

  return displayName;
}

export async function getLeaderboard(
  monthKey: string,
  currentUserId?: string,
) {
  const client = db();

  const {
    data,
    error,
  } = await client
    .from(
      "game_monthly_stats",
    )
    .select(
      "clerk_user_id,display_name,exp,goals,saves,shots,updated_at",
    )
    .eq(
      "month_key",
      monthKey,
    )
    .gt(
      "shots",
      0,
    )
    .order(
      "exp",
      {
        ascending: false,
      },
    )
    .order(
      "goals",
      {
        ascending: false,
      },
    )
    .order(
      "updated_at",
      {
        ascending: true,
      },
    )
    .limit(500);

  if (error) {
    throw new Error(
      `Could not load game leaderboard: ${error.message}`,
    );
  }

  const rows =
    (data ?? []) as MonthlyRow[];

  const ranked =
    rows.map(
      (
        row,
        index,
      ) => ({
        rank:
          index + 1,
        userId:
          row.clerk_user_id,
        displayName:
          row.display_name,
        exp:
          Number(
            row.exp,
          ),
        goals:
          Number(
            row.goals,
          ),
        saves:
          Number(
            row.saves,
          ),
        shots:
          Number(
            row.shots,
          ),
      }),
    );

  return {
    monthKey,
    top:
      ranked.slice(
        0,
        10,
      ),
    current:
      currentUserId
        ? ranked.find(
            (row) =>
              row.userId ===
              currentUserId,
          ) ??
          null
        : null,
  };
}

export async function getGameState(
  userId: string,
) {
  const access =
    await gameAccess(
      userId,
    );

  await ensureProfile(
    userId,
    access.monthKey,
  );

  const client = db();

  const [
    attemptsResult,
    monthResult,
    profileResult,
    leaderboard,
  ] =
    await Promise.all([
      client
        .from(
          "game_attempts",
        )
        .select(
          "id,attempt_number,shot_zone,keeper_zone,outcome,rule_exp_delta,applied_exp_delta,created_at",
        )
        .eq(
          "clerk_user_id",
          userId,
        )
        .eq(
          "game_date",
          access.date,
        )
        .order(
          "attempt_number",
          {
            ascending: true,
          },
        ),
      client
        .from(
          "game_monthly_stats",
        )
        .select(
          "exp,goals,saves,shots",
        )
        .eq(
          "clerk_user_id",
          userId,
        )
        .eq(
          "month_key",
          access.monthKey,
        )
        .single(),
      client
        .from(
          "game_profiles",
        )
        .select(
          "lifetime_exp,lifetime_goals,lifetime_saves,lifetime_shots",
        )
        .eq(
          "clerk_user_id",
          userId,
        )
        .single(),
      getLeaderboard(
        access.monthKey,
        userId,
      ),
    ]);

  if (
    attemptsResult.error
  ) {
    throw new Error(
      `Could not load today's penalty attempts: ${attemptsResult.error.message}`,
    );
  }

  if (monthResult.error) {
    throw new Error(
      `Could not load monthly game stats: ${monthResult.error.message}`,
    );
  }

  if (profileResult.error) {
    throw new Error(
      `Could not load lifetime game stats: ${profileResult.error.message}`,
    );
  }

  const attempts =
    (
      attemptsResult.data ??
      []
    ) as AttemptRow[];

  const month =
    monthResult.data as {
      exp: number;
      goals: number;
      saves: number;
      shots: number;
    };

  const profile =
    profileResult.data as ProfileRow;

  return {
    date:
      access.date,
    monthKey:
      access.monthKey,
    gameTier:
      access.gameTier,
    dailyLimit:
      access.dailyLimit,
    attemptsUsed:
      attempts.length,
    attemptsRemaining:
      Math.max(
        0,
        access.dailyLimit -
          attempts.length,
      ),
    attempts:
      attempts.map(
        (attempt) => ({
          id:
            attempt.id,
          attemptNumber:
            Number(
              attempt.attempt_number,
            ),
          shotZone:
            attempt.shot_zone,
          keeperZone:
            attempt.keeper_zone,
          outcome:
            attempt.outcome,
          ruleExpDelta:
            Number(
              attempt.rule_exp_delta,
            ),
          appliedExpDelta:
            Number(
              attempt.applied_exp_delta,
            ),
          createdAt:
            attempt.created_at,
        }),
      ),
    monthly: {
      exp:
        Number(month.exp),
      goals:
        Number(
          month.goals,
        ),
      saves:
        Number(
          month.saves,
        ),
      shots:
        Number(
          month.shots,
        ),
    },
    lifetime: {
      exp:
        Number(
          profile.lifetime_exp,
        ),
      goals:
        Number(
          profile.lifetime_goals,
        ),
      saves:
        Number(
          profile.lifetime_saves,
        ),
      shots:
        Number(
          profile.lifetime_shots,
        ),
    },
    leaderboard,
  };
}

function chooseKeeperZone(
  shotZone: ShotZone,
) {
  const saved =
    randomInt(
      0,
      10_000,
    ) <
    Math.round(
      SAVE_PROBABILITY *
        10_000,
    );

  if (saved) {
    return {
      saved:
        true,
      keeperZone:
        shotZone,
    } as const;
  }

  const alternatives =
    SHOT_ZONES.filter(
      (zone) =>
        zone !==
        shotZone,
    );

  return {
    saved:
      false,
    keeperZone:
      alternatives[
        randomInt(
          0,
          alternatives.length,
        )
      ],
  } as const;
}

export async function playShot({
  userId,
  shotZone,
}: {
  userId: string;
  shotZone: ShotZone;
}) {
  const access =
    await gameAccess(
      userId,
    );

  const displayName =
    await ensureProfile(
      userId,
      access.monthKey,
    );

  const keeper =
    chooseKeeperZone(
      shotZone,
    );

  const outcome =
    keeper.saved
      ? "save"
      : "goal";

  const ruleExpDelta =
    outcome === "goal"
      ? GOAL_EXP
      : SAVE_EXP;

  const client = db();

  const {
    data,
    error,
  } = await client.rpc(
    "play_penalty_shot",
    {
      p_user_id:
        userId,
      p_display_name:
        displayName,
      p_game_date:
        access.date,
      p_month_key:
        access.monthKey,
      p_daily_limit:
        access.dailyLimit,
      p_shot_zone:
        shotZone,
      p_keeper_zone:
        keeper.keeperZone,
      p_outcome:
        outcome,
      p_rule_exp_delta:
        ruleExpDelta,
    },
  );

  if (error) {
    const message =
      String(
        error.message ??
        "",
      );

    if (
      message.includes(
        "daily_limit_reached",
      )
    ) {
      const limitError =
        new Error(
          "Daily penalty limit reached",
        );

      (
        limitError as Error & {
          code?: string;
        }
      ).code =
        "DAILY_LIMIT_REACHED";

      throw limitError;
    }

    throw new Error(
      `Penalty shot could not be stored: ${message}`,
    );
  }

  const row =
    (
      data ??
      []
    )[0];

  if (!row) {
    throw new Error(
      "Penalty shot returned no result",
    );
  }

  const leaderboard =
    await getLeaderboard(
      access.monthKey,
      userId,
    );

  return {
    result: {
      attemptId:
        row.attempt_id,
      attemptNumber:
        Number(
          row.attempt_number,
        ),
      shotZone,
      keeperZone:
        keeper.keeperZone,
      outcome,
      ruleExpDelta,
      appliedExpDelta:
        Number(
          row.applied_exp_delta,
        ),
    },
    state: {
      date:
        access.date,
      monthKey:
        access.monthKey,
      gameTier:
        access.gameTier,
      dailyLimit:
        access.dailyLimit,
      attemptsUsed:
        Number(
          row.attempt_number,
        ),
      attemptsRemaining:
        Math.max(
          0,
          access.dailyLimit -
            Number(
              row.attempt_number,
            ),
        ),
      monthly: {
        exp:
          Number(
            row.monthly_exp,
          ),
        goals:
          Number(
            row.monthly_goals,
          ),
        saves:
          Number(
            row.monthly_saves,
          ),
        shots:
          Number(
            row.monthly_shots,
          ),
      },
      lifetime: {
        exp:
          Number(
            row.lifetime_exp,
          ),
        goals:
          Number(
            row.lifetime_goals,
          ),
        saves:
          Number(
            row.lifetime_saves,
          ),
        shots:
          Number(
            row.lifetime_shots,
          ),
      },
      leaderboard,
    },
  };
}
