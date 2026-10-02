import "server-only";

import {
  getRecommendationStatistics,
} from "@/lib/statistics/recommendation-statistics";

export async function getOfficialStatistics() {
  return getRecommendationStatistics(
    "paid",
  );
}
