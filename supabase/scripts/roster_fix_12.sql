-- Live-DB roster correction → members AND competitors = these 12 people.
-- Recreates the 11 previously-deleted people; keeps Manuel Santiago (already present).
-- Removes the 7 currently-present people who are not on the list.
-- One transaction (atomic).

begin;

with keep(full_name) as (
  values
    ('Manuel Cabeza García'),
    ('Julio Cuadrado Payan'),
    ('Manuel Santiago Rodriguez Colchon'),
    ('Eduardo García'),
    ('Paula Maria Cabeza Alba'),
    ('Yohana Moreno Salado'),
    ('Thiago Toscano Pardo'),
    ('Francisco Vicente Nande Fernández'),
    ('Adonay Medina Martel'),
    ('Hugo Falcón Sánchez'),
    ('Corayma Valdés Cabeza De Vaca'),
    ('Neiva Aragón Lobo')
)
-- 1. Drop competitors + members not on the list (Domingo, Enrique, Jesús, Pablo, Pedro, Mateo, Norah)
, del_f as (
  delete from public.competition_fighters
  where full_name not in (select full_name from keep) returning 1
)
, del_m as (
  delete from public.members
  where full_name not in (select full_name from keep) returning 1
)
select (select count(*) from del_f) as fighters_removed,
       (select count(*) from del_m) as members_removed;

-- 2. Recreate the 11 missing members (Manuel Santiago already exists → ON CONFLICT skip by name is not unique,
--    so guard each with NOT EXISTS on full_name).
insert into public.members (full_name, language_pref, section, belt_rank, status)
select v.full_name, 'es', v.section, v.belt_rank, 'active'
from (values
  ('Manuel Cabeza García',              'adults', null::text),
  ('Julio Cuadrado Payan',              'adults', 'white:0'),
  ('Eduardo García',                    'adults', null),
  ('Paula Maria Cabeza Alba',           'kids',   null),
  ('Yohana Moreno Salado',              'kids',   null),
  ('Thiago Toscano Pardo',              'kids',   null),
  ('Francisco Vicente Nande Fernández', 'kids',   null),
  ('Adonay Medina Martel',              'kids',   null),
  ('Hugo Falcón Sánchez',               'kids',   null),
  ('Corayma Valdés Cabeza De Vaca',     'kids',   null),
  ('Neiva Aragón Lobo',                 'kids',   null)
) as v(full_name, section, belt_rank)
where not exists (
  select 1 from public.members m where m.full_name = v.full_name
);

-- 3. Create competitor rows (Kimura Cup) for every member now on the roster
--    that does not already have a fighter entry. Links member_id, sets is_minor by section.
insert into public.competition_fighters (
  competition_id, member_id, full_name, is_minor, age_group, belt_rank, gi_nogi, registration_status, result
)
select
  c.id, m.id, m.full_name,
  (m.section = 'kids') as is_minor,
  case when m.section = 'kids' then 'kids' else 'adult' end as age_group,
  m.belt_rank,
  case when m.section = 'kids' then 'gi' else 'both' end as gi_nogi,
  'registered', 'pending'
from public.members m
cross join public.competitions c
where c.title = 'Kimura Cup Malaga 2026'
  and not exists (
    select 1 from public.competition_fighters cf
    where cf.competition_id = c.id and cf.full_name = m.full_name
  );

-- 4. Verify (expect 12 / 12)
select (select count(*) from public.members) as members,
       (select count(*) from public.competition_fighters) as competitors;

commit;
