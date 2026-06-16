create extension if not exists pgcrypto;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  plate text not null unique,
  year integer not null check (year >= 2000),
  colour text not null,
  seats integer not null check (seats > 0),
  daily_rate numeric(10, 2) not null check (daily_rate >= 0),
  deposit_amount numeric(10, 2) not null check (deposit_amount >= 0),
  status text not null default 'available' check (status in ('available', 'booked', 'maintenance')),
  photo_url text not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_ref text not null unique,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  customer_full_name text not null,
  customer_phone text not null,
  customer_whatsapp text not null,
  customer_email text not null,
  start_date date not null,
  end_date date not null,
  total_days integer not null check (total_days > 0),
  daily_rate numeric(10, 2) not null check (daily_rate >= 0),
  rental_total numeric(10, 2) not null check (rental_total >= 0),
  deposit_amount numeric(10, 2) not null check (deposit_amount >= 0),
  amount_due_now numeric(10, 2) not null check (amount_due_now >= 0),
  booking_status text not null default 'pending' check (booking_status in ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'partial', 'paid', 'failed', 'cancelled')),
  payment_ref text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bookings_date_range_valid check (end_date >= start_date)
);

create index if not exists bookings_vehicle_id_idx on public.bookings(vehicle_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_bookings_updated_at on public.bookings;

create trigger set_bookings_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();

alter table public.vehicles enable row level security;
alter table public.bookings enable row level security;

-- Public (anon) access is intentionally read-only on vehicles and write-only
-- (insert) on bookings. Booking management (reading/updating bookings,
-- managing vehicles) is done via the Supabase dashboard with the service
-- role, not through this app.

drop policy if exists "Public can read available vehicles" on public.vehicles;
create policy "Public can read available vehicles"
on public.vehicles
for select
to anon, authenticated
using (status = 'available');

drop policy if exists "Public can create bookings" on public.bookings;
create policy "Public can create bookings"
on public.bookings
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can read their booking by ref" on public.bookings;
create policy "Public can read their booking by ref"
on public.bookings
for select
to anon, authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can read vehicle photos" on storage.objects;
create policy "Public can read vehicle photos"
on storage.objects
for select
to public
using (bucket_id = 'vehicle-photos');
