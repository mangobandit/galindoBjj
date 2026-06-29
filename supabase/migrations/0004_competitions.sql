-- Competition tracker.
-- Admins manage full fighter details and match logs. Public pages read masked
-- views so under-18 fighter names are never exposed through the public API.

create table if not exists public.competitions (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  organizer        text,
  starts_on        date not null,
  ends_on          date,
  location         text,
  registration_url text,
  bracket_url      text,
  published        boolean not null default true,
  notes            text,
  created_at       timestamptz not null default now()
);

create index if not exists competitions_starts_on_idx on public.competitions (starts_on);
create index if not exists competitions_published_idx on public.competitions (published);

create table if not exists public.competition_fighters (
  id                  uuid primary key default gen_random_uuid(),
  competition_id      uuid not null references public.competitions (id) on delete cascade,
  member_id           uuid references public.members (id) on delete set null,
  full_name           text not null,
  team                text not null default 'Fusion Galindo Jiu-Jitsu',
  is_minor            boolean not null default false,
  age_group           text,
  belt_rank           text,
  division            text,
  weight_class        text,
  gi_nogi             text not null default 'both'
    check (gi_nogi in ('gi', 'nogi', 'both')),
  registration_status text not null default 'needs_signup'
    check (registration_status in ('needs_signup', 'registered', 'confirmed', 'withdrawn')),
  payment_status      text not null default 'unknown'
    check (payment_status in ('unknown', 'unpaid', 'paid')),
  weigh_in_status     text not null default 'unknown'
    check (weigh_in_status in ('unknown', 'pending', 'done')),
  bracket_url         text,
  mat                 text,
  first_match_at      timestamptz,
  result              text not null default 'pending'
    check (result in ('pending', 'gold', 'silver', 'bronze', 'no_medal', 'withdrawn')),
  placement           integer check (placement is null or placement > 0),
  public_notes        text,
  coach_notes         text,
  created_at          timestamptz not null default now()
);

create index if not exists competition_fighters_competition_idx
  on public.competition_fighters (competition_id);
create index if not exists competition_fighters_member_idx
  on public.competition_fighters (member_id);
create index if not exists competition_fighters_status_idx
  on public.competition_fighters (registration_status);

create table if not exists public.competition_matches (
  id           uuid primary key default gen_random_uuid(),
  fighter_id   uuid not null references public.competition_fighters (id) on delete cascade,
  match_order  integer not null default 1 check (match_order > 0),
  opponent     text,
  scheduled_at timestamptz,
  mat          text,
  round        text,
  result       text not null default 'pending'
    check (result in ('pending', 'win', 'loss', 'draw', 'dq')),
  method       text,
  score        text,
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists competition_matches_fighter_idx
  on public.competition_matches (fighter_id);
create index if not exists competition_matches_scheduled_at_idx
  on public.competition_matches (scheduled_at);

alter table public.competitions enable row level security;
alter table public.competition_fighters enable row level security;
alter table public.competition_matches enable row level security;

grant select on public.competitions to anon;
grant select, insert, update, delete
  on public.competitions, public.competition_fighters, public.competition_matches
  to authenticated;

create policy "competitions_public_read" on public.competitions
  for select to anon using (published = true);

create policy "competitions_admin_all" on public.competitions
  for all to authenticated using (true) with check (true);

create policy "competition_fighters_admin_all" on public.competition_fighters
  for all to authenticated using (true) with check (true);

create policy "competition_matches_admin_all" on public.competition_matches
  for all to authenticated using (true) with check (true);

create or replace view public.public_competition_fighters as
select
  cf.id,
  cf.competition_id,
  case
    when cf.is_minor then 'Competidor menor de 18'
    else cf.full_name
  end as display_name,
  cf.team,
  cf.is_minor,
  cf.age_group,
  cf.belt_rank,
  cf.division,
  cf.weight_class,
  cf.gi_nogi,
  cf.registration_status,
  cf.weigh_in_status,
  cf.bracket_url,
  cf.mat,
  cf.first_match_at,
  cf.result,
  cf.placement,
  cf.public_notes,
  cf.created_at
from public.competition_fighters cf
join public.competitions c on c.id = cf.competition_id
where c.published = true;

create or replace view public.public_competition_matches as
select
  cm.id,
  cm.fighter_id,
  cf.competition_id,
  cm.match_order,
  case
    when cf.is_minor then null
    else cm.opponent
  end as opponent,
  cm.scheduled_at,
  cm.mat,
  cm.round,
  cm.result,
  cm.method,
  cm.score,
  case
    when cf.is_minor then null
    else cm.notes
  end as notes,
  cm.created_at
from public.competition_matches cm
join public.competition_fighters cf on cf.id = cm.fighter_id
join public.competitions c on c.id = cf.competition_id
where c.published = true;

grant select on public.public_competition_fighters to anon, authenticated;
grant select on public.public_competition_matches to anon, authenticated;

insert into public.competitions (
  title,
  organizer,
  starts_on,
  location,
  registration_url,
  bracket_url,
  published,
  notes
)
select
  'Kimura Cup Malaga 2026',
  'Kimura Cup Tour',
  '2026-07-04'::date,
  'Palacio San Miguel, Torremolinos (Malaga)',
  'https://kimuracup.smoothcomp.com/es/event/31264',
  'https://kimuracup.smoothcomp.com/en/event/31264/participants',
  true,
  'Seeded test competition. Add Fusion fighters as divisions and match times are published.'
where not exists (
  select 1 from public.competitions
  where title = 'Kimura Cup Malaga 2026'
    and starts_on = '2026-07-04'::date
);
