-- Seminar poster uploads.
-- Posters live in a public Storage bucket and seminars keep the public URL.

alter table public.seminars
  add column if not exists poster_url text;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'seminar-posters',
  'seminar-posters',
  true,
  8388608,
  array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "seminar_posters_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'seminar-posters');

create policy "seminar_posters_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'seminar-posters');

create policy "seminar_posters_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'seminar-posters')
  with check (bucket_id = 'seminar-posters');

create policy "seminar_posters_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'seminar-posters');
