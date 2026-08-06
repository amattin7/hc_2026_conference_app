-- History Camp Boston 2026 — daily app-use tracking for the admin dashboard
--
-- With OTP gone, "signing in" is no longer a discrete event we can look up
-- after the fact (auth.users is full of anonymous rows that persist forever
-- once created, with no per-day record of return visits). To answer "how
-- many attendees opened the app on each day," the client marks one row per
-- attendee per calendar day the first time an attendee is resolved on that
-- device that day (see AuthContext). One row per (attendee, day) — repeat
-- opens the same day are just a no-op upsert.

create table attendee_activity_days (
  attendee_id uuid not null references attendees (id) on delete cascade,
  activity_date date not null,
  primary key (attendee_id, activity_date)
);

alter table attendee_activity_days enable row level security;

-- Attendees can only ever mark their own activity, and only ever insert
-- (never read/update/delete it back) — this is one-way telemetry, not a
-- feature they interact with. Admins get read access for the dashboard.
create policy attendee_activity_days_owner_insert
on attendee_activity_days for insert
with check (attendee_id in (select auth_attendee_id()));

create policy attendee_activity_days_admin_select
on attendee_activity_days for select
using (auth_is_admin());
