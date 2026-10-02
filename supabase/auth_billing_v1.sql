begin;

create table if not exists public.customer_accounts (
  clerk_user_id text primary key,
  email text null,
  stripe_customer_id text unique null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_subscriptions (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null
    references public.customer_accounts(clerk_user_id)
    on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  stripe_price_id text null,
  status text not null,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint customer_subscriptions_status_check
    check (
      status in (
        'active',
        'trialing',
        'past_due',
        'unpaid',
        'canceled',
        'incomplete',
        'incomplete_expired',
        'paused'
      )
    )
);

create index if not exists
  customer_subscriptions_clerk_idx
on public.customer_subscriptions (
  clerk_user_id,
  status
);

create index if not exists
  customer_subscriptions_customer_idx
on public.customer_subscriptions (
  stripe_customer_id
);

create or replace function public.touch_customer_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists
  trg_customer_accounts_touch
on public.customer_accounts;

create trigger
  trg_customer_accounts_touch
before update
on public.customer_accounts
for each row
execute function
  public.touch_customer_updated_at();

drop trigger if exists
  trg_customer_subscriptions_touch
on public.customer_subscriptions;

create trigger
  trg_customer_subscriptions_touch
before update
on public.customer_subscriptions
for each row
execute function
  public.touch_customer_updated_at();

alter table public.customer_accounts enable row level security;
alter table public.customer_subscriptions enable row level security;

commit;
