-- History Camp Boston 2026 — session tags
--
-- Organizers assign each session a set of descriptive tags for browsing in
-- the app (e.g. "American Revolution", "Women's History"). Not in the
-- original PRD data model (PRD 5.2) — added to support tag-based browsing.

alter table sessions add column tags text[] not null default '{}'::text[];

create index sessions_tags_idx on sessions using gin (tags);
