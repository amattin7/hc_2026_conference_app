-- History Camp Boston 2026 — feedback about the app/online guide itself,
-- separate from event/session feedback. Same ownership shape as
-- conference_feedback: one row per attendee, insert-once, never edited.
--
-- Includes an owner SELECT policy alongside the owner INSERT one (not just
-- admin SELECT) — PostgREST wraps every insert in an internal RETURNING
-- regardless of the client's Prefer header, and Postgres's RLS requires a
-- satisfying SELECT policy for that RETURNING to succeed, or the insert
-- itself fails even though its WITH CHECK already passes (see
-- 20260806013800_attendee_activity_days_owner_select.sql for how this bit
-- us the first time).

create table app_guide_feedback (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid not null references attendees (id) on delete cascade,
  helpful boolean not null,
  suggestions text,
  submitted_at timestamptz not null default now(),
  unique (attendee_id)
);

create index app_guide_feedback_attendee_idx on app_guide_feedback (attendee_id);

alter table app_guide_feedback enable row level security;

create policy app_guide_feedback_owner_select
on app_guide_feedback for select
using (attendee_id in (select auth_attendee_id()));

create policy app_guide_feedback_owner_insert
on app_guide_feedback for insert
with check (attendee_id in (select auth_attendee_id()));

create policy app_guide_feedback_admin_all
on app_guide_feedback for all
using (auth_is_admin())
with check (auth_is_admin());
