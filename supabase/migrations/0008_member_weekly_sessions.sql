-- ════════════════════════════════════════════════════════════════════════
-- Galindo BJJ — add weekly training frequency to members
-- How many days per week the member trains (1–7). NULL = not set.
-- ════════════════════════════════════════════════════════════════════════

alter table members
  add column if not exists weekly_sessions smallint
  check (weekly_sessions is null or (weekly_sessions between 1 and 7));
