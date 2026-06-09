-- ============================================================
-- THE HULK GYM - Supabase Schema Setup
-- Run this entire script in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. MEMBERS TABLE
create table if not exists public.members (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  phone       text,
  gender      text check (gender in ('Male', 'Female', 'Other')),
  birth_date  date,
  notes       text default '',
  created_at  timestamptz default now()
);

-- 2. MEMBERSHIPS TABLE
create table if not exists public.memberships (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.members(id) on delete cascade,
  plan_name   text not null,
  start_date  date not null,
  end_date    date not null,
  price       numeric(10, 2) default 0,
  status      text not null default 'active'
               check (status in ('active', 'expired', 'expiring')),
  created_at  timestamptz default now()
);

-- 3. PAYMENTS TABLE
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  member_id       uuid not null references public.members(id) on delete cascade,
  amount          numeric(10, 2) not null default 0,
  payment_method  text not null default 'Cash'
                  check (payment_method in ('Cash', 'Credit Card', 'Bank Transfer', 'Mobile Payment')),
  payment_date    date not null default current_date,
  payment_status  text not null default 'paid'
                  check (payment_status in ('paid', 'pending', 'failed')),
  notes           text default '',
  created_at      timestamptz default now()
);

-- ============================================================
-- INDEXES for better query performance
-- ============================================================
create index if not exists idx_memberships_member_id on public.memberships(member_id);
create index if not exists idx_memberships_status    on public.memberships(status);
create index if not exists idx_payments_member_id    on public.payments(member_id);
create index if not exists idx_payments_date         on public.payments(payment_date);

-- ============================================================
-- ROW LEVEL SECURITY - allow all for anon key (for staff portal)
-- ============================================================
alter table public.members      enable row level security;
alter table public.memberships  enable row level security;
alter table public.payments     enable row level security;

-- Allow full access via anon key
create policy "Allow all for anon" on public.members
  for all using (true) with check (true);

create policy "Allow all for anon" on public.memberships
  for all using (true) with check (true);

create policy "Allow all for anon" on public.payments
  for all using (true) with check (true);
