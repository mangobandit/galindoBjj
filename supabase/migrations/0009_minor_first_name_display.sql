-- ════════════════════════════════════════════════════════════════════════
-- Public competition fighters: show minors as "First L." instead of the
-- fully-anonymised "Competidor menor de 18". Parents can recognise their own
-- child without exposing a full name tied to a mat + time. Admin still sees
-- full names (this only affects the public view). Adults unchanged.
-- ════════════════════════════════════════════════════════════════════════

create or replace view public.public_competition_fighters as
select
  cf.id,
  cf.competition_id,
  case
    when cf.is_minor then
      split_part(cf.full_name, ' ', 1)
      || case
           when split_part(cf.full_name, ' ', 2) <> ''
           then ' ' || left(split_part(cf.full_name, ' ', 2), 1) || '.'
           else ''
         end
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

grant select on public.public_competition_fighters to anon, authenticated;
