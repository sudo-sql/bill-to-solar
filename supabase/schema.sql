-- Bill-to-Solar DIY Planner — Supabase schema
-- Run in the Supabase SQL editor. Enables authenticated storage of bills
-- and plans with row-level security so users only ever see their own data.

-- Users are provided by Supabase Auth (auth.users). Profile extras:
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists public.uploaded_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- file stored in a PRIVATE storage bucket ('bills'); access via signed URLs
  storage_path text,
  file_name text,
  file_type text,
  file_size_bytes int,
  created_at timestamptz default now()
);

create table if not exists public.extracted_bill_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bill_id uuid references public.uploaded_bills(id) on delete set null,
  source text check (source in ('pdf','ocr','manual','demo')),
  utility_company text,
  -- deliberately NO customer name / account number columns
  service_zip text,
  billing_start_date text,
  billing_end_date text,
  billing_days int,
  total_kwh numeric,
  previous_kwh numeric,
  total_bill_amount numeric,
  energy_charges numeric,
  delivery_charges numeric,
  demand_charge numeric,
  taxes_fees numeric,
  estimated_cost_per_kwh numeric,
  rate_plan text,
  time_of_use boolean default false,
  peak_rate numeric,
  off_peak_rate numeric,
  net_metering boolean default false,
  solar_credits numeric,
  confidence jsonb default '{}',
  needs_user_review boolean default true,
  notes jsonb default '[]',
  created_at timestamptz default now()
);

create table if not exists public.solar_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  extracted_bill_id uuid references public.extracted_bill_data(id) on delete set null,
  inputs jsonb not null,
  usage_summary jsonb not null,
  recommended_strategy text,
  whole_home_plan jsonb,
  critical_loads_plan jsonb,
  budget_starter_plan jsonb,
  component_list jsonb default '[]',
  safety_warnings jsonb default '[]',
  electrician_required_tasks jsonb default '[]',
  assumptions jsonb default '[]',
  created_at timestamptz default now()
);

create table if not exists public.plan_phases (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.solar_plans(id) on delete cascade,
  phase_number int not null,
  name text,
  goal text,
  components jsonb default '[]',
  estimated_cost_low numeric,
  estimated_cost_high numeric,
  estimated_usage_offset_percent numeric,
  difficulty text,
  notes jsonb default '[]'
);

create table if not exists public.saved_load_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text default 'My home',
  loads jsonb not null default '[]',
  created_at timestamptz default now()
);

create table if not exists public.plan_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.solar_plans(id) on delete cascade,
  export_type text default 'pdf',
  created_at timestamptz default now()
);

-- Admin-editable reference tables (no user_id; readable by everyone)
create table if not exists public.component_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  what text, why text,
  mistakes jsonb default '[]',
  difficulty text,
  call_electrician text
);

create table if not exists public.vendor_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  url text,
  good_for text,
  notes text,
  active boolean default true
);

-- ── Row Level Security ────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.uploaded_bills enable row level security;
alter table public.extracted_bill_data enable row level security;
alter table public.solar_plans enable row level security;
alter table public.plan_phases enable row level security;
alter table public.saved_load_profiles enable row level security;
alter table public.plan_exports enable row level security;
alter table public.component_library enable row level security;
alter table public.vendor_sources enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own bills" on public.uploaded_bills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own extracted" on public.extracted_bill_data
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own plans" on public.solar_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own phases" on public.plan_phases
  for all using (exists (select 1 from public.solar_plans p where p.id = plan_id and p.user_id = auth.uid()));

create policy "own load profiles" on public.saved_load_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own exports" on public.plan_exports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "public read components" on public.component_library for select using (true);
create policy "public read vendors" on public.vendor_sources for select using (true);

-- ── Storage ───────────────────────────────────────────────────────────────
-- Create a PRIVATE bucket named 'bills' in the dashboard, then:
-- insert into storage.buckets (id, name, public) values ('bills','bills', false);
create policy "own bill files" on storage.objects
  for all using (bucket_id = 'bills' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'bills' and auth.uid()::text = (storage.foldername(name))[1]);
