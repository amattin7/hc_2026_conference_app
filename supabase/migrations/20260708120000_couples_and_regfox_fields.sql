-- History Camp Boston 2026 — RegFox registrant identity, Friends of History
-- Camp flag, and support for two people sharing one registration email.
--
-- Real RegFox exports include registrants who share one email across two
-- people (e.g. a couple who registered together). Email can therefore no
-- longer serve as a unique identity for the CSV import or for a Supabase
-- Auth login: one auth.users account (one email) may now legitimately
-- resolve to more than one attendees row, and the CSV importer keys off
-- RegFox's own per-registration Registrant ID instead of email.

alter table attendees add column regfox_registrant_id text unique;
alter table attendees add column friend_of_history_camp boolean not null default false;

alter table attendees drop constraint if exists attendees_email_key;
alter table attendees drop constraint if exists attendees_user_id_key;

-- attendee_sessions/session_feedback policies reference auth_attendee_id()
-- in their USING/CHECK expressions, so they must be dropped before the
-- function's return type can change from a scalar to a set.
drop policy if exists attendee_sessions_owner_all on attendee_sessions;
drop policy if exists session_feedback_owner_select on session_feedback;
drop policy if exists session_feedback_owner_insert on session_feedback;

drop function if exists auth_attendee_id();

-- Now returns every attendees row linked to the caller instead of assuming
-- one, since a shared-email login can resolve to multiple people.
create function auth_attendee_id()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from attendees where user_id = auth.uid();
$$;

revoke all on function auth_attendee_id() from public;
grant execute on function auth_attendee_id() to authenticated;

create policy attendee_sessions_owner_all
on attendee_sessions for all
using (attendee_id in (select auth_attendee_id()))
with check (attendee_id in (select auth_attendee_id()));

create policy session_feedback_owner_select
on session_feedback for select
using (attendee_id in (select auth_attendee_id()));

create policy session_feedback_owner_insert
on session_feedback for insert
with check (source = 'app' and attendee_id in (select auth_attendee_id()));

-- Re-link now updates every attendees row matching the authenticated email
-- (previously assumed exactly one) and returns them all, so the client can
-- detect the "more than one person" case and ask which one is signing in.
drop function if exists link_attendee_to_current_user();

create function link_attendee_to_current_user()
returns setof attendees
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  v_email := lower(auth.jwt() ->> 'email');
  if v_email is null then
    raise exception 'no_authenticated_email';
  end if;

  return query
  update attendees
  set user_id = auth.uid()
  where lower(email) = v_email
    and (user_id is null or user_id = auth.uid())
  returning *;
end;
$$;

revoke all on function link_attendee_to_current_user() from public;
grant execute on function link_attendee_to_current_user() to authenticated;
