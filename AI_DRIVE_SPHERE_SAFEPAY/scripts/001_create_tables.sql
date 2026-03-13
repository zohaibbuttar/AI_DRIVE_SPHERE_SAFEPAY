-- =============================================
-- Vehicle Rental System - Database Schema
-- =============================================

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "admins_select_all_profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 2. Vehicles table
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('car', 'bike', 'truck', 'suv', 'van')),
  plate_number text unique not null,
  status text not null default 'available' check (status in ('available', 'rented', 'maintenance')),
  price_per_day numeric(10,2) not null default 0,
  image_url text,
  description text,
  features text[] default '{}',
  gps_device_id text,
  iot_device_id text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;

-- Everyone can view available vehicles
create policy "vehicles_select_all" on public.vehicles for select using (true);
-- Only admins can insert/update/delete vehicles
create policy "vehicles_insert_admin" on public.vehicles for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "vehicles_update_admin" on public.vehicles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "vehicles_delete_admin" on public.vehicles for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 3. Bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  total_price numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

-- Customers see their own bookings
create policy "bookings_select_own" on public.bookings for select using (auth.uid() = user_id);
-- Admins see all bookings
create policy "bookings_select_admin" on public.bookings for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
-- Customers can create bookings
create policy "bookings_insert_own" on public.bookings for insert with check (auth.uid() = user_id);
-- Admins can update any booking
create policy "bookings_update_admin" on public.bookings for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
-- Customers can cancel their own bookings
create policy "bookings_update_own" on public.bookings for update using (auth.uid() = user_id);
-- Admins can delete bookings
create policy "bookings_delete_admin" on public.bookings for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 4. Agreements table
create table if not exists public.agreements (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  terms text not null default 'Standard rental agreement terms apply.',
  signed_at timestamptz,
  pdf_url text,
  status text not null default 'draft' check (status in ('draft', 'signed', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agreements enable row level security;

create policy "agreements_select_own" on public.agreements for select using (auth.uid() = user_id);
create policy "agreements_select_admin" on public.agreements for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "agreements_insert_admin" on public.agreements for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "agreements_update_admin" on public.agreements for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "agreements_update_own" on public.agreements for update using (auth.uid() = user_id);

-- 5. IoT Commands log
create table if not exists public.iot_commands (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  command text not null check (command in ('lock', 'unlock', 'immobilize', 'reactivate')),
  issued_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'sent' check (status in ('sent', 'acknowledged', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.iot_commands enable row level security;

create policy "iot_commands_select_admin" on public.iot_commands for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "iot_commands_insert_admin" on public.iot_commands for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 6. Tracking history
create table if not exists public.tracking_history (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  speed double precision default 0,
  recorded_at timestamptz not null default now()
);

alter table public.tracking_history enable row level security;

create policy "tracking_select_admin" on public.tracking_history for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "tracking_select_customer" on public.tracking_history for select using (
  exists (
    select 1 from public.bookings
    where bookings.vehicle_id = tracking_history.vehicle_id
      and bookings.user_id = auth.uid()
      and bookings.status in ('active', 'confirmed')
  )
);
create policy "tracking_insert_all" on public.tracking_history for insert with check (true);

-- 7. Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
