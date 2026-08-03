-- History Camp Boston 2026 — drop OTP verification for attendees
--
-- Testing showed the 6-digit sign-in code was a real point of confusion for
-- the attendee base, for low practical benefit: this is a low-stakes
-- community event, not a system guarding sensitive data, and the org has
-- decided the (small, accepted) risk of someone entering another attendee's
-- email is an acceptable trade for a frictionless flow. New model:
--
--   * Everyone gets a Supabase anonymous session automatically on app load
--     (no action, no email) — this alone is enough to browse the schedule,
--     since sessions/rooms/time_blocks/programs policies only ever checked
--     auth.role() = 'authenticated', which anonymous sessions satisfy too.
--   * Adding to "My Schedule" or leaving feedback requires claiming an
--     attendee identity by typing the registered email — no code, no link,
--     just a lookup. claim_attendee_by_email() below does that.
--
-- Because anonymous identities are per-device/per-browser (unlike a real
-- verified email, which resolves to the same auth.users row everywhere), a
-- single attendees.user_id column can no longer represent "who's allowed in"
-- — the same person claiming their email from a laptop Wednesday and a phone
-- Saturday needs *both* identities to keep working, permanently, without
-- either one bumping the other. attendee_links replaces user_id with a
-- proper many-to-many table (also handles the existing couples case: one
-- device can claim two attendees sharing an email).

create table attendee_links (
  attendee_id uuid not null references attendees (id) on delete cascade,
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (attendee_id, auth_user_id)
);

create index attendee_links_auth_user_idx on attendee_links (auth_user_id);

alter table attendee_links enable row level security;

-- No client-facing policies: every read/write goes through the
-- SECURITY DEFINER functions below. Admins get a support-debugging escape
-- hatch (e.g. "why can't this attendee see their schedule on their phone").
create policy attendee_links_admin_select
on attendee_links for select
using (auth_is_admin());

-- Carry forward anyone already linked via the old OTP flow so this migration
-- doesn't strand attendees who verified before today.
insert into attendee_links (attendee_id, auth_user_id)
select id, user_id from attendees where user_id is not null
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- auth_attendee_id() now resolves through attendee_links instead of
-- attendees.user_id. Already returned a set (see
-- 20260708120000_couples_and_regfox_fields.sql for the couples case), so
-- every downstream policy that does `attendee_id in (select auth_attendee_id())`
-- keeps working unchanged.
-- ---------------------------------------------------------------------------
drop policy if exists attendee_sessions_owner_all on attendee_sessions;
drop policy if exists session_feedback_owner_select on session_feedback;
drop policy if exists session_feedback_owner_insert on session_feedback;
drop policy if exists conference_feedback_owner_select on conference_feedback;
drop policy if exists conference_feedback_owner_insert on conference_feedback;
drop policy if exists attendees_select_own on attendees;

drop function if exists auth_attendee_id();

create function auth_attendee_id()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select attendee_id from attendee_links where auth_user_id = auth.uid();
$$;

revoke all on function auth_attendee_id() from public;
grant execute on function auth_attendee_id() to authenticated;

create policy attendees_select_own
on attendees for select
using (id in (select auth_attendee_id()) or auth_is_admin());

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

create policy conference_feedback_owner_select
on conference_feedback for select
using (attendee_id in (select auth_attendee_id()));

create policy conference_feedback_owner_insert
on conference_feedback for insert
with check (attendee_id in (select auth_attendee_id()));

-- ---------------------------------------------------------------------------
-- claim_attendee_by_email() replaces link_attendee_to_current_user(). No
-- verification of any kind — it links every attendees row matching the
-- given email to the caller's current auth identity (anonymous or not) and
-- returns them, same shape as before so the client's existing "more than one
-- person" picker keeps working untouched.
-- ---------------------------------------------------------------------------
drop function if exists link_attendee_to_current_user();

create function claim_attendee_by_email(p_email text)
returns setof attendees
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
begin
  if v_email is null or v_email = '' then
    raise exception 'no_email';
  end if;

  insert into attendee_links (attendee_id, auth_user_id)
  select a.id, auth.uid()
  from attendees a
  where lower(a.email) = v_email
  on conflict do nothing;

  return query
  select a.*
  from attendees a
  where lower(a.email) = v_email
    and a.id in (select auth_attendee_id());
end;
$$;

revoke all on function claim_attendee_by_email(text) from public;
grant execute on function claim_attendee_by_email(text) to authenticated;

-- user_id is fully superseded by attendee_links; nothing else reads it.
alter table attendees drop column user_id;
