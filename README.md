# GreenStay: Hotel Waste Management Platform

GreenStay is a portfolio and academic demonstration of a waste-management system for **GreenStay Birmingham Hotel**, a fictional hotel. It is not a real hotel deployment.

Hotel staff report full bins, the system sets a priority from the bin fill level, and a waste manager assigns, schedules and completes collections, then reviews analytics built from the same data.

**Stack:** React, TypeScript, Vite, Tailwind CSS v4, React Router, Supabase (PostgreSQL) and Recharts.

## Portfolio Focus

GreenStay demonstrates business analysis, requirements modelling, workflow design, data reporting, and operational decision support through a fictional hotel waste-management scenario.

## How GreenStay works

```
Report waste → Priority calculated → Manager reviews → Collection assigned → Collection completed → Analytics
```

1. **Report waste.** Staff record the location, waste type, recyclable or non-recyclable classification and bin fill level.
2. **Priority calculated.** GreenStay sets Low, Medium or High priority from the bin fill level (see [Priority rule](#priority-rule)).
3. **Manager reviews.** The waste manager searches and filters the request queue.
4. **Collection assigned.** The manager assigns a collector and schedules a date.
5. **Collection completed.** The collection is started and then marked completed, or the request is cancelled.
6. **Analytics.** The manager reviews trends, waste types, classification, locations, priorities and collection status.

## Features

**Staff workspace**
- Dashboard with request totals and recent requests
- Waste reporting form with validation and an automatically calculated priority
- My requests list and request details, including collection progress

**Waste Manager workspace**
- Operations dashboard: request pipeline, requests needing attention and recent collection activity
- Request management: search by reference or location, and filter by status, priority, waste type and classification
- Collection workflow: assign a collector, schedule, start, complete or cancel, with confirmation for completing and cancelling
- Priority override for open requests
- Analytics dashboard with filters, KPIs, a reporting trend, breakdowns by waste type, classification, location and priority, collection status and completion rate, a location summary and rule-based operational insights calculated from the data

**General**
- Landing page that explains the workflow and lets visitors choose a demo role
- Demo actor selection: choose a seeded staff member, or act as the demo waste manager
- Responsive design for desktop, tablet and mobile; tables become cards on small screens
- Accessible forms, labelled status and priority badges, and text alternatives for charts

## Routes

| Route | Page |
| --- | --- |
| `/` | Landing page and demo role selection |
| `/staff` | Staff dashboard |
| `/staff/report` | Report waste |
| `/staff/requests` | My requests |
| `/staff/requests/:requestId` | Request details (staff view) |
| `/manager` | Waste manager dashboard |
| `/manager/requests` | Request management (search and filters are kept in the URL) |
| `/manager/requests/:requestId` | Request details with collection actions |
| `/manager/analytics` | Analytics dashboard (filters are kept in the URL) |

## Run locally
Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and production build
npm run lint
```

## Environment
Copy `.env.example` to `.env` and fill in the Supabase project URL and **publishable** key. `.env` is git-ignored. Never put a secret or service-role key in the frontend.

## Project structure

| Path | Contents |
| --- | --- |
| `src/pages/` | One component per route |
| `src/components/` | Layout, shared UI, analytics charts, demo actor and manager actions |
| `src/lib/businessRules.ts` | Priority calculation and collection workflow rules |
| `src/lib/analytics.ts` | Analytics calculations (no database access, so each can be checked independently) |
| `src/lib/queries/` | All Supabase reads and writes |
| `src/types/database.ts` | Types and allowed values, matching the database constraints |
| `supabase/` | Database migrations and seed data |

## Database
Supabase PostgreSQL, defined entirely by files in this repo:

| File | Purpose |
| --- | --- |
| `supabase/migrations/001_initial_schema.sql` | Tables, constraints, indexes; enables Row Level Security |
| `supabase/migrations/002_demo_access_policies.sql` | What the publishable key may read and write. Safe to re-run. |
| `supabase/seed.sql` | Fictional demo data (5 users, 8 locations, 25 requests, 15 collections). Safe to re-run. |

To set up a Supabase project, run the three files in that order in the Supabase **SQL Editor**, or with the Supabase CLI (`supabase db push`, then run `seed.sql`).

Tables: `users`, `locations`, `waste_requests` (belongs to a location and the reporting user) and `collections` (belongs to a request and the assigned user). Allowed values are enforced with CHECK constraints and mirrored in `src/types/database.ts`.

### Priority rule
Staff do not choose priority. They choose a **bin fill level category**, and the app sets the priority from it:

| Fill level (shown to staff) | Stored `bin_level` | Priority |
| --- | --- | --- |
| Low · 0–25% | 25 | Low |
| Medium · 25–75% | 50 | Medium |
| High · 75–100% | 100 | High |

The stored `bin_level` is a representative value for the chosen category, not a measured percentage, so the app displays it as the category and its range. Priority is calculated from the stored value by `calculatePriority` in `src/lib/businessRules.ts` (0–49 Low, 50–89 Medium, 90–100 High).

This is the *default* priority. A Waste Manager may override it later, so the database only checks that priority is Low, Medium or High and does not tie it to the bin level.

### Collection workflow
Requests move through **Reported → Assigned → Scheduled → In Progress → Completed**, and any open request can be **Cancelled**. Each step updates the request and its collection together; completed requests and collections always record a completion time. The rules for which actions are available at each stage are in `src/lib/businessRules.ts`.

### Authentication and access
Authentication is intentionally simplified for portfolio demonstration purposes. **Demo mode is not real authentication:** there is no login, every visitor uses the Supabase publishable key, and choosing a staff member or the waste manager role is a demo convenience.

Row Level Security is enabled on every table. The demo policies let any visitor read all tables, report and update waste requests, and create and update collections. Users and locations are read-only, and nothing can be deleted. A real deployment would use Supabase Auth with policies that check each user's role.
