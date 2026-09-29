import StatisticsDashboard from "@/components/statistics/StatisticsDashboard";
import {
  getCombinedStatistics,
  getRecommendationStatistics,
} from "@/lib/statistics/recommendation-statistics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StatisticsPage() {
  const [free, paid, overview] =
    await Promise.all([
      getRecommendationStatistics("free"),
      getRecommendationStatistics("paid"),
      getCombinedStatistics(),
    ]);

  return (
    <StatisticsDashboard
      free={free}
      paid={paid}
      overview={overview}
    />
  );
}
