-- History Camp Boston 2026 — denormalized sender email on notifications_log.
--
-- The admin dashboard's Notification Log panel (PRD 7.5) shows who sent
-- each notification. auth.users isn't exposed via the public API schema,
-- so the sending admin's email is captured at insert time rather than
-- joined from sent_by_admin_id at query time.

alter table notifications_log add column sent_by_email text;
