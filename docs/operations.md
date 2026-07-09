# Operations Guide

Technical reference for developers/maintainers. For day-to-day admin panel usage, see
[`admin-guide.md`](./admin-guide.md).

## Project

- **Supabase project:** "History Camp 2026", ref `xsuuqiinbgcenknqiiem`, region us-west-2.
- **Dashboard:** supabase.com/dashboard/project/xsuuqiinbgcenknqiiem

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev
```

Get the URL/anon key from Dashboard → Settings → API, or:

```bash
npx supabase projects api-keys --project-ref xsuuqiinbgcenknqiiem
```

Use the `publishable` key type for `VITE_SUPABASE_ANON_KEY` (the newer non-JWT format).
`SUPABASE_SERVICE_ROLE_KEY` in `.env.local.example` is unused by the client app — nothing in
`src/` reads it — leave it blank unless a server-side script needs it later.

## Supabase CLI auth

On Windows PowerShell, `npx supabase login` may fail with a script-execution-policy error.
Either run `npx.cmd supabase login` instead, or use Git Bash.

`supabase login` opens a browser OAuth flow and stores the session locally — no access token
ever needs to be typed into a chat/terminal transcript. Once logged in on a machine, CLI
commands there (link, db push, db query) work without re-entering credentials.

## Schema changes

Migrations live in `supabase/migrations/`, applied in filename order.

```bash
npx supabase link --project-ref xsuuqiinbgcenknqiiem   # one-time per machine
npx supabase migration list                             # check local vs. remote state
npx supabase db push                                     # apply pending migrations
```

New migration files should be added for schema changes rather than editing already-applied
ones — `db push` only applies files it hasn't seen before.

## Granting admin access

There's no UI for this (by design — see `supabase/migrations/20260706120100_rls_policies.sql`
for why role lives in `app_metadata`, not `user_metadata`). To promote a user to admin:

1. Have them enter their email on the login screen once, so their `auth.users` row exists
   (**don't** enter the code they receive yet — until the role is set, they'd be routed through
   the attendee-linking flow and rejected for having no matching registration).
2. Run:
   ```bash
   npx supabase db query "update auth.users set raw_app_meta_data = raw_app_meta_data || '{\"role\":\"admin\"}'::jsonb where email = '<email>' returning email, raw_app_meta_data;" --linked
   ```
3. They enter the code and land on `/admin`.

## Running one-off SQL

`npx supabase db query "<sql>" --linked` runs directly against the live project — useful for
things with no admin UI yet (like the role grant above), but there's no confirmation prompt,
so double-check the SQL (especially `update`/`delete`) before running.

## Test data cleanup

`attendees` (roster rows) and `auth.users` (logins) are linked by `attendees.user_id`, but
`on delete set null` — deleting one doesn't cascade to the other:

- Delete a test login from Dashboard → Authentication → Users → their attendee row survives,
  just unlinked, ready to be logged into again.
- Delete/truncate `attendees` → cascades to that person's `attendee_sessions` (favorites) and
  `session_feedback`, but their login still exists.

**Full reset before the real event:** truncate `attendees` (cascades favorites/feedback with
it), bulk-delete test users from Authentication → Users, then import the real registrant CSV.
`sessions`/`rooms`/`time_blocks`/`programs` are real content, not test data — untouched by this.

**During testing:** use a Gmail `+alias` (e.g. `you+admin@gmail.com`, `you+test1@gmail.com`) per
test persona so they're easy to spot in the dashboard and don't collide with your real account.

There are two synthetic test rows currently in `attendees` sharing `you+couple@gmail.com`
(`Testa Onepartner` / `Testb Twopartner`, `regfox_registrant_id` starting `TEST-COUPLE-`) used
to verify the shared-email fix below — safe to delete once you've tried the "Which of you is
this?" flow yourself, or leave them as a standing test fixture.

## Identity model: email is not unique

`attendees.email` and `attendees.user_id` are **not** unique constraints (migration
`20260708120000`) — real RegFox exports include registrants who share one email across two
people (e.g. a couple), so one login can legitimately resolve to more than one `attendees` row.
`regfox_registrant_id` is the real per-registration identity now (unique, nullable for
manually-added attendees). `link_attendee_to_current_user()` links every matching row to the
signed-in user, and the client (`AuthContext`) prompts a "Which of you is this?" screen
(`AttendeeSelect.jsx`) when more than one resolves, remembering the choice in
`localStorage` per device — not server-side, since it's just "which hat is this browser
wearing," not a second identity system. `auth_attendee_id()` returns a `setof uuid` rather than
a scalar for the same reason; the `attendee_sessions`/`session_feedback` owner RLS policies use
`attendee_id in (select auth_attendee_id())` accordingly.

## Sign-in: OTP codes, not magic links

Auth Update PRD (2026-07-08). `Login.jsx` is a two-step email → 6-digit code screen:
`signInWithOtp` requests the code, a new `verifyCode()` in `AuthContext.jsx` calls
`verifyOtp({ email, token, type: 'email' })` to consume it. Supabase's email still contains a
clickable link too (handled transparently by `detectSessionInUrl` in `lib/supabase.js`, kept as
a fallback per the PRD), but nothing in the app depends on it anymore.

Deliberately did **not** set `shouldCreateUser: false` on the OTP request, despite the PRD
suggesting it — that flag would block every attendee's *first-ever* login (Supabase
auto-creates their `auth.users` row on first sign-in; nothing distinguishes "legitimate
attendee, first login" from "rejected stranger" at the Auth layer). Rejection of unregistered
emails already happens correctly downstream, via `link_attendee_to_current_user()` finding no
matching row — a stranger can request a code but can never get past that check.

### Resend SMTP for Auth emails

`supabase/config.toml`'s `[auth.email.smtp]` is configured for Resend (`smtp.resend.com`,
user `resend`, `pass = "env(RESEND_SMTP_PASS)"`) but **not yet applied to the live project** —
config.toml changes only take effect after `supabase config push`, which hasn't been run for
this. Sequence to actually enable it:

1. In Resend's dashboard, add and verify the domain `thepursuitofhistory.org` — this generates
   DKIM/SPF (on a `send.` subdomain, so it won't conflict with the org's existing IONOS mail)
   and MX bounce-feedback records. Relay those exact records to whoever administers the
   `thepursuitofhistory.org` DNS (IONOS) — allow 24–72h for propagation, so do this well before
   the event.
2. Once verified, set the SMTP password in the shell that will run the push (don't paste the
   raw key into chat — same reasoning as the CLI access token earlier):
   ```powershell
   $env:RESEND_SMTP_PASS = "re_xxx"
   npx supabase config push
   ```
3. Confirm in Dashboard → Authentication → Emails that sends are going out via Resend, not the
   built-in sender.

Until this is done, Supabase keeps using its own built-in sender, capped at a **very low**
default volume (~2/hour) — fine for occasional testing, but this is exactly what will break
attendee logins on event morning if not fixed beforehand. The `email_sent = 200` rate limit in
`[auth.rate_limit]` only takes effect once step 2 above has run; it's a no-op with the built-in
sender.

### Event-reliability checklist (ops, not code)

- Supabase free-tier projects can pause after ~7 days of inactivity — make sure it's not asleep
  on 2026-08-08 (regular activity, or upgrade to Pro for the event month).
- Resend's free tier caps at 100 emails/day — event-morning logins + resends + any last testing
  could exceed that. Upgrade to Resend Pro for the event month, or confirm day-of volume will
  stay under 100.

## Email notifications

`supabase/functions/send-session-notification/` is a Supabase Edge Function (Deno), triggered
from `SessionsPanel.jsx` via `supabase.functions.invoke(...)` when an admin confirms sending a
cancel/modify notification (PRD §8.1). It verifies the caller is an authenticated admin itself
(checks `app_metadata.role` via the caller's JWT) before doing anything — don't rely solely on
`verify_jwt` at the gateway level, that only proves *some* valid Supabase session, not admin.

Deploy after any change:
```bash
npx supabase functions deploy send-session-notification --project-ref xsuuqiinbgcenknqiiem
```
The "Docker is not running" warning during deploy is harmless — deploy still completes via
direct asset upload; Docker is only needed for `functions serve` (local testing), not for a
remote deploy.

This is the same Resend account as the Auth SMTP setup above, just plumbed differently — an
Edge Function secret here (`supabase secrets set`) vs. a shell env var at `config push` time
there (`RESEND_SMTP_PASS`). Same API key value works for both.

**Required secrets** (not yet set — sending will fail with a clear "not configured" error
until they are):
```bash
npx supabase secrets set RESEND_API_KEY=re_xxx --project-ref xsuuqiinbgcenknqiiem
npx supabase secrets set RESEND_FROM_EMAIL=notifications@app.historycamp.org --project-ref xsuuqiinbgcenknqiiem
```
`RESEND_FROM_EMAIL` defaults to Resend's `onboarding@resend.dev` sandbox sender if unset, which
works immediately with no domain setup — fine for testing, but PRD Open Question §12.4 (sending
domain, SPF/DKIM) still needs an organizer decision before using a real `@historycamp.org`
address for production sends.

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically
inside every Edge Function's environment — no need to set those as secrets.

## Deploy

Not yet configured — PRD calls for Vercel with auto-deploy on push to `main` (§4.2, §10.3).
