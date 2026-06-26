-- ════════════════════════════════════════════════════════════════════════
-- Galindo BJJ — initial schema
-- Phase 1: members, payments, signups (+ merch_requests table scaffolded
-- for Phase 2, no UI yet). Row Level Security locks everything down so the
-- public can only submit sign-ups; the coach (authenticated) manages the rest.
-- ════════════════════════════════════════════════════════════════════════

-- gen_random_uuid()
create extension if not exists "pgcrypto";

-- ── Enums ───────────────────────────────────────────────────────────────
do $$ begin
  create type section as enum ('kids', 'adults');
exception when duplicate_object then null; end $$;

do $$ begin
  create type member_status as enum ('prospect', 'active', 'inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type language_pref as enum ('es', 'en', 'de', 'it');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('cash', 'transfer', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('paid', 'due');
exception when duplicate_object then null; end $$;

do $$ begin
  create type merch_status as enum ('new', 'fulfilled');
exception when duplicate_object then null; end $$;

-- ── members ─────────────────────────────────────────────────────────────
create table if not exists members (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null,
  phone             text,
  email             text,
  language_pref     language_pref not null default 'es',
  section           section not null,
  belt_rank         text,
  status            member_status not null default 'prospect',
  date_joined       date not null default current_date,
  notes             text,
  -- kids-only fields
  parent_name       text,
  emergency_contact text,
  created_at        timestamptz not null default now()
);

create index if not exists members_section_idx on members (section);
create index if not exists members_status_idx  on members (status);

-- ── payments ────────────────────────────────────────────────────────────
-- One row per (member, period). Absence of a 'paid' row for an active member
-- in a period means they are "due" — the dashboard derives that.
create table if not exists payments (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references members (id) on delete cascade,
  period      text not null,                 -- 'YYYY-MM'
  amount      numeric(10, 2),
  method      payment_method,
  paid_on     date,
  status      payment_status not null default 'paid',
  created_at  timestamptz not null default now(),
  unique (member_id, period)
);

create index if not exists payments_period_idx on payments (period);

-- ── signups (public form submissions) ───────────────────────────────────
create table if not exists signups (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  contact           text not null,            -- phone or email
  language          language_pref not null default 'es',
  section_interest  section,
  message           text,
  -- captured when a kid signs up (extends the brief so conversion keeps them)
  parent_name       text,
  emergency_contact text,
  converted         boolean not null default false,
  created_at        timestamptz not null default now()
);

create index if not exists signups_converted_idx on signups (converted);

-- ── merch_requests (Phase 2 — table only, no UI yet) ────────────────────
create table if not exists merch_requests (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid references members (id) on delete set null,
  item        text not null,
  size        text,
  quantity    integer not null default 1,
  notes       text,
  status      merch_status not null default 'new',
  created_at  timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════════════
alter table members        enable row level security;
alter table payments       enable row level security;
alter table signups        enable row level security;
alter table merch_requests enable row level security;

-- Make table privileges explicit (Supabase usually grants these, but be safe).
grant insert on signups to anon;
grant select, insert, update, delete on members, payments, signups, merch_requests to authenticated;

-- members: coach only
create policy "members_admin_all" on members
  for all to authenticated using (true) with check (true);

-- payments: coach only
create policy "payments_admin_all" on payments
  for all to authenticated using (true) with check (true);

-- merch_requests: coach only (public form arrives in Phase 2)
create policy "merch_admin_all" on merch_requests
  for all to authenticated using (true) with check (true);

-- signups: anyone may submit; only the coach can read/manage them.
create policy "signups_public_insert" on signups
  for insert to anon, authenticated with check (true);

create policy "signups_admin_read" on signups
  for select to authenticated using (true);

create policy "signups_admin_update" on signups
  for update to authenticated using (true) with check (true);

create policy "signups_admin_delete" on signups
  for delete to authenticated using (true);
