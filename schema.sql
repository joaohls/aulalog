-- Schema for AulaLog (Supabase / Postgres)
-- Primary version assumes use of Supabase Auth (auth.users)

-- Enable uuid generation
create extension if not exists "pgcrypto";

-- Profiles linked to auth.users (recommended for Supabase projects)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text unique,
  created_at timestamptz default now()
);

-- Aulas table
create table if not exists public.aulas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  titulo text not null,
  disciplina text not null,
  professor text not null,
  data date not null,
  resumo text not null,
  duracao_minutos int,
  tags text[] default array[]::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to update updated_at automatically
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_aulas_set_updated_at
before update on public.aulas
for each row
execute function public.set_updated_at();

-- Useful indexes
create index if not exists idx_aulas_user_id on public.aulas(user_id);
create index if not exists idx_aulas_disciplina on public.aulas(disciplina);
create index if not exists idx_aulas_data on public.aulas(data);

-- Row Level Security: allow only owners access to their aulas
alter table public.aulas enable row level security;

create policy if not exists "aulas_owner_policy" on public.aulas
  for all
  using (user_id = auth.uid()::uuid)
  with check (user_id = auth.uid()::uuid);

-- RLS for profiles: user can only access/modify their own profile
alter table public.profiles enable row level security;

create policy if not exists "profiles_owner_policy" on public.profiles
  for all
  using (id = auth.uid()::uuid)
  with check (id = auth.uid()::uuid);

-- --------------------------------------------------
-- Alternative standalone version (no dependency on auth.users)
-- Uncomment and use instead of the above if you prefer separate profiles
-- (comment out the auth.users-based `profiles` definition & policies above)
-- --------------------------------------------------
-- create table if not exists public.profiles (
--   id uuid primary key default gen_random_uuid(),
--   nome text,
--   email text unique,
--   password_hash text,
--   created_at timestamptz default now()
-- );
--
-- alter table public.aulas enable row level security;
-- create policy if not exists "aulas_owner_policy" on public.aulas
--   for all
--   using (user_id = current_setting('app.current_user_id', true)::uuid)
--   with check (user_id = current_setting('app.current_user_id', true)::uuid);

-- Note:
-- - If you use Supabase Auth keep the first section and create a `profile`
--   row after signUp with id = auth.user().id.
-- - If you use the standalone profiles table you must adapt your frontend
--   authentication flow and provide a way to set `app.current_user_id`
--   for server-side functions if you rely on such settings.
