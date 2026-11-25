-- Initial schema. Review and test in a development Supabase project first.
create extension if not exists pgcrypto;

create table if not exists public.resource_rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ne text not null,
  name_en text not null,
  description_ne text,
  icon text default '📚',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  isbn text,
  title text not null,
  title_ne text,
  author text,
  publisher text,
  publication_year integer,
  category text,
  total_copies integer not null default 1 check (total_copies >= 0),
  available_copies integer not null default 1 check (available_copies >= 0 and available_copies <= total_copies),
  shelf_location text,
  created_at timestamptz not null default now()
);
create index if not exists books_title_idx on public.books using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(title_ne,'')));

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  membership_no text not null unique,
  full_name text not null,
  full_name_ne text,
  phone text,
  email text,
  address text,
  member_type text not null default 'general' check (member_type in ('general','child','youth','women','institutional')),
  status text not null default 'active' check (status in ('active','inactive','suspended')),
  joined_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.book_loans (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id),
  member_id uuid not null references public.members(id),
  issued_at timestamptz not null default now(),
  due_at date not null,
  returned_at timestamptz,
  status text not null default 'issued' check (status in ('issued','returned','overdue','lost')),
  created_at timestamptz not null default now()
);
create index if not exists book_loans_due_idx on public.book_loans(due_at) where returned_at is null;

create table if not exists public.room_activities (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.resource_rooms(id),
  title text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  participant_count integer not null default 0 check (participant_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enable RLS before production. These policies expose only the public room directory
-- and published announcements. Staff CRUD policies must be added with verified roles.
alter table public.resource_rooms enable row level security;
alter table public.books enable row level security;
alter table public.members enable row level security;
alter table public.book_loans enable row level security;
alter table public.room_activities enable row level security;
alter table public.announcements enable row level security;

drop policy if exists "Public can view active rooms" on public.resource_rooms;
create policy "Public can view active rooms" on public.resource_rooms for select using (is_active = true);
drop policy if exists "Public can view published announcements" on public.announcements;
create policy "Public can view published announcements" on public.announcements for select using (is_published = true);

-- No public policies are created for members, loans, books or room activities.
-- Add narrowly scoped staff policies only after implementing a trusted role model.
-- Health/vaccination records are intentionally not modeled in this starter schema.
