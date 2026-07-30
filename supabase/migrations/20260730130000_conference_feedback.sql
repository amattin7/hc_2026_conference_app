-- History Camp Boston 2026 — overall conference feedback
--
-- Digitizes the paper "HCB 2026 Survey" (page 1: conference-wide questions).
-- One row per attendee, mirroring session_feedback's ownership model: an
-- attendee can submit once and read their own submission, but never
-- edit/delete it after the fact. Not in the original PRD data model.

create table conference_feedback (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid not null references attendees (id) on delete cascade,
  overall_rating integer not null check (overall_rating between 1 and 10),
  recommend integer not null check (recommend between 1 and 10),
  travel_from text,
  reason text,
  describe_to_friend text,
  sunday_tours text,
  poh_weekend text check (poh_weekend in ('Yes!', 'Plan to in the future', 'Not interested')),
  how_heard text[] not null default '{}'::text[],
  destination text,
  change text,
  historian text,
  other_comments text,
  submitted_at timestamptz not null default now(),
  unique (attendee_id)
);

create index conference_feedback_attendee_idx on conference_feedback (attendee_id);

alter table conference_feedback enable row level security;

-- Same shape as session_feedback's owner policies (see
-- 20260708120000_couples_and_regfox_fields.sql for why auth_attendee_id()
-- returns a set): read/insert your own row only, never update/delete it.
create policy conference_feedback_owner_select
on conference_feedback for select
using (attendee_id in (select auth_attendee_id()));

create policy conference_feedback_owner_insert
on conference_feedback for insert
with check (attendee_id in (select auth_attendee_id()));

create policy conference_feedback_admin_all
on conference_feedback for all
using (auth_is_admin())
with check (auth_is_admin());
