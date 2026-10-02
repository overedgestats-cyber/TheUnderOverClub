-- THE UNDER OVER CLUB
-- Penalty Game v1
-- Run this once in the Supabase SQL editor BEFORE deploying the game code.

create table if not exists public.game_profiles (
  clerk_user_id text primary key,
  display_name text not null,
  lifetime_exp integer not null default 0 check (lifetime_exp >= 0),
  lifetime_goals integer not null default 0 check (lifetime_goals >= 0),
  lifetime_saves integer not null default 0 check (lifetime_saves >= 0),
  lifetime_shots integer not null default 0 check (lifetime_shots >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_monthly_stats (
  clerk_user_id text not null references public.game_profiles(clerk_user_id) on delete cascade,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  display_name text not null,
  exp integer not null default 0 check (exp >= 0),
  goals integer not null default 0 check (goals >= 0),
  saves integer not null default 0 check (saves >= 0),
  shots integer not null default 0 check (shots >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (clerk_user_id, month_key)
);

create table if not exists public.game_attempts (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null references public.game_profiles(clerk_user_id) on delete cascade,
  game_date date not null,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  attempt_number integer not null check (attempt_number > 0),
  shot_zone text not null check (
    shot_zone in ('top_left','top_right','center','bottom_left','bottom_right')
  ),
  keeper_zone text not null check (
    keeper_zone in ('top_left','top_right','center','bottom_left','bottom_right')
  ),
  outcome text not null check (outcome in ('goal','save')),
  rule_exp_delta integer not null,
  applied_exp_delta integer not null,
  created_at timestamptz not null default now(),
  unique (clerk_user_id, game_date, attempt_number)
);

create index if not exists game_attempts_user_date_idx
  on public.game_attempts (clerk_user_id, game_date, attempt_number);

create index if not exists game_attempts_month_idx
  on public.game_attempts (month_key, clerk_user_id);

create index if not exists game_monthly_leaderboard_idx
  on public.game_monthly_stats (month_key, exp desc, goals desc);

alter table public.game_profiles enable row level security;
alter table public.game_monthly_stats enable row level security;
alter table public.game_attempts enable row level security;

-- The application uses the Supabase service-role client server-side.
-- No anon/authenticated table policies are intentionally created.

create or replace function public.play_penalty_shot(
  p_user_id text,
  p_display_name text,
  p_game_date date,
  p_month_key text,
  p_daily_limit integer,
  p_shot_zone text,
  p_keeper_zone text,
  p_outcome text,
  p_rule_exp_delta integer
)
returns table (
  attempt_id uuid,
  attempt_number integer,
  applied_exp_delta integer,
  monthly_exp integer,
  monthly_goals integer,
  monthly_saves integer,
  monthly_shots integer,
  lifetime_exp integer,
  lifetime_goals integer,
  lifetime_saves integer,
  lifetime_shots integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt_count integer;
  v_month_exp integer;
  v_month_goals integer;
  v_month_saves integer;
  v_month_shots integer;
  v_lifetime_exp integer;
  v_lifetime_goals integer;
  v_lifetime_saves integer;
  v_lifetime_shots integer;
  v_new_month_exp integer;
  v_new_lifetime_exp integer;
  v_applied_delta integer;
  v_attempt_id uuid;
begin
  if p_daily_limit < 1 or p_daily_limit > 50 then
    raise exception 'invalid_daily_limit';
  end if;

  if p_shot_zone not in ('top_left','top_right','center','bottom_left','bottom_right') then
    raise exception 'invalid_shot_zone';
  end if;

  if p_keeper_zone not in ('top_left','top_right','center','bottom_left','bottom_right') then
    raise exception 'invalid_keeper_zone';
  end if;

  if p_outcome not in ('goal','save') then
    raise exception 'invalid_outcome';
  end if;

  -- Serialise attempts for the same user/day to prevent concurrent limit bypass.
  perform pg_advisory_xact_lock(
    hashtext('penalty-game:' || p_user_id || ':' || p_game_date::text)
  );

  insert into public.game_profiles (
    clerk_user_id,
    display_name
  )
  values (
    p_user_id,
    p_display_name
  )
  on conflict (clerk_user_id)
  do update set
    display_name = excluded.display_name,
    updated_at = now();

  insert into public.game_monthly_stats (
    clerk_user_id,
    month_key,
    display_name
  )
  values (
    p_user_id,
    p_month_key,
    p_display_name
  )
  on conflict (clerk_user_id, month_key)
  do update set
    display_name = excluded.display_name,
    updated_at = now();

  select count(*)
  into v_attempt_count
  from public.game_attempts
  where clerk_user_id = p_user_id
    and game_date = p_game_date;

  if v_attempt_count >= p_daily_limit then
    raise exception 'daily_limit_reached';
  end if;

  select
    exp,
    goals,
    saves,
    shots
  into
    v_month_exp,
    v_month_goals,
    v_month_saves,
    v_month_shots
  from public.game_monthly_stats
  where clerk_user_id = p_user_id
    and month_key = p_month_key
  for update;

  select
    gp.lifetime_exp,
    gp.lifetime_goals,
    gp.lifetime_saves,
    gp.lifetime_shots
  into
    v_lifetime_exp,
    v_lifetime_goals,
    v_lifetime_saves,
    v_lifetime_shots
  from public.game_profiles gp
  where gp.clerk_user_id = p_user_id
  for update;

  v_new_month_exp := greatest(0, v_month_exp + p_rule_exp_delta);
  v_applied_delta := v_new_month_exp - v_month_exp;

  v_new_lifetime_exp := greatest(0, v_lifetime_exp + p_rule_exp_delta);

  insert into public.game_attempts (
    clerk_user_id,
    game_date,
    month_key,
    attempt_number,
    shot_zone,
    keeper_zone,
    outcome,
    rule_exp_delta,
    applied_exp_delta
  )
  values (
    p_user_id,
    p_game_date,
    p_month_key,
    v_attempt_count + 1,
    p_shot_zone,
    p_keeper_zone,
    p_outcome,
    p_rule_exp_delta,
    v_applied_delta
  )
  returning id into v_attempt_id;

  update public.game_monthly_stats
  set
    exp = v_new_month_exp,
    goals = goals + case when p_outcome = 'goal' then 1 else 0 end,
    saves = saves + case when p_outcome = 'save' then 1 else 0 end,
    shots = shots + 1,
    display_name = p_display_name,
    updated_at = now()
  where clerk_user_id = p_user_id
    and month_key = p_month_key
  returning
    exp,
    goals,
    saves,
    shots
  into
    v_month_exp,
    v_month_goals,
    v_month_saves,
    v_month_shots;

  update public.game_profiles
  set
    lifetime_exp = v_new_lifetime_exp,
    lifetime_goals = lifetime_goals + case when p_outcome = 'goal' then 1 else 0 end,
    lifetime_saves = lifetime_saves + case when p_outcome = 'save' then 1 else 0 end,
    lifetime_shots = lifetime_shots + 1,
    display_name = p_display_name,
    updated_at = now()
  where clerk_user_id = p_user_id
  returning
    game_profiles.lifetime_exp,
    game_profiles.lifetime_goals,
    game_profiles.lifetime_saves,
    game_profiles.lifetime_shots
  into
    v_lifetime_exp,
    v_lifetime_goals,
    v_lifetime_saves,
    v_lifetime_shots;

  return query
  select
    v_attempt_id,
    v_attempt_count + 1,
    v_applied_delta,
    v_month_exp,
    v_month_goals,
    v_month_saves,
    v_month_shots,
    v_lifetime_exp,
    v_lifetime_goals,
    v_lifetime_saves,
    v_lifetime_shots;
end;
$$;

revoke all on function public.play_penalty_shot(
  text,text,date,text,integer,text,text,text,integer
) from public;

grant execute on function public.play_penalty_shot(
  text,text,date,text,integer,text,text,text,integer
) to service_role;
