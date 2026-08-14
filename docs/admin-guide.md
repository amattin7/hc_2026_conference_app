# Admin Guide

For organizers using the `/admin` section day-to-day. For technical/Supabase reference, see
[`operations.md`](./operations.md).

## Post-event: the live site is now a thank-you page

Once the conference wrapped, every attendee-facing route (welcome, home, schedule, my schedule,
feedback) was unrouted in favor of a single static "Thank you for a successful History Camp
2026!" page linking to thepursuitofhistory.org. `/admin/login` and `/admin` still work exactly as
before — sign in normally to pull final reports/exports. See
[`operations.md`](./operations.md#post-event-reactivating-for-next-year) for how to bring the
attendee app back for next year's event.

## Signing in as an admin

Admin accounts are regular Supabase logins, flagged with `role: admin` in their account
metadata. There's no self-service way to become an admin (by design — see
[`operations.md`](./operations.md#granting-admin-access) for how an existing admin/developer
grants it to a new organizer).

Once flagged, sign in at `/admin/login` — enter your email, then enter the 6-digit code emailed
to you. You'll land on `/admin`. This is the one place in the app that still asks for a code:
attendees no longer verify their email at all (see below), but the admin console has full
read/write access to everyone's data, so it keeps real proof of email ownership.

## How attendees sign in now

There's no code or link for attendees anymore — testing found the old 6-digit sign-in code
confusing for the audience, so it was dropped in favor of a frictionless flow:

- Opening the app lands on a welcome screen with a **View Schedule** button — tapping it grants
  full access to browse the schedule immediately, no email required.
- Tapping **My Schedule** or **Feedback** for the first time on a device asks for the email they
  registered with on RegFox. If it matches a row in the attendee list, they're in — no code, no
  confirmation email, nothing to click.
- That's a one-time thing per device/browser: once claimed, the same phone or laptop won't ask
  again, and it stays claimed indefinitely (e.g. someone browsing from a laptop one day and
  picking up on their phone another day both keep working, permanently, without either device
  getting signed out).

This is a deliberate tradeoff: anyone who knows or guesses another attendee's registered email
could view/edit that person's schedule or submit feedback under their name. For this event that
risk was judged low and acceptable relative to the usability win — flag it if that calculus ever
needs revisiting for a different event.

## Attendees

### Importing from RegFox

1. Export attendees from RegFox as CSV.
2. On `/admin`, use **Import RegFox CSV** and select the file.
3. Review the preview: how many rows are new vs. updates, and any skipped rows (missing email,
   first name, or last name, or a canceled registration — these are listed so you can double
   check before importing).
4. Click **Import N rows** to commit.

Matching is by RegFox's own **Registrant ID** column when present (not email) — each
registration row gets its own attendee record even if two people registered with the same
email (e.g. a couple). Re-importing the same file, or an updated export, is safe and just
updates existing records rather than duplicating them. If a CSV has no Registrant ID column
(e.g. a hand-built list of late additions), matching falls back to email.

Column headers are matched flexibly (e.g. "Email", "Email Address", and "E-mail" all work), so
minor RegFox export formatting changes shouldn't break the import. Recognized columns:

| App field | Recognized header variants |
|---|---|
| email | Email, Email Address, E-mail, E-mail Address |
| first_name | First Name, FirstName, First, Name (First Name) |
| last_name | Last Name, LastName, Last, Name (Last Name) |
| lunch | A dedicated Lunch column if present; otherwise derived from Registration Type containing "with Lunch" (RegFox's actual export format — lunch isn't its own column) |
| tshirt_size | T-Shirt Size, Tshirt Size, Shirt Size, T-Shirt, Tshirt, or the "History Camp Boston NNNN T-shirt" product column — the leading quantity ("1 Medium") is stripped automatically |
| friend_of_history_camp | Friends of History Camp, Friend of History Camp — any non-empty value counts as yes |
| regfox_registrant_id | Registrant ID |

Rows with **Registrant Status = canceled** are skipped automatically, reported in the preview
like any other skipped row. Any `($ Amount)` columns are dropped entirely — never imported,
never saved anywhere. The raw **Registration Type** text (e.g. distinguishing an
author/exhibitor registration from a standard one) is kept in that attendee's **Notes** field
for reference. Any other unrecognized column (dietary notes, custom RegFox questions, etc.) is
also preserved in Notes as `Column Name: value`, rather than being dropped.

### Friends of History Camp

Attendees flagged as a Friend of History Camp (RegFox's donor add-on) see a "Thank you for
being a Friend of History Camp" banner on their Home screen. The **Friend** column in the
attendee table shows a ★ for these attendees, and it's also a checkbox on the manual add/edit
form for late additions.

### Couples/families who share one registration email

Some registrants share an email across two people (e.g. a couple who registered together) —
common enough in real RegFox exports that it's handled automatically. Each still gets their
own attendee record (see Registrant ID matching, above). When they claim the shared email, the
app shows a one-time "Which of you is this?" screen — whoever is on that device picks their
name, and the choice is remembered on that device going forward. Each person doing this from
their own device/phone works exactly the same way; nothing needs to be done for the shared
inbox itself.

### Adding or editing a single attendee

Use **+ Add attendee** for last-minute registrations, or **Edit** on any row to correct a
record. Email, first name, and last name are required; everything else is optional.

### Day-of logistics

The **Checked in**, **Shirt claimed**, and **Lunch claimed** checkboxes update immediately —
no save button. Shirt/lunch checkboxes are disabled for attendees who didn't order a shirt /
add lunch, since there's nothing to claim.

## Schedule (`/admin/schedule`)

Three tabs: Time Blocks, Rooms, and Sessions. Set these up in that order, since sessions
reference a time block and room.

### Time Blocks

The periods sessions happen in (e.g. "Block 1 — 9:00–10:00 AM"). Fields: label, start/end
time, and sort order (controls display order in the attendee schedule). Deleting a time block
doesn't delete the sessions in it — they just become unscheduled (no time block shown) until
reassigned.

### Rooms

Fields: name, building, floor, map SVG element ID (for the interactive map, once built —
must match an `id` attribute in the floor plan SVG), and a wayfinding note. Deleting a room
similarly leaves its sessions without a room rather than deleting them.

### Sessions

Full session record: title, description, time block, room, presenter (name, credentials, bio,
website, email), any co-presenters, and status.

- **Co-presenters** are added one at a time via the small form at the bottom of the
  presenter section — each gets their own name/credentials/bio, same as the main presenter.
- **Status** — set to *Canceled* or *Modified* to flag a change; a status note is required in
  either case (e.g. "Room changed to 204") since that's what attendees see. This immediately
  shows on the session (strikethrough/badge) and triggers the in-app alert banner (PRD §8.2)
  for anyone who favorited it.
- When you save an *existing* session with a non-active status, a prompt appears in the
  bottom corner: "Send email notification to attendees who favorited this session?" — **Send**
  emails everyone who favorited it (using the templates from PRD §8.1) and logs it in the
  Dashboard's Notification Log; **Skip** just dismisses it, no email sent. This only appears
  when editing a session that already existed — a brand-new session can't have any favorites
  yet, so there'd be nothing to notify.
- Sending requires `RESEND_API_KEY` to be configured for the project (see
  [`operations.md`](./operations.md#email-notifications)) — until then, Send will show a clear
  "not configured" error rather than silently failing.
- Deleting a session also deletes any attendee favorites and feedback tied to it (the app
  warns before doing this).

## Dashboard (`/admin/dashboard`)

- **Session Interest** — every session with its time block, room, and favorite count; click
  the count column header to flip sort order.
- **Feedback** — total submissions, overall average rating, early-flagged count, and % of
  attendees who've submitted at least one piece of feedback, plus a per-session breakdown
  (app vs. paper submissions, average rating) filterable by time block. **Export CSV**
  downloads every feedback row (session, time block, rating, comment, source, submitted at,
  early-flagged).
- **Notification Log** — every email notification sent from the Sessions tab: which session,
  canceled vs. modified, how many recipients, when, and by whom.

All panels are empty/zero until sessions, feedback, and notifications actually exist — nothing
to configure, they'll populate once the organizers' session data is imported and the event
data starts flowing in.

## Not built yet

Per the PRD, still to come: the interactive floor plan itself (7.3, 6.8) and paper feedback
entry (7.4).
