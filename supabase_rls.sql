-- Supabase RLS and staff_profiles setup
-- Run this in Supabase SQL Editor

-- 1) Create staff_profiles table to map auth users to staff roles
create table if not exists public.staff_profiles (
  user_id uuid primary key,
  name text not null,
  email text not null,
  role text not null check (role in ('admin','manager','staff')),
  created_at timestamptz default now()
);

-- 2) Remove permissive anonymous policies (if they exist)
-- Drop by name if present
drop policy if exists "Allow all for anon" on public.members;
drop policy if exists "Allow all for anon" on public.memberships;
drop policy if exists "Allow all for anon" on public.payments;

-- 3) Create stricter policies
-- Allow any authenticated user to SELECT rows (read-only)
create policy if not exists "select_for_authenticated" on public.members
  for select using (auth.role() = 'authenticated');

create policy if not exists "select_for_authenticated_memberships" on public.memberships
  for select using (auth.role() = 'authenticated');

create policy if not exists "select_for_authenticated_payments" on public.payments
  for select using (auth.role() = 'authenticated');

-- Allow INSERT/UPDATE/DELETE only for users present in staff_profiles
create policy if not exists "crud_for_staff" on public.members
  for all using (exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid()))
  with check (exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid()));

create policy if not exists "crud_for_staff_memberships" on public.memberships
  for all using (exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid()))
  with check (exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid()));

create policy if not exists "crud_for_staff_payments" on public.payments
  for all using (exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid()))
  with check (exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid()));

-- 4) Example insert for initial admin (replace USER_UUID with actual auth.user id)
-- insert into public.staff_profiles(user_id, name, email, role) values ('USER_UUID', 'Admin User', 'admin@hulkgym.com', 'admin');
