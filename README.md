# GreenStay: Hotel Waste Management Platform

Portfolio demonstration for **GreenStay Birmingham Hotel**, a fictional hotel. This is not a real hotel deployment.

Stack: React, TypeScript, Vite, Tailwind CSS v4, React Router, Supabase (PostgreSQL), Recharts. Hosted on Vercel.

## Status
Phase 1: project setup, app shell, routing and placeholder pages. No data or business logic yet.

## Run locally
Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and production build
npm run lint
```

## Environment
Copy `.env.example` to `.env.local`. Only the Supabase **anon** key goes in the frontend. Never commit the service-role key.
