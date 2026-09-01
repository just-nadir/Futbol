-- Admin panel: profilga qo'lda ism va rasm qo'yish imkoniyati.
-- Supabase SQL Editor'da bir marta ishga tushiring.

alter table users add column if not exists custom_name text;
alter table users add column if not exists custom_photo_url text;

-- Yuklangan profil rasmlari uchun ochiq (public) bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;
