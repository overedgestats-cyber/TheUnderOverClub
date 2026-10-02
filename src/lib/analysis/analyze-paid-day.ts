import "server-only";

import { analyzePaidFixture } from "@/lib/analysis/analyze-paid-fixture";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSofiaDate } from "@/lib/time/sofia";

type FixtureRow = {
  provider_fixture_id: number;
  kickoff_at: string;
  competition_name: string;
  home_team_name: string;
  away_team_name: string;
};

const pct = (value: number | null) =>
  value === null
    ? null
    : Number(
        (value * 100).toFixed(2),
      );

export async function analyzePaidDay(
  date = getSofiaDate(),
) {
  const supabase =
    createAdminSupabaseClient();

  const from = new Date(
    `${date}T00:00:00Z`,
  );
  from.setUTCDate(
    from.getUTCDate() - 1,
  );

  const to = new Date(
    `${date}T00:00:00Z`,
  );
  to.setUTCDate(
    to.getUTCDate() + 2,
  );

  const { data, error } = await supabase
    .from("fixtures")
    .select(
      "provider_fixture_id,kickoff_at,competition_name,home_team_name,away_team_name",
    )
    .eq("is_paid_scope", true)
    .gte(
      "kickoff_at",
      from.toISOString(),
    )
    .lt(
      "kickoff_at",
      to.toISOString(),
    )
    .order("kickoff_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Could not read paid-scope fixtures: ${error.message}`,
    );
  }

  const fixtures = (
    (data ?? []) as unknown as FixtureRow[]
  ).filter(
    (fixture) =>
      getSofiaDate(
        new Date(
          fixture.kickoff_at,
        ),
      ) === date,
  );

  const matches = [];

  for (const fixture of fixtures) {
    const analysis =
      await analyzePaidFixture(
        fixture.provider_fixture_id,
      );

    const oddsSourceMap =
      new Map(
        analysis.consensusOdds.map(
          (odd) => [
            `${odd.market}:${odd.selection}`,
            odd.source,
          ],
        ),
      );

    const candidates =
      analysis.recommendations.map(
        (candidate) => ({
          market: candidate.market,
          selection:
            candidate.selection,
          modelProbabilityPct:
            pct(
              candidate.modelProbability,
            ),
          odds: candidate.odds,
          oddsSource:
            oddsSourceMap.get(
              `${candidate.market}:${candidate.selection}`,
            ) ?? null,
          bookmakerProbabilityPct:
            pct(
              candidate.bookmakerProbability,
            ),
          bookmakerProbabilitySource:
            candidate.bookmakerProbabilitySource,
          valueEdgePct:
            pct(candidate.valueEdge),
          confidencePct:
            pct(candidate.confidence),
          confidenceLabel:
            candidate.confidenceLabel,
          dataQualityPct:
            pct(candidate.dataQuality),
          qualifies:
            candidate.qualifies,
          rejectionReasons:
            candidate.rejectionReasons,
        }),
      );

    matches.push({
      providerFixtureId:
        fixture.provider_fixture_id,
      competition:
        fixture.competition_name,
      kickoffAt:
        fixture.kickoff_at,
      match:
        `${fixture.home_team_name} vs ${fixture.away_team_name}`,
      expectedGoals:
        analysis.expectedGoals,
      candidates,
      qualifyingRecommendations:
        candidates
          .filter(
            (candidate) =>
              candidate.qualifies,
          )
          .slice(0, 3),
    });
  }

  return {
    date,
    timezone: "Europe/Sofia",
    fixtureCount:
      matches.length,
    qualifyingRecommendationCount:
      matches.reduce(
        (sum, match) =>
          sum +
          match
            .qualifyingRecommendations
            .length,
        0,
      ),
    matches,
  };
}
