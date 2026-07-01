-- ════════════════════════════════════════════════════════════════════════
-- Galindo BJJ — sample data for demos
-- Safe to run repeatedly (fixed UUIDs + ON CONFLICT DO NOTHING).
-- Mirrors the current gym roster (8 members / competitors).
-- Periods are relative to June 2026 so the dashboard looks "current".
--   current month : 2026-06
--   last month    : 2026-05
-- ════════════════════════════════════════════════════════════════════════

-- ── Members ─────────────────────────────────────────────────────────────
insert into members (id, full_name, phone, email, language_pref, section, belt_rank, status, date_joined) values
  -- Adults
  ('a0000000-0000-0000-0000-000000000001', 'Domingo Raposo',                    null, null, 'es', 'adults', null,      'active', '2024-09-12'),
  ('a0000000-0000-0000-0000-000000000002', 'Enrique Jose Veira Rosado',         null, null, 'es', 'adults', null,      'active', '2025-01-20'),
  ('a0000000-0000-0000-0000-000000000003', 'Jesús Serrano Muñoz',               null, null, 'es', 'adults', 'white:0', 'active', '2023-05-03'),
  ('a0000000-0000-0000-0000-000000000004', 'Manuel Santiago Rodriguez Colchon', null, null, 'es', 'adults', 'white:0', 'active', '2024-11-02'),
  ('a0000000-0000-0000-0000-000000000005', 'Pablo Baños Yerga',                 null, null, 'es', 'adults', null,      'active', '2022-03-15'),
  ('a0000000-0000-0000-0000-000000000006', 'Pedro Ignacio Ferrer Peña',         null, null, 'es', 'adults', null,      'active', '2025-06-30'),

  -- Kids
  ('c0000000-0000-0000-0000-000000000001', 'Mateo Baños Bustillo',              null, null, 'es', 'kids',   null,      'active', '2024-10-22'),
  ('c0000000-0000-0000-0000-000000000002', 'Norah García Oliva',                null, null, 'es', 'kids',   null,      'active', '2025-09-05')
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
  ('5e515000-0000-0000-0000-000000000001', '5e000000-0000-0000-0000-000000000001', 'Domingo Raposo',                    null, 'es', null,      null, '2026-06-25 19:10:00+02'),
  ('5e515000-0000-0000-0000-000000000002', '5e000000-0000-0000-0000-000000000001', 'Manuel Santiago Rodriguez Colchon', null, 'es', 'white:0', null, '2026-06-26 21:02:00+02'),
  ('5e515000-0000-0000-0000-000000000003', '5e000000-0000-0000-0000-000000000002', 'Pedro Ignacio Ferrer Peña',         null, 'es', null,      null, '2026-06-27 07:45:00+02')
on conflict (id) do nothing;

-- ── Competition fighters (Kimura Cup Malaga 2026 roster) ────────────────
-- The Fusion roster entered in the seeded Kimura Cup, linked back to members.
-- Team defaults to 'Fusión BJJ - España.'.
insert into public.competition_fighters (
  competition_id, member_id, full_name, is_minor, age_group, belt_rank,
  gi_nogi, registration_status, result
)
select
  c.id, f.member_id, f.full_name, f.is_minor, f.age_group, f.belt_rank,
  f.gi_nogi, f.registration_status, f.result
from public.competitions c
cross join (values
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'Domingo Raposo',                    false, 'adult', null,      'both', 'registered', 'pending'),
  ('a0000000-0000-0000-0000-000000000002'::uuid, 'Enrique Jose Veira Rosado',         false, 'adult', null,      'both', 'registered', 'pending'),
  ('a0000000-0000-0000-0000-000000000003'::uuid, 'Jesús Serrano Muñoz',               false, 'adult', 'white:0', 'both', 'registered', 'pending'),
  ('a0000000-0000-0000-0000-000000000004'::uuid, 'Manuel Santiago Rodriguez Colchon', false, 'adult', 'white:0', 'both', 'registered', 'pending'),
  ('a0000000-0000-0000-0000-000000000005'::uuid, 'Pablo Baños Yerga',                 false, 'adult', null,      'both', 'registered', 'pending'),
  ('a0000000-0000-0000-0000-000000000006'::uuid, 'Pedro Ignacio Ferrer Peña',         false, 'adult', null,      'both', 'registered', 'pending'),
  ('c0000000-0000-0000-0000-000000000001'::uuid, 'Mateo Baños Bustillo',              true,  'kids',  null,      'gi',   'registered', 'pending'),
  ('c0000000-0000-0000-0000-000000000002'::uuid, 'Norah García Oliva',                true,  'kids',  null,      'gi',   'registered', 'pending')
) as f(member_id, full_name, is_minor, age_group, belt_rank, gi_nogi, registration_status, result)
where c.title = 'Kimura Cup Malaga 2026'
  and not exists (
    select 1 from public.competition_fighters existing
    where existing.competition_id = c.id
      and existing.full_name = f.full_name
  );
