-- GentleR minimum build: journal entries with per-user row-level security,
-- immutable creation data, revision counter for conflict safeguards, and a
-- self-service account deletion function.
--
-- Apply with: supabase db push   (see README.md and docs/SUPABASE_SETUP.md)

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- journal_entries
-- ---------------------------------------------------------------------------
create table if not exists public.journal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null default '' check (char_length(title) <= 200),
  body        text not null default '' check (char_length(body) <= 100000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  revision    integer not null default 1 check (revision > 0)
);

comment on table  public.journal_entries is 'Private journal entries. One owner per row; enforced by RLS.';
comment on column public.journal_entries.created_at is 'Original creation time. Never changes after insert.';
comment on column public.journal_entries.revision is 'Increments on every update. Clients send the revision they loaded to detect edits from another tab or device.';

create index if not exists journal_entries_user_created_idx
  on public.journal_entries (user_id, created_at desc);

alter table public.journal_entries enable row level security;

-- Only the owner can see or change a row. auth.uid() is wrapped in a
-- sub-select so Postgres evaluates it once per statement.
drop policy if exists "journal_entries_select_own" on public.journal_entries;
create policy "journal_entries_select_own"
  on public.journal_entries for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "journal_entries_insert_own" on public.journal_entries;
create policy "journal_entries_insert_own"
  on public.journal_entries for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "journal_entries_update_own" on public.journal_entries;
create policy "journal_entries_update_own"
  on public.journal_entries for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "journal_entries_delete_own" on public.journal_entries;
create policy "journal_entries_delete_own"
  on public.journal_entries for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Anonymous visitors have no access at all; signed-in users act through RLS.
revoke all on table public.journal_entries from anon;
grant select, insert, update, delete on table public.journal_entries to authenticated;

-- Keep identity and creation data immutable; bump revision and updated_at.
create or replace function public.journal_entries_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.id         := old.id;
  new.user_id    := old.user_id;
  new.created_at := old.created_at;
  new.updated_at := now();
  new.revision   := old.revision + 1;
  return new;
end;
$$;

drop trigger if exists journal_entries_before_update on public.journal_entries;
create trigger journal_entries_before_update
  before update on public.journal_entries
  for each row execute function public.journal_entries_before_update();

-- ---------------------------------------------------------------------------
-- Account deletion: the signed-in user deletes only themself. Entries go
-- with the account through the foreign key cascade. No service-role key is
-- needed by the web app.
-- ---------------------------------------------------------------------------
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
revoke all on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;

comment on function public.delete_own_account() is 'Deletes the calling user and, by cascade, their journal entries. Callable only by authenticated users; acts only on auth.uid().';
