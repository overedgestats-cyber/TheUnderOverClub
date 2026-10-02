import { requirePaidPageAccess } from "@/lib/auth/entitlement";
import {
  getPaidPicks,
  type PaidPick,
} from "@/lib/paid-picks/public-paid-picks";

import PaidPicksBoard from "@/components/paid-picks/PaidPicksBoard";
import RetroHero from "@/components/retro/RetroHero";

import styles from "./paid-picks.module.css";

export const dynamic = "force-dynamic";

export default async function PaidPicksPage() {
  await requirePaidPageAccess();

  const board = await getPaidPicks();

  return (
    <div className={styles.page}>
      <RetroHero
        eyebrow="MEMBERS ONLY"
        title={
          <>
            PAID PICKS <span className={styles.gold}>BOARD</span>
          </>
        }
        subtitle="OFFICIAL PUBLISHED RECOMMENDATIONS ONLY. OPENING THIS PAGE NEVER RECALCULATES THE MODEL."
        badge={`${board.picks.length} OFFICIAL PICKS`}
        variant="gold"
      />

      <PaidPicksBoard picks={board.picks as PaidPick[]} />
    </div>
  );
}
