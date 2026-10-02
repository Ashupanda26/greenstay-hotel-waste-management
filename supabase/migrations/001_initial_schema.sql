-- =============================================================================
-- GreenStay: initial schema
-- Portfolio demonstration for a fictional hotel. Not a production system.
--
-- Four tables:
--   users           hotel staff who report waste or manage collections
--   locations       places in the hotel where waste bins live
--   waste_requests  a report that a bin needs collecting
--   collections     the work of collecting a request's waste
--
-- Allowed values are enforced with CHECK constraints (not enum types) so they
-- are easy to read here and easy to change in a later migration.
-- The same lists live in src/types/database.ts and must be kept in sync.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- users
-- Not linked to Supabase Auth: the demo has no real login (see 002).
-- -----------------------------------------------------------------------------
create table public.users (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null unique,
  role        text        not null,
  department  text,
  created_at  timestamptz not null default now(),

  constraint users_role_check
    check (role in ('housekeeping', 'kitchen', 'front_desk', 'waste_manager'))
);


-- -----------------------------------------------------------------------------
-- locations
-- -----------------------------------------------------------------------------
create table public.locations (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null unique,
  area        text,
  capacity    integer,
  created_at  timestamptz not null default now(),

  constraint locations_capacity_check
    check (capacity is null or capacity > 0)
);

comment on column public.locations.capacity is
  'Total waste bin capacity at this location, in litres.';


-- -----------------------------------------------------------------------------
-- waste_requests
--
-- Priority rule (see src/lib/businessRules.ts, calculatePriority):
--   bin_level  0-49  -> Low
--   bin_level 50-89  -> Medium
--   bin_level 90-100 -> High
-- The app calculates the default priority from bin_level; staff never pick it.
-- A Waste Manager may later override it, so the database deliberately does NOT
-- tie priority to bin_level. It only checks that priority is a valid value.
-- -----------------------------------------------------------------------------
create table public.waste_requests (
  id                    uuid        primary key default gen_random_uuid(),
  -- A location or reporter with request history cannot be deleted,
  -- so the waste history is never silently lost.
  location_id           uuid        not null references public.locations (id) on delete restrict,
  reported_by           uuid        not null references public.users (id) on delete restrict,
  waste_type            text        not null,
  waste_classification  text        not null,
  bin_level             integer     not null,
  priority              text        not null,
  description           text,
  status                text        not null default 'Reported',
  created_at            timestamptz not null default now(),
  completed_at          timestamptz,

  constraint waste_requests_waste_type_check
    check (waste_type in ('Food Waste', 'General Waste', 'Paper/Cardboard', 'Plastic', 'Glass', 'Other')),

  constraint waste_requests_waste_classification_check
    check (waste_classification in ('Recyclable', 'Non-Recyclable')),

  -- Percentage fullness of the bin.
  constraint waste_requests_bin_level_check
    check (bin_level >= 0 and bin_level <= 100),

  constraint waste_requests_priority_check
    check (priority in ('Low', 'Medium', 'High')),

  constraint waste_requests_status_check
    check (status in ('Reported', 'Assigned', 'Scheduled', 'In Progress', 'Completed', 'Cancelled')),

  -- A completed request must record when it was completed.
  constraint waste_requests_completed_at_check
    check (status <> 'Completed' or completed_at is not null)
);

create index waste_requests_status_idx      on public.waste_requests (status);
create index waste_requests_priority_idx    on public.waste_requests (priority);
create index waste_requests_location_id_idx on public.waste_requests (location_id);
create index waste_requests_created_at_idx  on public.waste_requests (created_at);


-- -----------------------------------------------------------------------------
-- collections
-- -----------------------------------------------------------------------------
create table public.collections (
  id                 uuid        primary key default gen_random_uuid(),
  -- A collection only exists for its request, so it goes when the request goes.
  request_id         uuid        not null references public.waste_requests (id) on delete cascade,
  -- Staff with collections assigned cannot be deleted.
  assigned_to        uuid        not null references public.users (id) on delete restrict,
  scheduled_date     date,
  collection_status  text        not null default 'Pending',
  completed_at       timestamptz,
  created_at         timestamptz not null default now(),

  constraint collections_collection_status_check
    check (collection_status in ('Pending', 'Scheduled', 'In Progress', 'Completed', 'Cancelled')),

  constraint collections_completed_at_check
    check (collection_status <> 'Completed' or completed_at is not null)
);

create index collections_request_id_idx  on public.collections (request_id);
create index collections_assigned_to_idx on public.collections (assigned_to);


-- -----------------------------------------------------------------------------
-- Row Level Security
-- Enabled on every table. With RLS on and no policies, nothing is readable or
-- writable through the publishable key. The demo policies are in 002.
-- -----------------------------------------------------------------------------
alter table public.users          enable row level security;
alter table public.locations      enable row level security;
alter table public.waste_requests enable row level security;
alter table public.collections    enable row level security;
