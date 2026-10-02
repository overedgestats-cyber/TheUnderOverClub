import TodayFreePicks from "@/components/free-picks/TodayFreePicks";
import { getPublicFreePicks } from "@/lib/free-picks/public-free-picks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TodayPage() {
  const data = await getPublicFreePicks();
  return <TodayFreePicks data={data} />;
}
