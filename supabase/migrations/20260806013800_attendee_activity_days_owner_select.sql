-- PostgREST wraps every mutation in an internal RETURNING clause regardless
-- of the client's Prefer header (it needs the row count either way), and
-- Postgres requires a satisfying SELECT policy for that RETURNING to
-- succeed under RLS — an admin-only SELECT policy isn't enough for an
-- attendee's own insert to go through, even though the INSERT's WITH CHECK
-- already passes. Same pattern as attendee_sessions_owner_all; harmless to
-- let attendees read back their own activity-day rows (just dates).

create policy attendee_activity_days_owner_select
on attendee_activity_days for select
using (attendee_id in (select auth_attendee_id()));
