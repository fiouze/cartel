-- Quotas member migration: run once in Supabase SQL Editor.
create table if not exists public.member_quotas (
  member_id bigint primary key references public.members(id) on delete cascade,
  respected boolean not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.member_quotas enable row level security;
grant select, insert, update, delete on public.member_quotas to authenticated;

drop policy if exists member_quotas_read on public.member_quotas;
drop policy if exists member_quotas_manage on public.member_quotas;

create policy member_quotas_read on public.member_quotas
  for select to authenticated
  using (public.is_active_member());

create policy member_quotas_manage on public.member_quotas
  for all to authenticated
  using (public.is_active_member())
  with check (public.is_active_member() and updated_by = (select auth.uid()));
