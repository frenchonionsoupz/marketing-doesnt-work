-- =============================================================
-- MarketingDoesntWork.com — Supabase Database Schema
-- =============================================================
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- This creates the profiles, progress, and answers tables
-- with Row Level Security (RLS) so users can only access
-- their own data.
-- =============================================================

-- 1. PROFILES TABLE
-- Stores user display name and timestamps.
-- Linked to Supabase Auth via auth.users(id).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  last_login timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);


-- 2. PROGRESS TABLE
-- Tracks the user's current position and level completions.
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  current_level text not null default '1',
  current_sublevel text,
  current_question_index int not null default 0,
  level_1_completed boolean not null default false,
  level_2_completed boolean not null default false,
  level_3_completed boolean not null default false,
  boss_completed boolean not null default false,
  overall_completion_percentage int not null default 0,
  start_time timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

alter table public.progress enable row level security;

create policy "Users can read own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own progress"
  on public.progress for delete
  using (auth.uid() = user_id);


-- 3. ANSWERS TABLE
-- Stores every question answer. Uses upsert via unique constraint.
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  question_text text not null default '',
  answer_text text not null default '',
  level text not null,
  sublevel text,
  answered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, question_id)
);

alter table public.answers enable row level security;

create policy "Users can read own answers"
  on public.answers for select
  using (auth.uid() = user_id);

create policy "Users can insert own answers"
  on public.answers for insert
  with check (auth.uid() = user_id);

create policy "Users can update own answers"
  on public.answers for update
  using (auth.uid() = user_id);

create policy "Users can delete own answers"
  on public.answers for delete
  using (auth.uid() = user_id);


-- 4. HELPER: auto-create profile + progress on signup
-- This trigger fires after a new user is inserted into auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  );

  insert into public.progress (user_id)
  values (new.id);

  return new;
end;
$$;

-- Drop existing trigger if re-running
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
