-- =============================================================================
-- GreenStay: demo seed data
-- Fictional staff and data for GreenStay Birmingham Hotel. Run after the
-- migrations. Safe to re-run: existing rows are left untouched.
--
-- Dates are relative to now(), so the demo always looks current.
-- Requests and collections have fixed IDs so collections can point at their
-- request and re-running does not create duplicates.
--
-- Bin fill level uses the app's categories (BIN_FILL_LEVELS in src/lib/businessRules.ts):
-- staff choose Low (0-25%), Medium (25-75%) or High (75-100%), stored in
-- bin_level as 25, 50 or 100. Priority matches calculatePriority() for that
-- value, so Low -> Low, Medium -> Medium, High -> High.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 5 users (fictional; .example is a reserved, non-routable domain)
-- -----------------------------------------------------------------------------
insert into public.users (name, email, role, department) values
  ('Maya Thornton',  'maya.thornton@greenstay.example',  'housekeeping',  'Housekeeping'),
  ('Leo Okafor',     'leo.okafor@greenstay.example',     'kitchen',       'Kitchen'),
  ('Priya Desai',    'priya.desai@greenstay.example',    'front_desk',    'Front Office'),
  ('Sam Whitfield',  'sam.whitfield@greenstay.example',  'waste_manager', 'Facilities & Sustainability'),
  ('Jordan Hale',    'jordan.hale@greenstay.example',    'waste_manager', 'Facilities & Sustainability')
on conflict (email) do nothing;


-- -----------------------------------------------------------------------------
-- 8 locations (capacity = total bin capacity in litres)
-- -----------------------------------------------------------------------------
insert into public.locations (name, area, capacity) values
  ('Kitchen',         'Back of House',   1100),
  ('Restaurant',      'Food & Beverage',  660),
  ('Reception',       'Front of House',   120),
  ('Conference Room', 'Events',           240),
  ('Floor 1',         'Guest Rooms',      360),
  ('Floor 2',         'Guest Rooms',      360),
  ('Floor 3',         'Guest Rooms',      360),
  ('Staff Area',      'Back of House',    240)
on conflict (name) do nothing;


-- -----------------------------------------------------------------------------
-- 25 waste requests
--   Reported 6, Assigned 3, Scheduled 3, In Progress 3, Completed 8, Cancelled 2
-- age:            how long ago the request was reported
-- time_to_close:  how long after reporting it was completed (Completed only)
-- -----------------------------------------------------------------------------
insert into public.waste_requests (
  id, location_id, reported_by, waste_type, waste_classification,
  bin_level, priority, description, status, created_at, completed_at
)
select
  v.id::uuid,
  l.id,
  u.id,
  v.waste_type,
  v.waste_classification,
  v.bin_level,
  v.priority,
  v.description,
  v.status,
  now() - v.age::interval,
  case when v.status = 'Completed' then now() - v.age::interval + v.time_to_close::interval end
from (values
  -- Reported
  ('a1000000-0000-4000-8000-000000000001', 'Kitchen',         'leo.okafor@greenstay.example',   'Food Waste',      'Non-Recyclable',  100, 'High',   'Food waste bin overflowing after breakfast service',      'Reported',    '2 hours',          null),
  ('a1000000-0000-4000-8000-000000000002', 'Restaurant',      'leo.okafor@greenstay.example',   'Glass',           'Recyclable',      100, 'High',   'Wine bottles from last night''s dinner service',          'Reported',    '5 hours',          null),
  ('a1000000-0000-4000-8000-000000000003', 'Floor 2',         'maya.thornton@greenstay.example','General Waste',   'Non-Recyclable',   50, 'Medium', 'Corridor bin next to the lift',                           'Reported',    '8 hours',          null),
  ('a1000000-0000-4000-8000-000000000004', 'Conference Room', 'priya.desai@greenstay.example',  'Paper/Cardboard', 'Recyclable',       50, 'Medium', 'Handouts and flip-chart paper after a workshop',          'Reported',    '1 day',            null),
  ('a1000000-0000-4000-8000-000000000005', 'Staff Area',      'maya.thornton@greenstay.example','Plastic',         'Recyclable',       50, 'Medium', 'Drinks bottles in the staff room recycling bin',          'Reported',    '1 day 3 hours',    null),
  ('a1000000-0000-4000-8000-000000000006', 'Reception',       'priya.desai@greenstay.example',  'Other',           'Non-Recyclable',   25, 'Low',    'Broken umbrellas and luggage tags left by guests',        'Reported',    '3 hours',          null),
  -- Assigned
  ('a1000000-0000-4000-8000-000000000007', 'Kitchen',         'leo.okafor@greenstay.example',   'Paper/Cardboard', 'Recyclable',      100, 'High',   'Delivery boxes from the morning produce order',           'Assigned',    '1 day',            null),
  ('a1000000-0000-4000-8000-000000000008', 'Floor 1',         'maya.thornton@greenstay.example','General Waste',   'Non-Recyclable',  100, 'High',   'Trolley waste from checkout room cleans',                 'Assigned',    '6 hours',          null),
  ('a1000000-0000-4000-8000-000000000009', 'Restaurant',      'leo.okafor@greenstay.example',   'Food Waste',      'Non-Recyclable',   50, 'Medium', 'Plate waste from lunch service',                          'Assigned',    '4 hours',          null),
  -- Scheduled
  ('a1000000-0000-4000-8000-000000000010', 'Floor 3',         'maya.thornton@greenstay.example','Plastic',         'Recyclable',       50, 'Medium', 'Guest room recycling gathered during turndown',           'Scheduled',   '2 days',           null),
  ('a1000000-0000-4000-8000-000000000011', 'Conference Room', 'priya.desai@greenstay.example',  'General Waste',   'Non-Recyclable',   50, 'Medium', 'Coffee break waste after a conference',                   'Scheduled',   '1 day 6 hours',    null),
  ('a1000000-0000-4000-8000-000000000012', 'Kitchen',         'leo.okafor@greenstay.example',   'Glass',           'Recyclable',      100, 'High',   'Jars and bottles from bar preparation',                   'Scheduled',   '1 day',            null),
  -- In Progress
  ('a1000000-0000-4000-8000-000000000013', 'Kitchen',         'leo.okafor@greenstay.example',   'Food Waste',      'Non-Recyclable',  100, 'High',   'Bin completely full, lid will not close',                 'In Progress', '3 hours',          null),
  ('a1000000-0000-4000-8000-000000000014', 'Reception',       'priya.desai@greenstay.example',  'Paper/Cardboard', 'Recyclable',       50, 'Medium', 'Old printed check-in forms and envelopes',                'In Progress', '1 day 2 hours',    null),
  ('a1000000-0000-4000-8000-000000000015', 'Floor 2',         'maya.thornton@greenstay.example','General Waste',   'Non-Recyclable',  100, 'High',   'Overflow from the linen room bin',                        'In Progress', '5 hours',          null),
  -- Completed
  ('a1000000-0000-4000-8000-000000000016', 'Restaurant',      'leo.okafor@greenstay.example',   'Food Waste',      'Non-Recyclable',  100, 'High',   'Food waste after Sunday carvery',                         'Completed',   '3 days',           '4 hours'),
  ('a1000000-0000-4000-8000-000000000017', 'Floor 1',         'maya.thornton@greenstay.example','Paper/Cardboard', 'Recyclable',       50, 'Medium', 'Newspapers and magazines from guest rooms',               'Completed',   '4 days',           '1 day'),
  ('a1000000-0000-4000-8000-000000000018', 'Staff Area',      'maya.thornton@greenstay.example','General Waste',   'Non-Recyclable',   50, 'Medium', 'Staff canteen general waste',                             'Completed',   '5 days',           '6 hours'),
  ('a1000000-0000-4000-8000-000000000019', 'Conference Room', 'priya.desai@greenstay.example',  'Plastic',         'Recyclable',       50, 'Medium', 'Water bottles after a training day',                      'Completed',   '6 days',           '1 day'),
  ('a1000000-0000-4000-8000-000000000020', 'Kitchen',         'leo.okafor@greenstay.example',   'Glass',           'Recyclable',      100, 'High',   'Bottle bin full after a wedding reception',               'Completed',   '7 days',           '3 hours'),
  ('a1000000-0000-4000-8000-000000000021', 'Floor 3',         'maya.thornton@greenstay.example','General Waste',   'Non-Recyclable',   25, 'Low',    'Routine corridor bin collection',                         'Completed',   '8 days',           '1 day'),
  ('a1000000-0000-4000-8000-000000000022', 'Reception',       'priya.desai@greenstay.example',  'Other',           'Non-Recyclable',   25, 'Low',    'Broken brochure display stand',                           'Completed',   '10 days',          '2 days'),
  ('a1000000-0000-4000-8000-000000000023', 'Restaurant',      'leo.okafor@greenstay.example',   'Plastic',         'Recyclable',      100, 'High',   'Takeaway containers from room service',                   'Completed',   '12 days',          '5 hours'),
  -- Cancelled
  ('a1000000-0000-4000-8000-000000000024', 'Floor 2',         'maya.thornton@greenstay.example','Other',           'Recyclable',       25, 'Low',    'Old kettle from room 214 (duplicate report)',             'Cancelled',   '2 days',           null),
  ('a1000000-0000-4000-8000-000000000025', 'Staff Area',      'maya.thornton@greenstay.example','Paper/Cardboard', 'Recyclable',       50, 'Medium', 'Reported in error, bin had already been emptied',         'Cancelled',   '9 days',           null)
) as v (id, location, reporter_email, waste_type, waste_classification, bin_level, priority, description, status, age, time_to_close)
join public.locations l on l.name  = v.location
join public.users     u on u.email = v.reporter_email
on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- 15 collections, for requests that a Waste Manager has picked up
--   Assigned requests    -> Pending (not yet scheduled)
--   Scheduled requests   -> Scheduled
--   In Progress requests -> In Progress
--   5 of 8 Completed     -> Completed (the other 3 were handled ad hoc)
--   1 Cancelled request  -> Cancelled
-- created_at and completed_at are taken from the request so they always line up.
-- -----------------------------------------------------------------------------
insert into public.collections (
  id, request_id, assigned_to, scheduled_date, collection_status, completed_at, created_at
)
select
  v.id::uuid,
  r.id,
  u.id,
  case
    when v.collection_status = 'Completed' then r.completed_at::date
    else current_date + v.scheduled_in_days
  end,
  v.collection_status,
  case when v.collection_status = 'Completed' then r.completed_at end,
  r.created_at + interval '1 hour'
from (values
  ('b2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000007', 'sam.whitfield@greenstay.example',  'Pending',     null::integer),
  ('b2000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000008', 'jordan.hale@greenstay.example',    'Pending',     null),
  ('b2000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000009', 'sam.whitfield@greenstay.example',  'Pending',     null),
  ('b2000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000010', 'jordan.hale@greenstay.example',    'Scheduled',   1),
  ('b2000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000011', 'sam.whitfield@greenstay.example',  'Scheduled',   1),
  ('b2000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000012', 'jordan.hale@greenstay.example',    'Scheduled',   0),
  ('b2000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000013', 'sam.whitfield@greenstay.example',  'In Progress', 0),
  ('b2000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000014', 'jordan.hale@greenstay.example',    'In Progress', 0),
  ('b2000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000015', 'sam.whitfield@greenstay.example',  'In Progress', 0),
  ('b2000000-0000-4000-8000-000000000010', 'a1000000-0000-4000-8000-000000000016', 'jordan.hale@greenstay.example',    'Completed',   null),
  ('b2000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000017', 'sam.whitfield@greenstay.example',  'Completed',   null),
  ('b2000000-0000-4000-8000-000000000012', 'a1000000-0000-4000-8000-000000000018', 'jordan.hale@greenstay.example',    'Completed',   null),
  ('b2000000-0000-4000-8000-000000000013', 'a1000000-0000-4000-8000-000000000020', 'sam.whitfield@greenstay.example',  'Completed',   null),
  ('b2000000-0000-4000-8000-000000000014', 'a1000000-0000-4000-8000-000000000022', 'jordan.hale@greenstay.example',    'Completed',   null),
  ('b2000000-0000-4000-8000-000000000015', 'a1000000-0000-4000-8000-000000000024', 'sam.whitfield@greenstay.example',  'Cancelled',   null)
) as v (id, request_id, assignee_email, collection_status, scheduled_in_days)
join public.waste_requests r on r.id    = v.request_id::uuid
join public.users          u on u.email = v.assignee_email
on conflict (id) do nothing;
