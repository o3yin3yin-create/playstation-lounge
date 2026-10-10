-- ====================================================================
-- Clash PlayStation Lounge & Cafe - Supabase Database Schema
-- Run this script in your Supabase project's SQL Editor (takes 5 seconds)
-- ====================================================================

-- 1. Main State Table (Holds devices, active sessions, cafe menu, finance, settings)
create table if not exists lounge_store (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 2. Daily Backups Table (Automated daily snapshots)
create table if not exists lounge_backups (
  day text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

-- 3. Monthly Archives Table (Rolling 3-month retention archives)
create table if not exists lounge_archives (
  month text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table lounge_store enable row level security;
alter table lounge_backups enable row level security;
alter table lounge_archives enable row level security;

-- Allow server service_role / anon access for authenticated lounge system operations
create policy "Allow all operations for service role and anon" on lounge_store
  for all using (true) with check (true);

create policy "Allow all operations for service role and anon on backups" on lounge_backups
  for all using (true) with check (true);

create policy "Allow all operations for service role and anon on archives" on lounge_archives
  for all using (true) with check (true);
