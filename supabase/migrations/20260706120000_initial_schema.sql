-- History Camp Boston 2026 — initial schema
-- Tables per PRD Section 5. Run this before 20260706120100_rls_policies.sql.

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 5.3 time_blocks
create table time_blocks (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  sort_order integer not null default 0,
  constraint time_blocks_end_after_start check (end_time > start_time)
);

-- 5.4 rooms
create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  map_svg_id text,
  floor text,
  building text,
  notes text
);

-- 5.1 attendees
create table attendees (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text not null,
  last_name text not null,
  lunch boolean not null default false,
  tshirt_size text,
  tshirt_claimed boolean not null default false,
  lunch_claimed boolean not null default false,
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  notes text,
  user_id uuid unique references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index attendees_email_idx on attendees (lower(email));

create trigger attendees_set_updated_at
before update on attendees
for each row execute function set_updated_at();

-- 5.2 sessions
create table sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  presenter_name text not null,
  presenter_credentials text,
  presenter_bio text,
  presenter_website text,
  presenter_email text,
  session_description text,
  co_presenters jsonb not null default '[]'::jsonb,
  time_block_id uuid references time_blocks (id) on delete set null,
  room_id uuid references rooms (id) on delete set null,
  status text not null default 'active' check (status in ('active', 'canceled', 'modified')),
  status_note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sessions_time_block_idx on sessions (time_block_id);
create index sessions_room_idx on sessions (room_id);
create index sessions_status_idx on sessions (status);

create trigger sessions_set_updated_at
before update on sessions
for each row execute function set_updated_at();

-- 5.5 attendee_sessions (favorites)
create table attendee_sessions (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid not null references attendees (id) on delete cascade,
  session_id uuid not null references sessions (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (attendee_id, session_id)
);

create index attendee_sessions_attendee_idx on attendee_sessions (attendee_id);
create index attendee_sessions_session_idx on attendee_sessions (session_id);

-- 5.6 session_feedback
create table session_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  attendee_id uuid references attendees (id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  source text not null default 'app' check (source in ('app', 'paper')),
  -- Admin-entered text note for paper forms (PRD 7.4) — intentionally not a
  -- foreign key: paper respondents are identified by name only, never linked
  -- to an attendee record.
  paper_respondent_name text,
  submitted_at timestamptz not null default now(),
  flagged_early boolean not null default false,
  entered_by_admin_id uuid references auth.users (id) on delete set null,
  constraint session_feedback_app_requires_attendee
    check (source <> 'app' or attendee_id is not null),
  constraint session_feedback_paper_has_no_attendee_link
    check (source <> 'paper' or attendee_id is null),
  constraint session_feedback_paper_requires_admin
    check (source <> 'paper' or entered_by_admin_id is not null),
  -- One app submission per attendee per session. Paper rows always have a
  -- null attendee_id, and Postgres treats NULLs as distinct for uniqueness,
  -- so paper entries never collide with this constraint (PRD 5.6).
  unique (attendee_id, session_id)
);

create index session_feedback_session_idx on session_feedback (session_id);
create index session_feedback_attendee_idx on session_feedback (attendee_id);

-- Auto-derive flagged_early server-side so it can't be spoofed by a client
-- submitting a false value (PRD 6.7 / 5.6).
create or replace function set_feedback_flagged_early()
returns trigger
language plpgsql
as $$
declare
  v_start timestamptz;
begin
  select tb.start_time into v_start
  from sessions s
  join time_blocks tb on tb.id = s.time_block_id
  where s.id = new.session_id;

  new.flagged_early := (v_start is not null and new.submitted_at < v_start);
  return new;
end;
$$;

create trigger session_feedback_flag_early
before insert on session_feedback
for each row execute function set_feedback_flagged_early();

-- 5.7 programs
create table programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text,
  image_url text,
  sort_order integer not null default 0,
  active boolean not null default true
);

-- 5.8 notifications_log
create table notifications_log (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions (id) on delete set null,
  trigger_event text not null check (trigger_event in ('session_canceled', 'session_modified')),
  recipients_count integer not null default 0,
  sent_at timestamptz not null default now(),
  sent_by_admin_id uuid references auth.users (id) on delete set null
);

-- Links the just-authenticated user to their RegFox record by email.
-- SECURITY DEFINER so it can update attendees.user_id without granting
-- attendees a blanket self-service UPDATE policy (see RLS migration for why
-- that would otherwise let one attendee claim another's record).
create or replace function link_attendee_to_current_user()
returns attendees
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_attendee attendees;
begin
  v_email := lower(auth.jwt() ->> 'email');
  if v_email is null then
    raise exception 'no_authenticated_email';
  end if;

  update attendees
  set user_id = auth.uid()
  where lower(email) = v_email
    and (user_id is null or user_id = auth.uid())
  returning * into v_attendee;

  if v_attendee.id is null then
    raise exception 'no_matching_attendee';
  end if;

  return v_attendee;
end;
$$;

revoke all on function link_attendee_to_current_user() from public;
grant execute on function link_attendee_to_current_user() to authenticated;
