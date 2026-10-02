begin;

create table if not exists public.free_pick_publications (
  id uuid primary key default gen_random_uuid(),

  publication_date date not null,
  fixture_id uuid not null references public.fixtures(id) on delete restrict,
  rank_position smallint not null,

  market text not null default 'ou25',
  selection text not null,

  model_probability numeric(8,6) not null,
  confidence numeric(8,6) not null,
  confidence_band text generated always as (
    case
      when confidence >= 0.75 then '75_plus'
      else 'fallback'
    end
  ) stored,
  model_version text not null,

  bookmaker_id bigint null,
  bookmaker_name text null,
  odds numeric(10,4) null,
  odds_source text null,
  odds_fetched_at timestamptz null,

  analysis_snapshot jsonb not null default '{}'::jsonb,

  published_at timestamptz not null default now(),

  result_status text not null default 'pending',
  final_home_score integer null,
  final_away_score integer null,
  settled_at timestamptz null,

  unit_profit numeric(12,6) generated always as (
    case
      when result_status = 'won' and odds is not null then odds - 1
      when result_status = 'lost' and odds is not null then -1
      when result_status = 'void' and odds is not null then 0
      else null
    end
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint free_pick_publications_rank_check
    check (rank_position in (1, 2)),

  constraint free_pick_publications_market_check
    check (market = 'ou25'),

  constraint free_pick_publications_selection_check
    check (selection in ('over_2_5', 'under_2_5')),

  constraint free_pick_publications_model_probability_check
    check (model_probability >= 0 and model_probability <= 1),

  constraint free_pick_publications_confidence_check
    check (confidence >= 0.53 and confidence <= 0.90),

  constraint free_pick_publications_odds_check
    check (odds is null or odds > 1),

  constraint free_pick_publications_odds_source_check
    check (
      odds_source is null
      or odds_source in ('bet365', 'market_median_fallback')
    ),

  constraint free_pick_publications_result_status_check
    check (result_status in ('pending', 'won', 'lost', 'void')),

  constraint free_pick_publications_scores_check
    check (
      (final_home_score is null or final_home_score >= 0)
      and
      (final_away_score is null or final_away_score >= 0)
    ),

  constraint free_pick_publications_settlement_shape_check
    check (
      (
        result_status = 'pending'
        and final_home_score is null
        and final_away_score is null
        and settled_at is null
      )
      or
      (
        result_status in ('won', 'lost', 'void')
        and final_home_score is not null
        and final_away_score is not null
        and settled_at is not null
      )
    )
);

create unique index if not exists
  free_pick_publications_date_rank_uidx
on public.free_pick_publications (
  publication_date,
  rank_position
);

create unique index if not exists
  free_pick_publications_date_fixture_uidx
on public.free_pick_publications (
  publication_date,
  fixture_id
);

create index if not exists
  free_pick_publications_fixture_idx
on public.free_pick_publications (
  fixture_id
);

create index if not exists
  free_pick_publications_status_idx
on public.free_pick_publications (
  result_status,
  publication_date
);

create table if not exists public.free_pick_settlement_events (
  id uuid primary key default gen_random_uuid(),
  free_pick_id uuid not null
    references public.free_pick_publications(id)
    on delete restrict,

  previous_status text not null,
  new_status text not null,

  previous_final_home_score integer null,
  previous_final_away_score integer null,
  new_final_home_score integer null,
  new_final_away_score integer null,

  created_at timestamptz not null default now()
);

create index if not exists
  free_pick_settlement_events_pick_idx
on public.free_pick_settlement_events (
  free_pick_id,
  created_at
);

create or replace function public.guard_free_pick_publication_updates()
returns trigger
language plpgsql
as $$
begin
  if
    new.publication_date is distinct from old.publication_date
    or new.fixture_id is distinct from old.fixture_id
    or new.rank_position is distinct from old.rank_position
    or new.market is distinct from old.market
    or new.selection is distinct from old.selection
    or new.model_probability is distinct from old.model_probability
    or new.confidence is distinct from old.confidence
    or new.model_version is distinct from old.model_version
    or new.analysis_snapshot is distinct from old.analysis_snapshot
    or new.published_at is distinct from old.published_at
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Free Pick publication fields are immutable';
  end if;

  if old.odds is not null and (
    new.odds is distinct from old.odds
    or new.bookmaker_id is distinct from old.bookmaker_id
    or new.bookmaker_name is distinct from old.bookmaker_name
    or new.odds_source is distinct from old.odds_source
    or new.odds_fetched_at is distinct from old.odds_fetched_at
  ) then
    raise exception 'Free Pick odds are immutable once captured';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists
  trg_guard_free_pick_publication_updates
on public.free_pick_publications;

create trigger
  trg_guard_free_pick_publication_updates
before update
on public.free_pick_publications
for each row
execute function
  public.guard_free_pick_publication_updates();

create or replace function public.audit_free_pick_settlement()
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
    insert into public.free_pick_settlement_events (
      free_pick_id,
      previous_status,
      new_status,
      previous_final_home_score,
      previous_final_away_score,
      new_final_home_score,
      new_final_away_score
    )
    values (
      old.id,
      old.result_status,
      new.result_status,
      old.final_home_score,
      old.final_away_score,
      new.final_home_score,
      new.final_away_score
    );
  end if;

  return new;
end;
$$;

drop trigger if exists
  trg_audit_free_pick_settlement
on public.free_pick_publications;

create trigger
  trg_audit_free_pick_settlement
after update
on public.free_pick_publications
for each row
execute function
  public.audit_free_pick_settlement();

alter table public.free_pick_publications enable row level security;
alter table public.free_pick_settlement_events enable row level security;

commit;
