-- ════════════════════════════════════════════════════════════════════════
-- Galindo BJJ — sample data for demos
-- Safe to run repeatedly (fixed UUIDs + ON CONFLICT DO NOTHING).
-- Mirrors the current gym roster (12 members / competitors).
-- Periods are relative to June 2026 so the dashboard looks "current".
--   current month : 2026-06
--   last month    : 2026-05
-- ════════════════════════════════════════════════════════════════════════

-- ── Members ─────────────────────────────────────────────────────────────
insert into members (id, full_name, phone, email, language_pref, section, belt_rank, status, date_joined) values
  -- Adults
  ('a0000000-0000-0000-0000-000000000001', 'Manuel Cabeza García',              null, null, 'es', 'adults', null,      'active', '2024-09-12'),
  ('a0000000-0000-0000-0000-000000000002', 'Julio Cuadrado Payan',              null, null, 'es', 'adults', 'white:0', 'active', '2025-01-20'),
  ('a0000000-0000-0000-0000-000000000003', 'Manuel Santiago Rodriguez Colchon', null, null, 'es', 'adults', 'white:0', 'active', '2023-05-03'),
  ('a0000000-0000-0000-0000-000000000004', 'Eduardo García',                    null, null, 'es', 'adults', null,      'active', '2024-11-02'),

  -- Kids
  ('c0000000-0000-0000-0000-000000000001', 'Paula Maria Cabeza Alba',           null, null, 'es', 'kids',   null,      'active', '2024-10-22'),
  ('c0000000-0000-0000-0000-000000000002', 'Yohana Moreno Salado',              null, null, 'es', 'kids',   null,      'active', '2025-09-05'),
  ('c0000000-0000-0000-0000-000000000003', 'Thiago Toscano Pardo',              null, null, 'es', 'kids',   null,      'active', '2025-02-10'),
  ('c0000000-0000-0000-0000-000000000004', 'Francisco Vicente Nande Fernández', null, null, 'es', 'kids',   null,      'active', '2024-06-05'),
  ('c0000000-0000-0000-0000-000000000005', 'Adonay Medina Martel',              null, null, 'es', 'kids',   null,      'active', '2025-03-18'),
  ('c0000000-0000-0000-0000-000000000006', 'Hugo Falcón Sánchez',               null, null, 'es', 'kids',   null,      'active', '2024-12-01'),
  ('c0000000-0000-0000-0000-000000000007', 'Corayma Valdés Cabeza De Vaca',     null, null, 'es', 'kids',   null,      'active', '2025-04-22'),
  ('c0000000-0000-0000-0000-000000000008', 'Neiva Aragón Lobo',                 null, null, 'es', 'kids',   null,      'active', '2025-01-09')
on conflict (id) do nothing;

-- ── Sign-ups inbox (pending review) ─────────────────────────────────────
insert into signups (id, name, contact, language, section_interest, message, parent_name, emergency_contact, converted, created_at) values
  ('5160117a-0000-0000-0000-000000000001', 'Andrea Pérez', 'andrea.perez@example.es', 'es', 'adults',
     'Hola, soy principiante total. ¿Hay clases por la mañana?', null, null, false, '2026-06-24 10:12:00+02'),
  ('5160117a-0000-0000-0000-000000000002', 'Thomas Weber', '+34 600 444 111',        'de', 'kids',
     'Mein Sohn (8) möchte anfangen. Sprecht ihr Deutsch?', 'Thomas Weber', '+34 600 444 222', false, '2026-06-25 18:40:00+02'),
  ('5160117a-0000-0000-0000-000000000003', 'Chloé Martin', 'chloe.martin@example.com','en', 'adults',
     'Visiting Marbella for a few months — can I drop in for classes?', null, null, false, '2026-06-26 09:05:00+02')
on conflict (id) do nothing;

-- ── Seminars (one-off events) ───────────────────────────────────────────
-- Two upcoming (public), one already past (history). Dates relative to June 2026.
insert into seminars (id, title, description, starts_at, location, capacity, price, published) values
  ('5e000000-0000-0000-0000-000000000001', 'Open Mat con cinturón negro invitado',
     E'Tarde de open mat con un cinturón negro invitado de Fusion BJJ. Rondas abiertas, preguntas y un par de detalles técnicos. Abierto a todos los niveles — trae Gi y No-Gi si tienes.',
     '2026-07-12 11:00:00+02', 'Academia Galindo, Marbella', 30, 0, true),
  ('5e000000-0000-0000-0000-000000000002', 'Seminario de guardia y pases',
     E'Dos horas centradas en sistema de guardia y pases de presión. Nivel intermedio, pensado para quien ya entrena con regularidad. Plazas limitadas para cuidar el ritmo.',
     '2026-08-09 10:30:00+02', 'Academia Galindo, Marbella', 20, 25, true),
  ('5e000000-0000-0000-0000-000000000003', 'Iniciación al No-Gi',
     E'Sesión introductoria de No-Gi: agarres, control sin kimono y primeras transiciones. Para principiantes.',
     '2026-06-07 11:00:00+02', 'Academia Galindo, Marbella', null, 0, true)
on conflict (id) do nothing;

-- A few attendees so the Professor's list isn't empty in a demo.
insert into seminar_signups (id, seminar_id, name, contact, language, belt_rank, message, created_at) values
  ('5e515000-0000-0000-0000-000000000001', '5e000000-0000-0000-0000-000000000001', 'Manuel Cabeza García',              null, 'es', null,      null, '2026-06-25 19:10:00+02'),
  ('5e515000-0000-0000-0000-000000000002', '5e000000-0000-0000-0000-000000000001', 'Manuel Santiago Rodriguez Colchon', null, 'es', 'white:0', null, '2026-06-26 21:02:00+02'),
  ('5e515000-0000-0000-0000-000000000003', '5e000000-0000-0000-0000-000000000002', 'Eduardo García',                    null, 'es', null,      null, '2026-06-27 07:45:00+02')
on conflict (id) do nothing;

-- ── Competition fighters (Kimura Cup Malaga 2026 roster) ────────────────
-- The Fusion roster entered in the seeded Kimura Cup, linked back to members.
-- Divisions, belts, weights, mats and first-match times come from the
-- Smoothcomp matchlist (event 31264, club 20763, Day 1 = 2026-07-04).
-- Team defaults to 'Fusión BJJ - España.'.
insert into public.competition_fighters (
  competition_id, member_id, full_name, is_minor, age_group, belt_rank,
  division, weight_class, gi_nogi, registration_status, weigh_in_status,
  mat, first_match_at, public_notes, result
)
select
  c.id, f.member_id, f.full_name, f.is_minor, f.age_group, f.belt_rank,
  f.division, f.weight_class, f.gi_nogi, 'confirmed', 'pending',
  f.mat, f.first_match_at::timestamptz, f.public_notes, 'pending'
from public.competitions c
cross join (values
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'Manuel Cabeza García',              false, 'Master 3 (41+)', 'Blue',
     'Male Gi / Blue / Master 3 (41+) / -69 kg (Light)',        '-69 kg', 'gi',   '1',  '2026-07-04 13:19+02', null),
  ('a0000000-0000-0000-0000-000000000002'::uuid, 'Julio Cuadrado Payan',              false, 'Master 1 (30+)', 'White',
     'Male Gi / White / Master 1 (30+) / -69 kg (Light)',       '-69 kg', 'both', '9',  '2026-07-04 14:51+02', 'No-Gi: White / Master 1 / -69 kg — 17:31, Mat 8'),
  ('a0000000-0000-0000-0000-000000000003'::uuid, 'Manuel Santiago Rodriguez Colchon', false, 'Master 1 (30+)', 'White',
     'Male Gi / White / Master 1 (30+) / -62 kg (Feather)',     '-62 kg', 'both', '6',  '2026-07-04 14:37+02', 'No-Gi: White / Adult / -62 kg — 17:04, Mat 9'),
  ('a0000000-0000-0000-0000-000000000004'::uuid, 'Eduardo García',                    false, 'Master 1 (30+)', 'Blue',
     'Male Gi / Blue / Master 1 (30+) / -69 kg (Light)',        '-69 kg', 'both', '1',  '2026-07-04 12:43+02', 'No-Gi: Blue / Master 1 / -69 kg — 16:07, Mat 5'),
  ('c0000000-0000-0000-0000-000000000001'::uuid, 'Paula Maria Cabeza Alba',           true,  'Infant',         'Yellow-Grey',
     'Girls Gi / Yellow-Grey / Combined / -28 kg',              '-28 kg', 'both', '9',  '2026-07-04 10:06+02', 'No-Gi: Yellow-Grey / -32 kg — 11:29, Mat 3 · Orange / -36 kg — 11:35, Mat 6'),
  ('c0000000-0000-0000-0000-000000000002'::uuid, 'Yohana Moreno Salado',              true,  'Junior',         'Grey',
     'Girls Gi / Grey / Junior / -44 kg',                       '-44 kg', 'both', '9',  '2026-07-04 10:23+02', 'No-Gi: Grey / -44 kg — 11:35, Mat 10'),
  ('c0000000-0000-0000-0000-000000000003'::uuid, 'Thiago Toscano Pardo',              true,  'kids 3',         'White',
     'Boys Gi / White / kids 3 / -30 kg',                       '-30 kg', 'both', '10', '2026-07-04 10:03+02', 'No-Gi: White / -27 kg — 11:18, Mat 6'),
  ('c0000000-0000-0000-0000-000000000004'::uuid, 'Francisco Vicente Nande Fernández', true,  'kids 2',         'White',
     'Boys Gi / White / kids 2 / -23 kg',                       '-23 kg', 'both', '2',  '2026-07-04 10:03+02', 'No-Gi: White / -23 kg — 11:23, Mat 3'),
  ('c0000000-0000-0000-0000-000000000005'::uuid, 'Adonay Medina Martel',              true,  'kids 3',         'Grey',
     'Boys Gi / Grey / kids 3 / -30 kg',                        '-30 kg', 'both', '8',  '2026-07-04 10:11+02', 'No-Gi: Grey / -27 kg — 11:26, Mat 7'),
  ('c0000000-0000-0000-0000-000000000006'::uuid, 'Hugo Falcón Sánchez',               true,  'kids 3',         'White',
     'Boys Gi / White / kids 3 / -30 kg',                       '-30 kg', 'both', '10', '2026-07-04 10:00+02', 'No-Gi: White / -30 kg — 11:26, Mat 2'),
  ('c0000000-0000-0000-0000-000000000007'::uuid, 'Corayma Valdés Cabeza De Vaca',     true,  'Infant',         'White',
     'Girls Gi / White / Infant / -40 kg',                      '-40 kg', 'both', '7',  '2026-07-04 10:15+02', 'No-Gi: White / -40 kg — 11:27, Mat 9'),
  ('c0000000-0000-0000-0000-000000000008'::uuid, 'Neiva Aragón Lobo',                 true,  'Youth',          'White',
     'Juvenile Girls Gi / White / Youth / -52 kg',              '-52 kg', 'both', '3',  '2026-07-04 11:09+02', 'No-Gi: White / -52 kg — 12:10, Mat 7')
) as f(member_id, full_name, is_minor, age_group, belt_rank, division, weight_class, gi_nogi, mat, first_match_at, public_notes)
where c.title = 'Kimura Cup Malaga 2026'
  and not exists (
    select 1 from public.competition_fighters existing
    where existing.competition_id = c.id
      and existing.full_name = f.full_name
  );

-- ── Competition matches (Smoothcomp matchlist, Day 1) ───────────────────
-- One row per scheduled match; opponents include their club. Guarded so a
-- fighter who already has matches is left untouched.
insert into public.competition_matches (fighter_id, match_order, opponent, scheduled_at, mat, notes)
select cf.id, v.ord, v.opp, v.at::timestamptz, v.mat, v.notes
from (values
  ('Manuel Cabeza García',              1, 'Aurelio Palomo Suárez (Atitude BJJ Málaga)',                 '2026-07-04 13:19+02', '1',  'Gi · Smoothcomp 1-44'),
  ('Julio Cuadrado Payan',              1, 'Carlos De Cea (OCTO Team Málaga)',                           '2026-07-04 14:51+02', '9',  'Gi · Smoothcomp 9-62'),
  ('Julio Cuadrado Payan',              2, 'Alexis Molina (Crazy Team)',                                 '2026-07-04 17:31+02', '8',  'No-Gi · Smoothcomp 8-89'),
  ('Manuel Santiago Rodriguez Colchon', 1, 'Jesús Serrano Muñoz (Carceglia Team)',                       '2026-07-04 14:37+02', '6',  'Gi · Smoothcomp 6-59'),
  ('Manuel Santiago Rodriguez Colchon', 2, 'Sergio Cortes (TropicalSquadbjj)',                           '2026-07-04 17:04+02', '9',  'No-Gi · Smoothcomp 9-84'),
  ('Eduardo García',                    1, 'Ignacio García Velasco (Next Level Jiu-jitsu)',              '2026-07-04 12:43+02', '1',  'Gi · Smoothcomp 1-38'),
  ('Eduardo García',                    2, 'Antonio Peralta Ramirez (The Flow Academy)',                 '2026-07-04 16:07+02', '5',  'No-Gi · Smoothcomp 5-73'),
  ('Paula Maria Cabeza Alba',           1, 'Yrsa Carlsson Nytomt (The Flow Academy)',                    '2026-07-04 10:06+02', '9',  'Gi · Smoothcomp 9-3'),
  ('Paula Maria Cabeza Alba',           2, 'Farah Benyoussef Royo (Angry Chill BJJ)',                    '2026-07-04 11:29+02', '3',  'No-Gi -32 kg · Smoothcomp 3-24'),
  ('Paula Maria Cabeza Alba',           3, 'Vega Lobo Cervantes (CAI Club La Línea)',                    '2026-07-04 11:35+02', '6',  'No-Gi -36 kg · Smoothcomp 6-26'),
  ('Yohana Moreno Salado',              1, 'Noa Iglesias (Bittan Academy Spain)',                        '2026-07-04 10:23+02', '9',  'Gi · Smoothcomp 9-8'),
  ('Yohana Moreno Salado',              2, 'Fátima Sofía Villalba Mondragón (PlayJitsu)',                '2026-07-04 11:35+02', '10', 'No-Gi · Smoothcomp 10-25'),
  ('Thiago Toscano Pardo',              1, 'Enzo Núñez Barea (Bittan Academy Spain)',                    '2026-07-04 10:03+02', '10', 'Gi · Smoothcomp 10-2'),
  ('Thiago Toscano Pardo',              2, 'Ezra Hanglin Bonnici (Angry Chill BJJ)',                     '2026-07-04 11:18+02', '6',  'No-Gi · Smoothcomp 6-21'),
  ('Francisco Vicente Nande Fernández', 1, 'José Maria Lagos Campos (OCTO Team Málaga)',                 '2026-07-04 10:03+02', '2',  'Gi · Smoothcomp 2-2'),
  ('Francisco Vicente Nande Fernández', 2, 'Antonio Lagos Campos (OCTO Team Málaga)',                    '2026-07-04 11:23+02', '3',  'No-Gi · Smoothcomp 3-22'),
  ('Adonay Medina Martel',              1, 'Thiago Fernández Banffi (Leo Galati JiuJitsu & MMA Marbella)','2026-07-04 10:11+02', '8', 'Gi · Smoothcomp 8-4'),
  ('Adonay Medina Martel',              2, 'Leo Alba (The Honorable Academy)',                           '2026-07-04 11:26+02', '7',  'No-Gi · Smoothcomp 7-23'),
  ('Hugo Falcón Sánchez',               1, 'Matheus Flores (Newaza JiuJitsu Academy)',                   '2026-07-04 10:00+02', '10', 'Gi · Smoothcomp 10-1'),
  ('Hugo Falcón Sánchez',               2, 'Enzo Núñez Barea (Bittan Academy Spain)',                    '2026-07-04 11:26+02', '2',  'No-Gi · Smoothcomp 2-22'),
  ('Corayma Valdés Cabeza De Vaca',     1, 'Martina Solar (Academia Ikigai)',                            '2026-07-04 10:15+02', '7',  'Gi · Smoothcomp 7-6'),
  ('Corayma Valdés Cabeza De Vaca',     2, 'Martina Solar (Academia Ikigai)',                            '2026-07-04 11:27+02', '9',  'No-Gi · Smoothcomp 9-24'),
  ('Neiva Aragón Lobo',                 1, 'Por determinar (perdedora de 3-17)',                         '2026-07-04 11:09+02', '3',  'Gi · Smoothcomp 3-19'),
  ('Neiva Aragón Lobo',                 2, 'Por determinar (perdedora de 7-32)',                         '2026-07-04 12:10+02', '7',  'No-Gi · Smoothcomp 7-34')
) as v(full_name, ord, opp, at, mat, notes)
join public.competition_fighters cf on cf.full_name = v.full_name
where not exists (
  select 1 from public.competition_matches cm where cm.fighter_id = cf.id
);
