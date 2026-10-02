export const SHOT_ZONES = [
  "top_left",
  "top_right",
  "center",
  "bottom_left",
  "bottom_right",
] as const;

export type ShotZone =
  (typeof SHOT_ZONES)[number];

export const FREE_DAILY_ATTEMPTS = 5;
export const PREMIUM_DAILY_ATTEMPTS = 7;

export const GOAL_EXP = 4;
export const SAVE_EXP = -2;

export const SAVE_PROBABILITY = 0.27;

export function isShotZone(
  value: unknown,
): value is ShotZone {
  return (
    typeof value === "string" &&
    (
      SHOT_ZONES as readonly string[]
    ).includes(value)
  );
}

export function monthKeyFromDate(
  date: string,
) {
  return date.slice(0, 7);
}

export const GAME_PRIZES = [
  {
    place: 1,
    label: "1ST",
    prize: "1 FREE PREMIUM MONTH",
  },
  {
    place: 2,
    label: "2ND",
    prize: "1 FREE PREMIUM WEEK",
  },
  {
    place: 3,
    label: "3RD",
    prize: "+100 EXP",
  },
] as const;
