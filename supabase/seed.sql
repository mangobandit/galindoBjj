-- ════════════════════════════════════════════════════════════════════════
-- Galindo BJJ — sample data for demos
-- Safe to run repeatedly (fixed UUIDs + ON CONFLICT DO NOTHING).
-- Periods are relative to June 2026 so the dashboard looks "current".
--   current month : 2026-06
--   last month    : 2026-05
-- ════════════════════════════════════════════════════════════════════════

-- ── Members ─────────────────────────────────────────────────────────────
insert into members (id, full_name, phone, email, language_pref, section, belt_rank, status, date_joined, notes, parent_name, emergency_contact) values
  -- Adults (active)
  ('a0000000-0000-0000-0000-000000000001', 'Yoel',            '+34 611 223 344', 'yoel@example.es',            'es', 'adults', 'Azul',   'active',   '2024-09-12', 'Compite en torneos regionales.', null, null),
  ('a0000000-0000-0000-0000-000000000002', 'Nora',            '+34 622 334 455', 'nora@example.es',            'es', 'adults', 'Blanca', 'active',   '2025-01-20', null, null, null),
  ('a0000000-0000-0000-0000-000000000003', 'Sunday',          '+34 633 445 566', 'sunday@example.com',         'en', 'adults', 'Morada', 'active',   '2023-05-03', null, null, null),
  ('a0000000-0000-0000-0000-000000000005', 'Peter',           '+34 655 667 788', 'peter@example.com',          'en', 'adults', 'Azul',   'active',   '2024-11-02', null, null, null),
  ('a0000000-0000-0000-0000-000000000006', 'Manuel Santiago', '+34 666 778 899', 'manuel.santiago@example.es', 'es', 'adults', 'Marrón', 'active',   '2022-03-15', 'Ayuda a dar clase a los peques.', null, null),

  -- Kids (active)
  ('c0000000-0000-0000-0000-000000000001', 'Pablo',           null,              null,                         'es', 'kids',   'Gris',    'active',  '2025-09-05', 'Muy aplicado.', 'Marta Torres', '+34 699 111 222'),
  ('c0000000-0000-0000-0000-000000000003', 'Mateo',           null,              null,                         'es', 'kids',   'Amarilla','active',  '2024-10-22', null, 'Raquel Díaz', '+34 699 333 444'),

  -- Prospect (not yet training / pending first class)
  ('b0000000-0000-0000-0000-000000000001', 'Enrich',          '+34 600 111 000', 'enrich@example.es',          'es', 'adults', null,     'prospect', '2026-06-18', 'Vino a una clase de prueba.', null, null),

  -- Inactive (stopped coming)
  ('d0000000-0000-0000-0000-000000000001', 'Jesus Serrano',   '+34 600 333 000', null,                         'es', 'adults', 'Blanca', 'inactive', '2023-02-10', 'Lesión de rodilla, pausa indefinida.', null, null)
on conflict (id) do nothing;

-- ── Payments ────────────────────────────────────────────────────────────
-- Current month (2026-06): a realistic mix of paid vs due.
--   PAID  : Yoel, Nora, Sunday, Manuel Santiago, Pablo, Mateo
--   DUE   : Peter  (no row = due)
insert into payments (id, member_id, period, amount, method, paid_on, status) values
  ('11111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-06', 45, 'cash',     '2026-06-03', 'paid'),
  ('11111111-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '2026-06', 45, 'transfer', '2026-06-02', 'paid'),
  ('11111111-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', '2026-06', 45, 'transfer', '2026-06-05', 'paid'),
  ('11111111-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', '2026-06', 45, 'cash',     '2026-06-01', 'paid'),
  ('11111111-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', '2026-06', 35, 'cash',     '2026-06-04', 'paid'),
  ('11111111-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000003', '2026-06', 35, 'cash',     '2026-06-07', 'paid')
on conflict (member_id, period) do nothing;

-- Last month (2026-05): nearly everyone paid (history for context).
insert into payments (id, member_id, period, amount, method, paid_on, status) values
  ('22222222-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-05', 45, 'cash',     '2026-05-04', 'paid'),
  ('22222222-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '2026-05', 45, 'transfer', '2026-05-03', 'paid'),
  ('22222222-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', '2026-05', 45, 'transfer', '2026-05-06', 'paid'),
  ('22222222-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', '2026-05', 45, 'cash',     '2026-05-09', 'paid'),
  ('22222222-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', '2026-05', 45, 'cash',     '2026-05-02', 'paid'),
  ('22222222-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', '2026-05', 35, 'cash',     '2026-05-05', 'paid'),
  ('22222222-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000003', '2026-05', 35, 'cash',     '2026-05-08', 'paid')
on conflict (member_id, period) do nothing;

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
  ('5e515000-0000-0000-0000-000000000001', '5e000000-0000-0000-0000-000000000001', 'Yoel',            '+34 611 223 344', 'es', 'Azul',   null, '2026-06-25 19:10:00+02'),
  ('5e515000-0000-0000-0000-000000000002', '5e000000-0000-0000-0000-000000000001', 'Sunday',          'sunday@example.com', 'en', 'Morada', null, '2026-06-26 08:30:00+02'),
  ('5e515000-0000-0000-0000-000000000003', '5e000000-0000-0000-0000-000000000001', 'Manuel Santiago', '+34 666 778 899', 'es', 'Marrón', null, '2026-06-26 21:02:00+02'),
  ('5e515000-0000-0000-0000-000000000004', '5e000000-0000-0000-0000-000000000002', 'Peter',           'peter@example.com', 'en', 'Azul', 'Looking forward to the passing details.', '2026-06-27 07:45:00+02')
on conflict (id) do nothing;

-- ── Competition fighters (Kimura Cup Malaga 2026 roster) ────────────────
-- Fusion competitors entered in the seeded Kimura Cup. Team defaults to
-- 'Fusión BJJ - España.'. Linked back to member rows where they exist.
insert into public.competition_fighters (
  competition_id, member_id, full_name, is_minor, age_group, belt_rank,
  division, weight_class, gi_nogi, registration_status, payment_status,
  weigh_in_status, result
)
select
  c.id, f.member_id, f.full_name, f.is_minor, f.age_group, f.belt_rank,
  f.division, f.weight_class, f.gi_nogi, f.registration_status, f.payment_status,
  f.weigh_in_status, f.result
from public.competitions c
cross join (values
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'Yoel',            false, 'adult', 'Azul',    'Adulto / Azul / -76kg',    '-76kg', 'gi',   'confirmed',   'paid',    'done',    'gold'),
  ('a0000000-0000-0000-0000-000000000002'::uuid, 'Nora',            false, 'adult', 'Blanca',  'Adulto / Blanca / -64kg',  '-64kg', 'gi',   'confirmed',   'paid',    'done',    'silver'),
  ('a0000000-0000-0000-0000-000000000003'::uuid, 'Sunday',          false, 'adult', 'Morada',  'Adulto / Morada / -88kg',  '-88kg', 'both', 'confirmed',   'paid',    'done',    'bronze'),
  ('a0000000-0000-0000-0000-000000000005'::uuid, 'Peter',           false, 'adult', 'Azul',    'Adulto / Azul / -82kg',    '-82kg', 'gi',   'registered',  'paid',    'pending', 'pending'),
  ('a0000000-0000-0000-0000-000000000006'::uuid, 'Manuel Santiago', false, 'adult', 'Marrón',  'Adulto / Marrón / -94kg',  '-94kg', 'both', 'confirmed',   'paid',    'done',    'gold'),
  ('c0000000-0000-0000-0000-000000000001'::uuid, 'Pablo',           true,  'kids',  'Gris',    'Infantil / Gris / -30kg',  '-30kg', 'gi',   'confirmed',   'paid',    'done',    'gold'),
  ('c0000000-0000-0000-0000-000000000003'::uuid, 'Mateo',           true,  'kids',  'Amarilla','Infantil / Amarilla / -34kg','-34kg','gi',  'registered',  'unpaid',  'pending', 'pending'),
  ('b0000000-0000-0000-0000-000000000001'::uuid, 'Enrich',          false, 'adult', 'Blanca',  'Adulto / Blanca / -70kg',  '-70kg', 'nogi', 'needs_signup','unknown', 'unknown', 'pending'),
  ('d0000000-0000-0000-0000-000000000001'::uuid, 'Jesus Serrano',   false, 'adult', 'Blanca',  'Adulto / Blanca / -100kg', '-100kg','gi',  'withdrawn',   'unknown', 'unknown', 'withdrawn')
) as f(member_id, full_name, is_minor, age_group, belt_rank, division, weight_class, gi_nogi, registration_status, payment_status, weigh_in_status, result)
where c.title = 'Kimura Cup Malaga 2026'
  and not exists (
    select 1 from public.competition_fighters existing
    where existing.competition_id = c.id
      and existing.full_name = f.full_name
  );
