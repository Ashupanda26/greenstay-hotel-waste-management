-- =============================================================================
-- GreenStay: demo access policies
--
-- Authentication is intentionally simplified for portfolio demonstration
-- purposes. There is no real login. The browser talks to Supabase with the
-- publishable key, which means every visitor uses the `anon` role.
--
-- The staff / manager switch in the app is a demo convenience, NOT
-- authentication. The database cannot tell staff and managers apart, so these
-- policies grant the same access to every visitor.
--
-- What the publishable key can do:
--   users, locations     read only
--   waste_requests       read, create, update (report waste, manage requests)
--   collections          read, create, update (schedule and track collections)
--   any table            no deletes
--
-- This is acceptable only because the hotel is fictional and the data is demo
-- data. A real deployment would use Supabase Auth and policies that check
-- auth.uid() and the user's role, e.g. only waste managers may update
-- priority or create collections.
--
-- Safe to re-run: grants are reset each time and every policy is dropped (if it
-- exists) before it is created, so this works from a fresh or partly applied state.
-- =============================================================================


-- Table privileges: only the operations listed above, nothing else.
revoke all on public.users, public.locations, public.waste_requests, public.collections
  from anon, authenticated;

grant select                 on public.users, public.locations         to anon, authenticated;
grant select, insert, update on public.waste_requests, public.collections to anon, authenticated;


-- users
drop policy if exists "Demo: anyone can read users" on public.users;
create policy "Demo: anyone can read users"
  on public.users for select
  to anon, authenticated
  using (true);

-- locations
drop policy if exists "Demo: anyone can read locations" on public.locations;
create policy "Demo: anyone can read locations"
  on public.locations for select
  to anon, authenticated
  using (true);

-- waste_requests
drop policy if exists "Demo: anyone can read waste requests" on public.waste_requests;
create policy "Demo: anyone can read waste requests"
  on public.waste_requests for select
  to anon, authenticated
  using (true);

drop policy if exists "Demo: anyone can report waste" on public.waste_requests;
create policy "Demo: anyone can report waste"
  on public.waste_requests for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Demo: anyone can update waste requests" on public.waste_requests;
create policy "Demo: anyone can update waste requests"
  on public.waste_requests for update
  to anon, authenticated
  using (true)
  with check (true);

-- collections
drop policy if exists "Demo: anyone can read collections" on public.collections;
create policy "Demo: anyone can read collections"
  on public.collections for select
  to anon, authenticated
  using (true);

drop policy if exists "Demo: anyone can create collections" on public.collections;
create policy "Demo: anyone can create collections"
  on public.collections for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Demo: anyone can update collections" on public.collections;
create policy "Demo: anyone can update collections"
  on public.collections for update
  to anon, authenticated
  using (true)
  with check (true);
