-- ════════════════════════════════════════════════════════════════════════
-- Galindo BJJ — seminars
-- A seminar is a one-off event (a guest instructor, an open mat, a competition
-- prep day) that anyone can sign up to attend, so the Professor has a single
-- attendee list to work from. Mirrors the public-signs-up / coach-manages
-- model already used for `signups`.
-- ════════════════════════════════════════════════════════════════════════

-- ── seminars ────────────────────────────────────────────────────────────
create table if not exists seminars (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  starts_at   timestamptz not null,
  location    text,
  capacity    integer,                 -- null = no fixed limit
  price       numeric(10, 2),          -- null = free
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists seminars_starts_at_idx on seminars (starts_at);
create index if not exists seminars_published_idx  on seminars (published);

-- ── seminar_signups (who's attending a given seminar) ───────────────────
create table if not exists seminar_signups (
  id          uuid primary key default gen_random_uuid(),
  seminar_id  uuid not null references seminars (id) on delete cascade,
  name        text not null,
  contact     text not null,            -- phone or email
  language    language_pref not null default 'es',
  belt_rank   text,                     -- handy for grouping at the event
  message     text,
  created_at  timestamptz not null default now()
);

create index if not exists seminar_signups_seminar_idx on seminar_signups (seminar_id);

-- ════════════════════════════════════════════════════════════════════════
-- Row Level Security
--   Public (anon): may read *published* seminars and submit an attendance
--   sign-up. They can never read the attendee list (who else is going).
--   The coach (authenticated): full control over both tables.
-- ════════════════════════════════════════════════════════════════════════
alter table seminars        enable row level security;
alter table seminar_signups enable row level security;

grant select on seminars to anon;
grant insert on seminar_signups to anon;
grant select, insert, update, delete on seminars, seminar_signups to authenticated;

-- seminars: public sees only published events; coach manages everything.
create policy "seminars_public_read" on seminars
  for select to anon using (published = true);

create policy "seminars_admin_all" on seminars
  for all to authenticated using (true) with check (true);

-- seminar_signups: anyone may sign up; only the coach can read/manage.
create policy "seminar_signups_public_insert" on seminar_signups
  for insert to anon, authenticated with check (true);

create policy "seminar_signups_admin_read" on seminar_signups
  for select to authenticated using (true);

create policy "seminar_signups_admin_update" on seminar_signups
  for update to authenticated using (true) with check (true);

create policy "seminar_signups_admin_delete" on seminar_signups
  for delete to authenticated using (true);
