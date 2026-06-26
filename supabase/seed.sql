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
  ('a0000000-0000-0000-0000-000000000001', 'Carlos Mendoza',   '+34 611 223 344', 'carlos.mendoza@example.es', 'es', 'adults', 'Azul',   'active',   '2024-09-12', 'Compite en torneos regionales.', null, null),
  ('a0000000-0000-0000-0000-000000000002', 'Lucía Fernández',  '+34 622 334 455', 'lucia.f@example.es',        'es', 'adults', 'Blanca', 'active',   '2025-01-20', null, null, null),
  ('a0000000-0000-0000-0000-000000000003', 'Marco Rossi',      '+34 633 445 566', 'marco.rossi@example.it',    'it', 'adults', 'Morada', 'active',   '2023-05-03', 'Habla italiano, algo de español.', null, null),
  ('a0000000-0000-0000-0000-000000000004', 'Hans Müller',      '+34 644 556 677', 'hans.mueller@example.de',   'de', 'adults', 'Blanca', 'active',   '2026-02-11', 'Recién llegado de Múnich.', null, null),
  ('a0000000-0000-0000-0000-000000000005', 'James O''Connor',  '+34 655 667 788', 'james.oconnor@example.com', 'en', 'adults', 'Azul',   'active',   '2024-11-02', null, null, null),
  ('a0000000-0000-0000-0000-000000000006', 'Sofía Ramírez',    '+34 666 778 899', 'sofia.ramirez@example.es',  'es', 'adults', 'Marrón', 'active',   '2022-03-15', 'Ayuda a dar clase a los peques.', null, null),
  ('a0000000-0000-0000-0000-000000000007', 'Antonio Ruiz',     '+34 677 889 900', null,                        'es', 'adults', 'Azul',   'active',   '2025-06-30', null, null, null),
  ('a0000000-0000-0000-0000-000000000008', 'Elena García',     '+34 688 990 011', 'elena.garcia@example.es',   'es', 'adults', 'Blanca', 'active',   '2026-03-08', null, null, null),

  -- Kids (active)
  ('c0000000-0000-0000-0000-000000000001', 'Pablo Torres',     null,              null,                        'es', 'kids',   'Gris',   'active',   '2025-09-05', 'Muy aplicado.', 'Marta Torres',   '+34 699 111 222'),
  ('c0000000-0000-0000-0000-000000000002', 'Emma Schmidt',     null,              null,                        'de', 'kids',   'Blanca', 'active',   '2026-01-15', null, 'Klaus Schmidt',  '+34 699 222 333'),
  ('c0000000-0000-0000-0000-000000000003', 'Mateo Díaz',       null,              null,                        'es', 'kids',   'Amarilla','active',  '2024-10-22', 'Hermano de Giulia? no, amigos.', 'Raquel Díaz',    '+34 699 333 444'),
  ('c0000000-0000-0000-0000-000000000004', 'Giulia Bianchi',   null,              null,                        'it', 'kids',   'Blanca', 'active',   '2026-04-01', null, 'Paolo Bianchi',  '+34 699 444 555'),

  -- Prospects (not yet training / pending first class)
  ('b0000000-0000-0000-0000-000000000001', 'Nora Beckmann',    '+34 600 111 000', 'nora.beckmann@example.de',  'de', 'adults', null,     'prospect', '2026-06-18', 'Vino a una clase de prueba.', null, null),
  ('b0000000-0000-0000-0000-000000000002', 'Liam Walsh',       '+34 600 222 000', 'liam.walsh@example.com',    'en', 'adults', null,     'prospect', '2026-06-22', null, null, null),

  -- Inactive (stopped coming)
  ('d0000000-0000-0000-0000-000000000001', 'Javier Soto',      '+34 600 333 000', null,                        'es', 'adults', 'Blanca', 'inactive', '2023-02-10', 'Lesión de rodilla, pausa indefinida.', null, null)
on conflict (id) do nothing;

-- ── Payments ────────────────────────────────────────────────────────────
-- Current month (2026-06): a realistic mix of paid vs due.
--   PAID  : Carlos, Lucía, Marco, Sofía, Pablo, Emma, Mateo
--   DUE   : Hans, James, Antonio, Elena, Giulia  (no row = due)
insert into payments (id, member_id, period, amount, method, paid_on, status) values
  ('11111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-06', 45, 'cash',     '2026-06-03', 'paid'),
  ('11111111-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '2026-06', 45, 'transfer', '2026-06-02', 'paid'),
  ('11111111-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', '2026-06', 45, 'transfer', '2026-06-05', 'paid'),
  ('11111111-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', '2026-06', 45, 'cash',     '2026-06-01', 'paid'),
  ('11111111-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', '2026-06', 35, 'cash',     '2026-06-04', 'paid'),
  ('11111111-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000002', '2026-06', 35, 'transfer', '2026-06-06', 'paid'),
  ('11111111-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000003', '2026-06', 35, 'cash',     '2026-06-07', 'paid')
on conflict (member_id, period) do nothing;

-- Last month (2026-05): nearly everyone paid (history for context).
insert into payments (id, member_id, period, amount, method, paid_on, status) values
  ('22222222-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-05', 45, 'cash',     '2026-05-04', 'paid'),
  ('22222222-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '2026-05', 45, 'transfer', '2026-05-03', 'paid'),
  ('22222222-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', '2026-05', 45, 'transfer', '2026-05-06', 'paid'),
  ('22222222-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', '2026-05', 45, 'cash',     '2026-05-09', 'paid'),
  ('22222222-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', '2026-05', 45, 'cash',     '2026-05-02', 'paid'),
  ('22222222-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', '2026-05', 45, 'transfer', '2026-05-11', 'paid'),
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
