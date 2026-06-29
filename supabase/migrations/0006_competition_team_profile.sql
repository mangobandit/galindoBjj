-- Official Smoothcomp team profile used to match and verify Fusion competitors.

alter table public.competitions
  add column if not exists team_url text;

alter table public.competition_fighters
  alter column team set default 'Fusión BJJ - España.';

update public.competitions
set team_url = 'https://smoothcomp.com/en/club/20763'
where team_url is null
  and title = 'Kimura Cup Malaga 2026';

update public.competition_fighters
set team = 'Fusión BJJ - España.'
where team in (
  'Fusion Galindo Jiu-Jitsu',
  'Fusion BJJ',
  'Fusión BJJ',
  'Fusión BJJ - España.'
);
