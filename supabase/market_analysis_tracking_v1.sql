begin;

-- ============================================================
-- THE UNDER OVER CLUB
-- Permanent four-market tracking + fair-value official picks
-- ============================================================

-- Keep the existing raw implied probability/value-edge columns on
-- recommendations for audit compatibility, but add fair/de-vigged
-- probability fields used by Confidence v2 qualification.

alter table public.recommendations
  add column if not exists fair_bookmaker_probability numeric(8,6);

alter table public.recommendations
  add column if not exists fair_value_edge numeric(8,6)
  generated always as (
    case
      when fair_bookmaker_probability is null then null
      else model_probability - fair_bookmaker_probability
    end
  ) stored;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.recommendations'::regclass
      and conname = 'recommendations_fair_bookmaker_probability_check'
  ) then
    alter table public.recommendations
      add constraint recommendations_fair_bookmaker_probability_check
      check (
        fair_bookmaker_probability is null
        or (
          fair_bookmaker_probability > 0
          and fair_bookmaker_probability < 1
        )
      );
  end if;
end;
$$;

-- The original schema required a +5pp edge versus raw 1/odds.
-- Confidence v2 uses de-vigged/fair bookmaker probability whenever
-- available, while preserving the raw implied probability columns.
alter table public.recommendations
  drop constraint if exists recommendations_check1;

alter table public.recommendations
  drop constraint if exists recommendations_value_edge_v2_check;

alter table public.recommendations
  add constraint recommendations_value_edge_v2_check
  check (
    (
      fair_bookmaker_probability is not null
      and model_probability - fair_bookmaker_probability >= 0.05
    )
    or
    (
      fair_bookmaker_probability is null
      and model_probability - (1::numeric / odds) >= 0.05
    )
  );

-- ============================================================
-- One immutable strongest selection per market per paid fixture.
-- Exactly four rows are expected per fixture:
-- ou25, btts, one_x_two, double_chance.
-- ============================================================

create table if not exists public.market_analysis_snapshots (
  id uuid primary key default gen_random_uuid(),

  publication_run_id uuid not null
    references public.publication_runs(id)
    on delete restrict,

  fixture_id uuid not null
    references public.fixtures(id)
    on delete restrict,

  access_tier public.board_kind not null default 'paid'
    check (access_tier = 'paid'),

  market public.market_type not null,
  selection text not null,

  bookmaker_id bigint,
  bookmaker_name text,

  odds numeric(10,4)
    check (odds is null or (odds > 1 and odds <= 1000)),

  odds_source text
    check (
      odds_source is null
      or odds_source in ('bet365', 'market_median_fallback')
    ),

  odds_fetched_at timestamptz,

  model_probability numeric(8,6) not null
    check (model_probability > 0 and model_probability < 1),

  fair_bookmaker_probability numeric(8,6)
    check (
      fair_bookmaker_probability is null
      or (
        fair_bookmaker_probability > 0
        and fair_bookmaker_probability < 1
      )
    ),

  fair_probability_source text
    check (
      fair_probability_source is null
      or fair_probability_source in (
        'devigged_binary_market',
        'devigged_1x2_market',
        'devigged_1x2_derived',
        'raw_implied_fallback'
      )
    ),

  fair_value_edge numeric(8,6)
    generated always as (
      case
        when fair_bookmaker_probability is null then null
        else model_probability - fair_bookmaker_probability
      end
    ) stored,

  confidence numeric(8,6) not null
    check (confidence >= 0 and confidence <= 1),

  confidence_label text
    generated always as (
      case
        when confidence >= 0.90 then 'Elite'
        when confidence >= 0.82 then 'Strong'
        when confidence >= 0.75 then 'Good'
        else 'Below threshold'
      end
    ) stored,

  data_quality_score numeric(8,6)
    check (
      data_quality_score is null
      or (
        data_quality_score >= 0
        and data_quality_score <= 1
      )
    ),

  qualifies boolean not null,

  -- At most three threshold-passing selections are customer-facing.
  -- A fourth threshold-passing market remains tracked but has NULL rank.
  official_rank_position smallint
    check (
      official_rank_position is null
      or official_rank_position between 1 and 3
    ),

  is_official_pick boolean
    generated always as (
      official_rank_position is not null
    ) stored,

  rejection_reasons text[] not null default '{}'::text[],

  model_version text not null,

  analysis_snapshot jsonb not null default '{}'::jsonb,

  published_at timestamptz not null default now(),

  result_status public.pick_result not null default 'pending',
  final_home_score integer
    check (final_home_score is null or final_home_score >= 0),
  final_away_score integer
    check (final_away_score is null or final_away_score >= 0),
  settled_at timestamptz,

  unit_profit numeric(12,6)
    generated always as (
      case
        when odds is null then null
        when result_status = 'won' then odds - 1
        when result_status = 'lost' then -1
        when result_status = 'void' then 0
        else null
      end
    ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (publication_run_id, fixture_id, market),

  check (
    (market = 'ou25' and selection in ('over_2_5', 'under_2_5'))
    or
    (market = 'btts' and selection in ('yes', 'no'))
    or
    (market = 'double_chance' and selection in ('1x', '12', 'x2'))
    or
    (market = 'one_x_two' and selection in ('home', 'draw', 'away'))
  ),

  check (
    (result_status = 'pending' and settled_at is null)
    or
    (result_status <> 'pending' and settled_at is not null)
  )
);

create index if not exists market_analysis_snapshots_run_fixture_idx
  on public.market_analysis_snapshots (
    publication_run_id,
    fixture_id
  );

create index if not exists market_analysis_snapshots_tracking_idx
  on public.market_analysis_snapshots (
    market,
    qualifies,
    result_status,
    published_at desc
  );

create unique index if not exists market_analysis_snapshots_official_rank_uidx
  on public.market_analysis_snapshots (
    publication_run_id,
    fixture_id,
    official_rank_position
  )
  where official_rank_position is not null;

-- Tracking rows are immutable except for settlement fields.
create or replace function public.lock_market_analysis_snapshot()
returns trigger
language plpgsql
as $$
declare
  old_locked jsonb;
  new_locked jsonb;
begin
  old_locked :=
    to_jsonb(old) - array[
      'result_status',
      'final_home_score',
      'final_away_score',
      'settled_at',
      'unit_profit',
      'updated_at'
    ]::text[];

  new_locked :=
    to_jsonb(new) - array[
      'result_status',
      'final_home_score',
      'final_away_score',
      'settled_at',
      'unit_profit',
      'updated_at'
    ]::text[];

  if new_locked is distinct from old_locked then
    raise exception
      'Market analysis snapshots are immutable. Only settlement fields may be updated.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_10_market_analysis_snapshots_updated_at
  on public.market_analysis_snapshots;

create trigger trg_10_market_analysis_snapshots_updated_at
before update on public.market_analysis_snapshots
for each row execute function public.set_updated_at();

drop trigger if exists trg_90_lock_market_analysis_snapshot
  on public.market_analysis_snapshots;

create trigger trg_90_lock_market_analysis_snapshot
before update on public.market_analysis_snapshots
for each row execute function public.lock_market_analysis_snapshot();

-- Audit settlement changes for the model-tracking rows as well.
create table if not exists public.market_analysis_settlement_events (
  id uuid primary key default gen_random_uuid(),

  market_analysis_snapshot_id uuid not null
    references public.market_analysis_snapshots(id)
    on delete cascade,

  previous_status public.pick_result,
  new_status public.pick_result not null,

  previous_final_home_score integer,
  previous_final_away_score integer,

  new_final_home_score integer,
  new_final_away_score integer,

  changed_by text,
  reason text,

  created_at timestamptz not null default now()
);

create index if not exists market_analysis_settlement_events_snapshot_idx
  on public.market_analysis_settlement_events (
    market_analysis_snapshot_id,
    created_at desc
  );

create or replace function public.audit_market_analysis_settlement()
returns trigger
language plpgsql
as $$
begin
  if
    new.result_status is distinct from old.result_status
    or new.final_home_score is distinct from old.final_home_score
    or new.final_away_score is distinct from old.final_away_score
    or new.settled_at is distinct from old.settled_at
  then
    insert into public.market_analysis_settlement_events (
      market_analysis_snapshot_id,
      previous_status,
      new_status,
      previous_final_home_score,
      previous_final_away_score,
      new_final_home_score,
      new_final_away_score,
      changed_by,
      reason
    )
    values (
      new.id,
      old.result_status,
      new.result_status,
      old.final_home_score,
      old.final_away_score,
      new.final_home_score,
      new.final_away_score,
      coalesce(public.current_clerk_user_id(), current_user),
      'automatic_or_admin_settlement'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_audit_market_analysis_settlement
  on public.market_analysis_snapshots;

create trigger trg_audit_market_analysis_settlement
after update on public.market_analysis_snapshots
for each row execute function public.audit_market_analysis_settlement();

-- Keep model-tracking data server/admin only.
alter table public.market_analysis_snapshots enable row level security;
alter table public.market_analysis_settlement_events enable row level security;

commit;
