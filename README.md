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

The full schema and Row Level Security policies live in `supabase/migrations/`, applied via
`npx supabase db push`. See [`docs/operations.md`](./docs/operations.md) for CLI setup and
common tasks (linking a project, granting admin access, test data cleanup).

## Documentation

- [`PRD.md`](./PRD.md) — full product spec
- [`docs/admin-guide.md`](./docs/admin-guide.md) — using the `/admin` panel (CSV import, attendee management)
- [`docs/operations.md`](./docs/operations.md) — Supabase/CLI reference for developers

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — oxlint
