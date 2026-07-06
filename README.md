# History Camp Boston 2026 — Companion App

A Progressive Web App for History Camp Boston 2026 attendees: schedule, personal agenda, and
session feedback. See `PRD.md` for the full product spec.

## Stack

React + Vite, Tailwind CSS, Supabase (Postgres + Auth), deployed to Vercel.

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase project's URL + anon key
npm run dev
```

## Database schema

The full schema and Row Level Security policies live in `supabase/migrations/`. To apply them
to your Supabase project:

- **Dashboard SQL Editor** — paste the contents of each migration file (in order) and run, or
- **Supabase CLI** — `npx supabase link --project-ref <your-project-ref>` then
  `npx supabase db push`

Both migrations have been syntax- and behavior-tested against a real Postgres instance
(schema creation, RLS policies for attendee vs. admin roles, and the feedback
early-submission trigger all verified), but have not been applied to a live Supabase project —
apply them yourself and confirm before going live.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — oxlint
