-- Live stream links for competition mats.
-- Configure each mat once per competition, then public fighter/match cards can
-- point viewers to the right webcam based on the stored mat value.

create table if not exists public.competition_mat_streams (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  mat_name       text not null check (btrim(mat_name) <> ''),
  stream_url     text not null check (btrim(stream_url) <> ''),
  stream_label   text,
  sort_order     integer not null default 0,
  notes          text,
  created_at     timestamptz not null default now()
);

create index if not exists competition_mat_streams_competition_idx
  on public.competition_mat_streams (competition_id);

create unique index if not exists competition_mat_streams_unique_mat_idx
  on public.competition_mat_streams (competition_id, lower(btrim(mat_name)));

alter table public.competition_mat_streams enable row level security;

grant select, insert, update, delete
  on public.competition_mat_streams
  to authenticated;

create policy "competition_mat_streams_admin_all"
  on public.competition_mat_streams
  for all to authenticated
  using (true)
  with check (true);

create or replace view public.public_competition_mat_streams as
select
  cms.id,
  cms.competition_id,
  cms.mat_name,
  cms.stream_url,
  cms.stream_label,
  cms.sort_order,
  cms.notes,
  cms.created_at
from public.competition_mat_streams cms
join public.competitions c on c.id = cms.competition_id
where c.published = true;

grant select on public.public_competition_mat_streams to anon, authenticated;
