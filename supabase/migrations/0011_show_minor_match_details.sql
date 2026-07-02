-- ════════════════════════════════════════════════════════════════════════
-- Show opponents and notes for under-18 fighters on public match logs.
-- Completes migration 0010: names were unmasked there, but the matches view
-- still nulled opponent/notes for minors, leaving kids' match logs empty of
-- rivals on the public tracker. Same rationale — the site is used internally
-- and Smoothcomp already publishes the full matchlist.
-- ════════════════════════════════════════════════════════════════════════

create or replace view public.public_competition_matches as
select
  cm.id,
  cm.fighter_id,
  cf.competition_id,
  cm.match_order,
  cm.opponent,
  cm.scheduled_at,
  cm.mat,
  cm.round,
  cm.result,
  cm.method,
  cm.score,
  cm.notes,
  cm.created_at
from public.competition_matches cm
join public.competition_fighters cf on cf.id = cm.fighter_id
join public.competitions c on c.id = cf.competition_id
where c.published = true;

grant select on public.public_competition_matches to anon, authenticated;
