begin;

create table if not exists public.customer_daily_access (
  id uuid primary key default gen_random_uuid(),

  clerk_user_id text not null
    references public.customer_accounts(clerk_user_id)
    on delete cascade,

  access_date date not null,

  stripe_customer_id text not null,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text null,

  amount_total bigint null,
  currency text null,

  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint customer_daily_access_amount_check
    check (amount_total is null or amount_total >= 0),

  constraint customer_daily_access_currency_check
    check (currency is null or char_length(currency) = 3)
);

create unique index if not exists
  customer_daily_access_user_date_uidx
on public.customer_daily_access (
  clerk_user_id,
  access_date
);

create unique index if not exists
  customer_daily_access_payment_intent_uidx
on public.customer_daily_access (
  stripe_payment_intent_id
)
where stripe_payment_intent_id is not null;

create index if not exists
  customer_daily_access_date_idx
on public.customer_daily_access (
  access_date,
  clerk_user_id
);

alter table public.customer_daily_access enable row level security;

commit;
