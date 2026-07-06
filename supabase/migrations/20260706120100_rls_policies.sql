-- History Camp Boston 2026 — Row Level Security
-- Run after 20260706120000_initial_schema.sql.

-- ---------------------------------------------------------------------------
-- Role check.
--
-- PRD 3.3 says the role flag lives in "Supabase user metadata". We store it
-- in app_metadata rather than user_metadata: user_metadata is editable by the
-- user themselves via supabase.auth.updateUser(), so an admin flag stored
-- there would let any attendee grant themselves admin access. app_metadata
-- can only be set with the service role key (e.g. from the Supabase
-- dashboard or a trusted server action), which is what admin role assignment
-- requires.
-- ---------------------------------------------------------------------------
create or replace function auth_is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Resolves the attendees.id row for the currently authenticated user.
-- SECURITY DEFINER so it can read attendees regardless of the caller's RLS
-- grants, avoiding recursive policy evaluation when used inside attendees'
-- own policies.
create or replace function auth_attendee_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from attendees where user_id = auth.uid();
$$;

revoke all on function auth_is_admin() from public;
revoke all on function auth_attendee_id() from public;
grant execute on function auth_is_admin() to authenticated;
grant execute on function auth_attendee_id() to authenticated;

alter table attendees enable row level security;
alter table sessions enable row level security;
alter table time_blocks enable row level security;
alter table rooms enable row level security;
alter table attendee_sessions enable row level security;
alter table session_feedback enable row level security;
alter table programs enable row level security;
alter table notifications_log enable row level security;

-- ---------------------------------------------------------------------------
-- attendees — read-only for the owner (PRD 6.3: registration summary is
-- read-only); linking user_id happens exclusively via the SECURITY DEFINER
-- link_attendee_to_current_user() function, not a client-facing UPDATE
-- policy, so one attendee can never repoint another attendee's row to
-- themselves. Admins get full CRUD for CSV import / manual edit (PRD 7.1).
-- ---------------------------------------------------------------------------
create policy attendees_select_own
on attendees for select
using (user_id = auth.uid() or auth_is_admin());

create policy attendees_admin_write
on attendees for all
using (auth_is_admin())
with check (auth_is_admin());

-- ---------------------------------------------------------------------------
-- time_blocks / rooms — read-only reference data for any signed-in user;
-- only admins manage them (PRD 7.3).
-- ---------------------------------------------------------------------------
create policy time_blocks_select_authenticated
on time_blocks for select
using (auth.role() = 'authenticated');

create policy time_blocks_admin_write
on time_blocks for all
using (auth_is_admin())
with check (auth_is_admin());

create policy rooms_select_authenticated
on rooms for select
using (auth.role() = 'authenticated');

create policy rooms_admin_write
on rooms for all
using (auth_is_admin())
with check (auth_is_admin());

-- ---------------------------------------------------------------------------
-- sessions — full schedule is readable by any signed-in attendee (PRD 6.4);
-- only admins create/edit/cancel sessions (PRD 7.2).
-- ---------------------------------------------------------------------------
create policy sessions_select_authenticated
on sessions for select
using (auth.role() = 'authenticated');

create policy sessions_admin_write
on sessions for all
using (auth_is_admin())
with check (auth_is_admin());

-- ---------------------------------------------------------------------------
-- attendee_sessions (favorites) — an attendee manages only their own
-- favorites; admins get read access for the Session Interest dashboard
-- panel (PRD 7.5).
-- ---------------------------------------------------------------------------
create policy attendee_sessions_owner_all
on attendee_sessions for all
using (attendee_id = auth_attendee_id())
with check (attendee_id = auth_attendee_id());

create policy attendee_sessions_admin_select
on attendee_sessions for select
using (auth_is_admin());

-- ---------------------------------------------------------------------------
-- session_feedback — an attendee can submit and later view their own
-- feedback, but not edit/delete it post-submission (PRD 6.7: the form
-- becomes read-only after submit). Admins get full access for paper entry
-- (PRD 7.4) and dashboard reporting (PRD 7.5).
-- ---------------------------------------------------------------------------
create policy session_feedback_owner_select
on session_feedback for select
using (attendee_id = auth_attendee_id());

create policy session_feedback_owner_insert
on session_feedback for insert
with check (source = 'app' and attendee_id = auth_attendee_id());

create policy session_feedback_admin_all
on session_feedback for all
using (auth_is_admin())
with check (auth_is_admin());

-- ---------------------------------------------------------------------------
-- programs — readable by any signed-in attendee (PRD 6.9); admin-managed.
-- ---------------------------------------------------------------------------
create policy programs_select_authenticated
on programs for select
using (auth.role() = 'authenticated');

create policy programs_admin_write
on programs for all
using (auth_is_admin())
with check (auth_is_admin());

-- ---------------------------------------------------------------------------
-- notifications_log — admin-only audit trail (PRD 7.5). No attendee access.
-- ---------------------------------------------------------------------------
create policy notifications_log_admin_all
on notifications_log for all
using (auth_is_admin())
with check (auth_is_admin());
