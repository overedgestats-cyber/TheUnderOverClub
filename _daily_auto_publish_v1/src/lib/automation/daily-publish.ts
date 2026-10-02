import "server-only";

import {
  storePaidAnalysis,
} from "@/lib/analysis/store-paid-analysis";
import {
  importFixturesForDate,
} from "@/lib/fixtures/import-fixtures";
import {
  publishFreePicks,
} from "@/lib/free-picks/free-picks-storage";
import {
  publishPaidBoard,
} from "@/lib/paid-board/create-paid-board";
import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";
import {
  getSofiaDate,
} from "@/lib/time/sofia";

type StageResult = {
  stage: string;
  ok: boolean;
  status:
    | "completed"
    | "already_complete"
    | "skipped"
    | "failed";
  detail?: unknown;
  error?: string;
};

type CountResult = {
  trackingRows: number;
  officialPicks: number;
};

function adminDb() {
  return createAdminSupabaseClient() as any;
}

function errorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : String(error);
}

async function paidCounts(
  publicationRunId: string,
): Promise<CountResult> {
  const db =
    adminDb();

  const [
    trackingResult,
    officialResult,
  ] =
    await Promise.all([
      db
        .from(
          "market_analysis_snapshots",
        )
        .select(
          "id",
          {
            count:
              "exact",
            head:
              true,
          },
        )
        .eq(
          "publication_run_id",
          publicationRunId,
        ),
      db
        .from(
          "recommendations",
        )
        .select(
          "id",
          {
            count:
              "exact",
            head:
              true,
          },
        )
        .eq(
          "publication_run_id",
          publicationRunId,
        ),
    ]);

  if (
    trackingResult.error
  ) {
    throw new Error(
      `Could not count paid tracking rows: ${trackingResult.error.message}`,
    );
  }

  if (
    officialResult.error
  ) {
    throw new Error(
      `Could not count official paid picks: ${officialResult.error.message}`,
    );
  }

  return {
    trackingRows:
      trackingResult.count ??
      0,
    officialPicks:
      officialResult.count ??
      0,
  };
}

export async function runDailyAutoPublish(
  date =
    getSofiaDate(),
) {
  const startedAt =
    new Date()
      .toISOString();

  const stages:
    StageResult[] =
      [];

  let fixtureImport:
    unknown = null;

  let freePicks:
    unknown = null;

  let paidBoard:
    any = null;

  let paidAnalysis:
    unknown = null;

  try {
    fixtureImport =
      await importFixturesForDate(
        date,
      );

    stages.push({
      stage:
        "fixture_import",
      ok:
        true,
      status:
        "completed",
      detail:
        fixtureImport,
    });
  } catch (
    error
  ) {
    const message =
      errorMessage(
        error,
      );

    stages.push({
      stage:
        "fixture_import",
      ok:
        false,
      status:
        "failed",
      error:
        message,
    });

    return {
      ok:
        false,
      date,
      startedAt,
      finishedAt:
        new Date()
          .toISOString(),
      status:
        "failed",
      stages,
    };
  }

  try {
    const preview:
      any =
      await publishFreePicks({
        date,
        commit:
          false,
      });

    if (
      preview
        ?.immutable ===
        true
    ) {
      freePicks =
        preview;

      stages.push({
        stage:
          "free_picks",
        ok:
          true,
        status:
          "already_complete",
        detail:
          preview,
      });
    } else if (
      preview
        ?.mode ===
        "dry_run" &&
      typeof preview
        ?.reviewToken ===
        "string" &&
      preview
        .reviewToken
        .length >
        0
    ) {
      const committed:
        any =
        await publishFreePicks({
          date,
          commit:
            true,
          reviewedToken:
            preview
              .reviewToken,
        });

      if (
        committed
          ?.immutable !==
          true ||
        committed
          ?.pickCount !==
          2
      ) {
        throw new Error(
          committed
            ?.message ??
            "Automatic Free Picks commit did not produce an immutable two-pick slate.",
        );
      }

      freePicks =
        committed;

      stages.push({
        stage:
          "free_picks",
        ok:
          true,
        status:
          "completed",
        detail:
          committed,
      });
    } else {
      throw new Error(
        preview
          ?.message ??
          "Free Picks dry run did not produce a valid signed two-pick slate.",
      );
    }
  } catch (
    error
  ) {
    stages.push({
      stage:
        "free_picks",
      ok:
        false,
      status:
        "failed",
      error:
        errorMessage(
          error,
        ),
    });
  }

  try {
    paidBoard =
      await publishPaidBoard(
        date,
      );

    stages.push({
      stage:
        "paid_board",
      ok:
        true,
      status:
        paidBoard
          ?.created ===
          false
          ? "already_complete"
          : "completed",
      detail:
        paidBoard,
    });
  } catch (
    error
  ) {
    stages.push({
      stage:
        "paid_board",
      ok:
        false,
      status:
        "failed",
      error:
        errorMessage(
          error,
        ),
    });
  }

  if (
    paidBoard
      ?.publicationRunId
  ) {
    try {
      const publicationRunId =
        String(
          paidBoard
            .publicationRunId,
        );

      const fixtureCount =
        Number(
          paidBoard
            .fixtureCount ??
            0,
        );

      const expectedTrackingRows =
        fixtureCount *
        4;

      const before =
        await paidCounts(
          publicationRunId,
        );

      if (
        fixtureCount ===
        0
      ) {
        paidAnalysis = {
          skipped:
            true,
          reason:
            "No future paid-scope fixtures were published for this date.",
          ...before,
        };

        stages.push({
          stage:
            "paid_analysis",
          ok:
            true,
          status:
            "skipped",
          detail:
            paidAnalysis,
        });
      } else if (
        before
          .trackingRows ===
        expectedTrackingRows
      ) {
        paidAnalysis = {
          alreadyStored:
            true,
          expectedTrackingRows,
          ...before,
        };

        stages.push({
          stage:
            "paid_analysis",
          ok:
            true,
          status:
            "already_complete",
          detail:
            paidAnalysis,
        });
      } else if (
        before
          .trackingRows >
        0
      ) {
        throw new Error(
          [
            "Partial paid-analysis dataset detected.",
            `Expected ${expectedTrackingRows} tracking rows`,
            `but found ${before.trackingRows}.`,
            "Automatic retry was blocked to preserve publication integrity.",
          ].join(
            " ",
          ),
        );
      } else {
        const stored:
          any =
          await storePaidAnalysis(
            date,
          );

        const after =
          await paidCounts(
            publicationRunId,
          );

        if (
          after
            .trackingRows !==
          expectedTrackingRows
        ) {
          throw new Error(
            `Paid analysis storage verification failed: expected ${expectedTrackingRows} tracking rows, found ${after.trackingRows}.`,
          );
        }

        paidAnalysis = {
          ...stored,
          verifiedTrackingRows:
            after
              .trackingRows,
          verifiedOfficialPicks:
            after
              .officialPicks,
        };

        stages.push({
          stage:
            "paid_analysis",
          ok:
            true,
          status:
            "completed",
          detail:
            paidAnalysis,
        });
      }
    } catch (
      error
    ) {
      stages.push({
        stage:
          "paid_analysis",
        ok:
          false,
        status:
          "failed",
        error:
          errorMessage(
            error,
        ),
      });
    }
  } else {
    stages.push({
      stage:
        "paid_analysis",
      ok:
        false,
      status:
        "failed",
      error:
        "Paid board was not available, so paid analysis could not run.",
    });
  }

  const failedStages =
    stages.filter(
      (stage) =>
        !stage.ok,
    );

  const result = {
    ok:
      failedStages
        .length ===
      0,
    date,
    startedAt,
    finishedAt:
      new Date()
        .toISOString(),
    status:
      failedStages
        .length ===
      0
        ? "completed"
        : "partial_failure",
    fixtureImport,
    freePicks,
    paidBoard,
    paidAnalysis,
    stages,
  };

  if (
    result.ok
  ) {
    console.log(
      "[daily-publish] completed",
      result,
    );
  } else {
    console.error(
      "[daily-publish] partial failure",
      result,
    );
  }

  return result;
}
