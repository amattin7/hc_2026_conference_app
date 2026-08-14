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
for why role lives in `app_metadata`, not `user_metadata`). Admins are the only users who still
go through OTP (see "Sign-in" below), at `/admin/login`. To promote a user to admin:

1. Have them request a code once from `/admin/login`, so their `auth.users` row exists. It's fine
   if they enter the code before the role is set — admin login no longer touches the
   attendee-linking flow at all, so they'd just land in the ordinary browsing view, not get
   rejected. Have them request a fresh code after step 2 instead of reusing the first one.
2. Run:
   ```bash
   npx supabase db query "update auth.users set raw_app_meta_data = raw_app_meta_data || '{\"role\":\"admin\"}'::jsonb where email = '<email>' returning email, raw_app_meta_data;" --linked
   ```
3. They sign in again at `/admin/login` and land on `/admin`.

## Running one-off SQL

`npx supabase db query "<sql>" --linked` runs directly against the live project — useful for
things with no admin UI yet (like the role grant above), but there's no confirmation prompt,
so double-check the SQL (especially `update`/`delete`) before running.

## Test data cleanup

`attendees` (roster rows) and `auth.users` (anonymous or admin identities) are linked by the
`attendee_links` join table (`attendee_id`, `auth_user_id`), `on delete cascade` in both
directions — unlike the old `attendees.user_id` column this replaced, deleting either side
cleans up the link row automatically:

- Delete a test `auth.users` row from Dashboard → Authentication → Users → its `attendee_links`
  rows are removed too; the attendee row itself survives, ready to be claimed by email again from
  a fresh browser session.
- Delete/truncate `attendees` → cascades to that person's `attendee_links`, `attendee_sessions`
  (favorites), and `session_feedback`.
- Because every browser gets its own anonymous `auth.users` row on first visit (see "Sign-in"
  below), test devices accumulate one each — safe to bulk-delete from Authentication → Users
  between test rounds; each browser just gets a new one next load.

**Full reset before the real event:** truncate `attendees` (cascades favorites/feedback with
it), bulk-delete test users from Authentication → Users, then import the real registrant CSV.
`sessions`/`rooms`/`time_blocks`/`programs` are real content, not test data — untouched by this.

**During testing:** use a Gmail `+alias` (e.g. `you+admin@gmail.com`, `you+test1@gmail.com`) per
test persona so they're easy to spot in the dashboard and don't collide with your real account.

There are two synthetic test rows currently in `attendees` sharing `you+couple@gmail.com`
(`Testa Onepartner` / `Testb Twopartner`, `regfox_registrant_id` starting `TEST-COUPLE-`) used
to verify the shared-email fix below — safe to delete once you've tried the "Which of you is
this?" flow yourself, or leave them as a standing test fixture.

## Identity model: email is not unique, and isn't verified either

`attendees.email` is **not** a unique constraint (migration `20260708120000`) — real RegFox
exports include registrants who share one email across two people (e.g. a couple), so claiming
by email can legitimately resolve to more than one `attendees` row. `regfox_registrant_id` is the
real per-registration identity (unique, nullable for manually-added attendees).
`claim_attendee_by_email(p_email)` (migration `20260803150000`) links every matching row to
whatever `auth.uid()` is currently asking, and the client (`AuthContext`) prompts a "Which of you
is this?" screen (`AttendeeSelect.jsx`) when more than one resolves, remembering the choice in
`localStorage` per device — not server-side, since it's just "which hat is this browser wearing,"
not a second identity system.

Linking itself lives in `attendee_links` (`attendee_id`, `auth_user_id`), a many-to-many table —
replaced the old single `attendees.user_id` column because identities are now per-device
(anonymous sessions, see below) rather than per-person: the same attendee claiming their email
from a laptop Wednesday and a phone Saturday needs both to keep working simultaneously, forever,
without either bumping the other. `auth_attendee_id()` reads `attendee_links` and returns a
`setof uuid` (not a scalar) for the couples case above; the `attendee_sessions`/
`session_feedback`/`conference_feedback` owner RLS policies use
`attendee_id in (select auth_attendee_id())` accordingly.

## Sign-in: anonymous browsing + unverified email claim (admins still use OTP)

Testing surfaced the 6-digit OTP code as a real point of confusion for the attendee base, for low
practical benefit on a low-stakes community event — the org accepted the (small) risk of someone
entering another attendee's email as a reasonable trade for a frictionless flow. Current model:

- **Everyone** gets a Supabase anonymous session automatically on first load
  (`supabase.auth.signInAnonymously()` in `AuthContext`'s bootstrap effect) — no action, no email.
  That alone is enough to browse the schedule (`Welcome.jsx` → `/home`, `/schedule`), since those
  tables' RLS policies only ever checked `auth.role() = 'authenticated'`, which anonymous sessions
  satisfy too.
- Saving sessions or leaving feedback requires claiming an attendee identity: `ClaimEmail.jsx`
  (shown by the `RequireAttendee` route guard whenever no attendee is linked yet) calls
  `claimAttendeeByEmail()` → the `claim_attendee_by_email` RPC. No code, no link, no proof of
  ownership — just a lookup.
- **Admins are the exception.** `/admin/login` (`AdminLogin.jsx`) still runs the original two-step
  email → 6-digit code flow: `signInWithEmail()` calls `signInWithOtp`, `verifyCode()` calls
  `verifyOtp({ email, token, type: 'email' })`. The admin console has full read/write access to
  every attendee's data, so it keeps real proof-of-email-ownership. Supabase's email still
  contains a clickable link too (handled transparently by `detectSessionInUrl` in
  `lib/supabase.js`), but nothing in the app depends on it.

Signing out (either layout's "Sign out" button) ends the current session and immediately
establishes a fresh anonymous one — deliberately, so a shared/public device doesn't silently
hand the next person whatever attendee the previous person had claimed.

### Resend SMTP for Auth emails

`supabase/config.toml`'s `[auth.email.smtp]` is live on the hosted project (pushed via
`supabase config push`, `RESEND_SMTP_PASS` set from the Resend API key at push time — never
committed). Sender is `noreply@hc2026app.org`.

`hc2026app.org` is a dedicated throwaway domain (registered on Cloudflare, independent of
`thepursuitofhistory.org`'s own DNS/mail) verified in Resend for SPF/DKIM/DMARC, and separately
pointed at the Vercel deployment as a friendlier public URL. `site_url` and
`additional_redirect_urls` in `config.toml` include `https://hc2026app.org` alongside the
original `hc-2026-conference-app.vercel.app`, so magic-link redirects work from either origin.

To change the sender or re-push after editing `config.toml`:
```bash
export RESEND_SMTP_PASS=<the Resend API key>
npx supabase config push
```

The `email_sent = 200` rate limit in `[auth.rate_limit]` only takes effect with custom SMTP
enabled (which it now is) — it's a no-op under Supabase's built-in sender.

### Event-reliability checklist (ops, not code)

- Supabase free-tier projects can pause after ~7 days of inactivity — make sure it's not asleep
  on 2026-08-08 (regular activity, or upgrade to Pro for the event month).
- Resend's free tier caps at 100 emails/day. Since attendee sign-in no longer sends OTP email at
  all (only admins do, rarely), day-of volume should stay well under 100 — the free tier is
  probably fine now, but double-check if the notification feature (PRD §8.1, also Resend) sees
  heavy same-day use.

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

## Post-event: reactivating for next year

`src/App.jsx` now routes everything except `/admin/*` to `src/components/ThankYou.jsx` — see the
comment at the top of `App.jsx`. The attendee components (`Welcome`, `Home`, `Schedule`,
`SessionDetail`, `MySchedule`, everything under `feedback/`, `Layout`, `ProtectedRoute`'s
`attendee` branch, `RequireAttendee`, `ClaimEmailRedirect`, `AttendeeSelect`) were **not**
deleted, just unrouted, along with their contexts (`ScheduleContext`, `FavoritesContext`). To
bring the app back for a future event: restore the pre-thank-you route tree in `App.jsx` (see git
history around the "Replace live app with post-event thank-you page" commit), re-add the
`AdminLayout` "Preview as attendee" button if wanted, and run the [test data
cleanup](#test-data-cleanup) before loading the new roster.

## Deploy

Vercel auto-deploys on push to `claude/history-camp-boston-pwa-kume5k` (this repo's default
branch — there is no `main`). Live at `https://hc-2026-conference-app.vercel.app` and, once
DNS/Vercel domain setup finished, `https://hc2026app.org`.
