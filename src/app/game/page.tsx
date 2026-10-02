import {
  auth,
} from "@clerk/nextjs/server";
import {
  redirect,
} from "next/navigation";

import PenaltyGame from "@/components/game/PenaltyGame";

export const dynamic =
  "force-dynamic";

export default async function GamePage() {
  const {
    userId,
  } =
    await auth();

  if (!userId) {
    redirect(
      "/sign-in?redirect_url=/game",
    );
  }

  return (
    <PenaltyGame />
  );
}
