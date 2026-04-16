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

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  whatsapp text not null,
  email text not null,
  id_number text not null,
  id_type text not null,
  drivers_licence_number text not null,
  address text not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_ref text not null unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
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

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  payment_type text not null check (payment_type in ('deposit', 'balance', 'full_rental')),
  provider text not null default 'manual' check (provider in ('manual')),
  amount numeric(10, 2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'partial', 'paid', 'failed', 'cancelled')),
  reference text,
  poll_url text,
  gateway_response text,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

update public.payments
set provider = 'manual'
where provider = 'paynow';

alter table public.payments
  alter column provider set default 'manual';

alter table public.payments
  drop constraint if exists payments_provider_check;

alter table public.payments
  add constraint payments_provider_check check (provider in ('manual'));

create index if not exists bookings_vehicle_id_idx on public.bookings(vehicle_id);
create index if not exists bookings_customer_id_idx on public.bookings(customer_id);
create index if not exists payments_booking_id_idx on public.payments(booking_id);

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
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Public can read available vehicles" on public.vehicles;
create policy "Public can read available vehicles"
on public.vehicles
for select
to anon, authenticated
using (status = 'available');

drop policy if exists "Authenticated admins manage vehicles" on public.vehicles;
create policy "Authenticated admins manage vehicles"
on public.vehicles
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admins manage customers" on public.customers;
create policy "Authenticated admins manage customers"
on public.customers
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admins manage bookings" on public.bookings;
create policy "Authenticated admins manage bookings"
on public.bookings
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admins manage payments" on public.payments;
create policy "Authenticated admins manage payments"
on public.payments
for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can read vehicle photos" on storage.objects;
create policy "Public can read vehicle photos"
on storage.objects
for select
to public
using (bucket_id = 'vehicle-photos');

drop policy if exists "Authenticated admins upload vehicle photos" on storage.objects;
create policy "Authenticated admins upload vehicle photos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'vehicle-photos');

drop policy if exists "Authenticated admins update vehicle photos" on storage.objects;
create policy "Authenticated admins update vehicle photos"
on storage.objects
for update
to authenticated
using (bucket_id = 'vehicle-photos')
with check (bucket_id = 'vehicle-photos');

drop policy if exists "Authenticated admins delete vehicle photos" on storage.objects;
create policy "Authenticated admins delete vehicle photos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'vehicle-photos');
