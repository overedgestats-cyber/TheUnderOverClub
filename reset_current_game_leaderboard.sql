-- The Under Over Club
-- Clear ONLY the current month's leaderboard/test ranking.
-- Does NOT delete lifetime profiles or today's stored penalty attempts.
-- The v2.5 code patch excludes zero-shot placeholder rows, so the board
-- remains empty until somebody actually takes a new penalty.

delete from public.game_monthly_stats
where month_key = to_char(
  timezone('Europe/Sofia', now()),
  'YYYY-MM'
);
