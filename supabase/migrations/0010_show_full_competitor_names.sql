-- ════════════════════════════════════════════════════════════════════════
-- Show full competitor names on public competition pages.
-- The site is used internally at the gym and the event (Smoothcomp) already
-- publishes the same names, so the minor name-masking is dropped. Reverts
-- migration 0009. (Members data stays admin-only via RLS regardless.)
-- ════════════════════════════════════════════════════════════════════════

create or replace view public.public_competition_fighters as
select
  cf.id,
  cf.competition_id,
  cf.full_name as display_name,
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

grant select on public.public_competition_fighters to anon, authenticated;
