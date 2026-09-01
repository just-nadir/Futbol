-- Futbol Mini App uchun jadvallar. Supabase SQL Editor'da bir marta ishga tushiring.

create table if not exists users (
  id bigint primary key,
  first_name text not null,
  last_name text,
  username text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  location text not null,
  max_spots int not null,
  min_players int not null default 8,
  created_by bigint not null references users(id),
  teams jsonb,
  reminder_sent_at timestamptz,
  low_headcount_alert_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists rsvps (
  id bigserial primary key,
  match_id uuid not null references matches(id) on delete cascade,
  user_id bigint not null references users(id),
  status text not null check (status in ('going', 'not_going', 'maybe')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, user_id)
);

create index if not exists rsvps_match_id_idx on rsvps (match_id);
create index if not exists matches_starts_at_idx on matches (starts_at);

alter table users enable row level security;
alter table matches enable row level security;
alter table rsvps enable row level security;

-- Guruh a'zolari uchun hech qanday maxfiy ma'lumot yo'q — hamma narsani o'qish mumkin.
-- Yozish faqat server tomonidan (service role kaliti bilan, RLS'ni chetlab o'tib) amalga oshiriladi.
create policy "public read users" on users for select using (true);
create policy "public read matches" on matches for select using (true);
create policy "public read rsvps" on rsvps for select using (true);
