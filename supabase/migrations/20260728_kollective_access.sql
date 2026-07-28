create extension if not exists pgcrypto;

create table if not exists public.ka_events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text not null,
  venue text not null,
  venue_address text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  description text,
  dress_code text,
  cover_url text,
  capacity integer,
  status text not null default 'draft' check (status in ('draft','published','sold_out','closed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ka_ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.ka_events(id) on delete cascade,
  name text not null,
  description text,
  price_cents integer not null default 0,
  currency text not null default 'usd',
  inventory integer,
  per_order_limit integer not null default 10,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ka_guests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone text,
  first_name text not null,
  last_name text not null,
  birthday date,
  city text,
  instagram text,
  marketing_consent boolean not null default false,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(email)
);

create table if not exists public.ka_orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.ka_events(id),
  guest_id uuid not null references public.ka_guests(id),
  ticket_type_id uuid references public.ka_ticket_types(id),
  quantity integer not null default 1 check (quantity > 0),
  amount_cents integer not null default 0,
  currency text not null default 'usd',
  payment_status text not null default 'free' check (payment_status in ('free','pending','paid','failed','refunded','partially_refunded')),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  source text,
  ambassador_code text,
  access_code uuid not null default gen_random_uuid(),
  checked_in_at timestamptz,
  checked_in_by text,
  created_at timestamptz not null default now(),
  unique(access_code)
);

create table if not exists public.ka_reservations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.ka_events(id),
  guest_id uuid not null references public.ka_guests(id),
  reservation_type text not null,
  guest_count integer not null default 1,
  occasion text,
  preferred_arrival_time time,
  package_name text,
  deposit_cents integer not null default 0,
  balance_cents integer not null default 0,
  status text not null default 'requested' check (status in ('requested','awaiting_payment','confirmed','declined','cancelled','completed')),
  stripe_checkout_session_id text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.ka_checkin_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.ka_orders(id) on delete cascade,
  event_id uuid not null references public.ka_events(id),
  scanned_by text,
  result text not null,
  scanned_at timestamptz not null default now()
);

create index if not exists ka_events_starts_at_idx on public.ka_events(starts_at);
create index if not exists ka_orders_event_idx on public.ka_orders(event_id);
create index if not exists ka_orders_guest_idx on public.ka_orders(guest_id);
create index if not exists ka_orders_access_code_idx on public.ka_orders(access_code);

alter table public.ka_events enable row level security;
alter table public.ka_ticket_types enable row level security;
alter table public.ka_guests enable row level security;
alter table public.ka_orders enable row level security;
alter table public.ka_reservations enable row level security;
alter table public.ka_checkin_log enable row level security;

create policy "Public can view published events" on public.ka_events for select using (status = 'published');
create policy "Public can view active tickets" on public.ka_ticket_types for select using (active = true);

insert into public.ka_events (slug,name,brand,venue,venue_address,starts_at,description,dress_code,cover_url,status)
values (
  'grown-ish-rose-on-piedmont',
  'GROWN-ISH',
  'The Rose On Piedmont',
  'The Rose On Piedmont',
  'Atlanta, Georgia',
  date_trunc('week', now()) + interval '4 days 23 hours',
  'A Friday-night experience for Atlanta\'s grown, social, and stylish crowd.',
  'Upscale nightlife attire. No athletic wear.',
  'https://dzlmtvodpyhetvektfuo.supabase.co/storage/v1/object/public/brand-graphics/grownish/03_event_flyers/GROWNISH_COMING_SOON.png',
  'published'
)
on conflict (slug) do update set updated_at = now();

insert into public.ka_ticket_types (event_id,name,description,price_cents,inventory,sort_order)
select id,'Complimentary Access','Free RSVP. Admission is subject to venue capacity and arrival policy.',0,500,1
from public.ka_events where slug='grown-ish-rose-on-piedmont'
and not exists (select 1 from public.ka_ticket_types t where t.event_id=ka_events.id and t.name='Complimentary Access');

insert into public.ka_ticket_types (event_id,name,description,price_cents,inventory,sort_order)
select id,'Priority Access','Paid priority admission with a dedicated access line.',2500,200,2
from public.ka_events where slug='grown-ish-rose-on-piedmont'
and not exists (select 1 from public.ka_ticket_types t where t.event_id=ka_events.id and t.name='Priority Access');
