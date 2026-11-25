-- Staff identity and role-based access control.
-- Apply after 0001_initial_schema.sql in the Supabase SQL Editor.
-- Never allow a user to set their own role from the browser.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'member'
    check (role in ('super_admin','library_admin','librarian','room_manager','staff','member')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'member')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

create or replace function public.has_any_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role = any(allowed_roles)
  );
$$;

revoke all on function public.has_any_role(text[]) from public;
grant execute on function public.has_any_role(text[]) to authenticated;

drop policy if exists "Users can view own profile or admins can view all" on public.profiles;
create policy "Users can view own profile or admins can view all"
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or public.has_any_role(array['super_admin','library_admin'])
);

-- Intentionally no client-side INSERT or UPDATE policy on profiles.
-- Assign/change roles only from the trusted Supabase SQL Editor.

-- Books are the public catalogue; only authorized library staff can change records.
drop policy if exists "Public can view book catalogue" on public.books;
create policy "Public can view book catalogue"
on public.books for select to anon, authenticated using (true);

drop policy if exists "Library staff can add books" on public.books;
create policy "Library staff can add books"
on public.books for insert to authenticated
with check (public.has_any_role(array['super_admin','library_admin','librarian']));

drop policy if exists "Library staff can update books" on public.books;
create policy "Library staff can update books"
on public.books for update to authenticated
using (public.has_any_role(array['super_admin','library_admin','librarian']))
with check (public.has_any_role(array['super_admin','library_admin','librarian']));

drop policy if exists "Library administrators can delete books" on public.books;
create policy "Library administrators can delete books"
on public.books for delete to authenticated
using (public.has_any_role(array['super_admin','library_admin']));

-- Member and circulation data is never public.
drop policy if exists "Library staff can read members" on public.members;
create policy "Library staff can read members"
on public.members for select to authenticated
using (public.has_any_role(array['super_admin','library_admin','librarian']));

drop policy if exists "Library staff can add members" on public.members;
create policy "Library staff can add members"
on public.members for insert to authenticated
with check (public.has_any_role(array['super_admin','library_admin','librarian']));

drop policy if exists "Library staff can update members" on public.members;
create policy "Library staff can update members"
on public.members for update to authenticated
using (public.has_any_role(array['super_admin','library_admin','librarian']))
with check (public.has_any_role(array['super_admin','library_admin','librarian']));

drop policy if exists "Library administrators can delete members" on public.members;
create policy "Library administrators can delete members"
on public.members for delete to authenticated
using (public.has_any_role(array['super_admin','library_admin']));

drop policy if exists "Library staff can read loans" on public.book_loans;
create policy "Library staff can read loans"
on public.book_loans for select to authenticated
using (public.has_any_role(array['super_admin','library_admin','librarian']));

drop policy if exists "Library staff can create loans" on public.book_loans;
create policy "Library staff can create loans"
on public.book_loans for insert to authenticated
with check (public.has_any_role(array['super_admin','library_admin','librarian']));

drop policy if exists "Library staff can update loans" on public.book_loans;
create policy "Library staff can update loans"
on public.book_loans for update to authenticated
using (public.has_any_role(array['super_admin','library_admin','librarian']))
with check (public.has_any_role(array['super_admin','library_admin','librarian']));

-- Room managers can manage activity records; general public sees only the room directory.
drop policy if exists "Room staff can read activities" on public.room_activities;
create policy "Room staff can read activities"
on public.room_activities for select to authenticated
using (public.has_any_role(array['super_admin','library_admin','room_manager','staff']));

drop policy if exists "Room staff can create activities" on public.room_activities;
create policy "Room staff can create activities"
on public.room_activities for insert to authenticated
with check (public.has_any_role(array['super_admin','library_admin','room_manager','staff']));

drop policy if exists "Room staff can update activities" on public.room_activities;
create policy "Room staff can update activities"
on public.room_activities for update to authenticated
using (public.has_any_role(array['super_admin','library_admin','room_manager','staff']))
with check (public.has_any_role(array['super_admin','library_admin','room_manager','staff']));

drop policy if exists "Administrators can delete activities" on public.room_activities;
create policy "Administrators can delete activities"
on public.room_activities for delete to authenticated
using (public.has_any_role(array['super_admin','library_admin']));

-- Only administrators and staff can manage notices. Published notices remain public.
drop policy if exists "Staff can create announcements" on public.announcements;
create policy "Staff can create announcements"
on public.announcements for insert to authenticated
with check (public.has_any_role(array['super_admin','library_admin','staff']));

drop policy if exists "Staff can update announcements" on public.announcements;
create policy "Staff can update announcements"
on public.announcements for update to authenticated
using (public.has_any_role(array['super_admin','library_admin','staff']))
with check (public.has_any_role(array['super_admin','library_admin','staff']));

drop policy if exists "Administrators can delete announcements" on public.announcements;
create policy "Administrators can delete announcements"
on public.announcements for delete to authenticated
using (public.has_any_role(array['super_admin','library_admin']));

drop policy if exists "Administrators can manage resource rooms" on public.resource_rooms;
create policy "Administrators can manage resource rooms"
on public.resource_rooms for all to authenticated
using (public.has_any_role(array['super_admin','library_admin','room_manager']))
with check (public.has_any_role(array['super_admin','library_admin','room_manager']));

-- Bootstrap the first administrator safely:
-- 1) Create the first staff account in Supabase Dashboard > Authentication > Users.
-- 2) Run this statement in Supabase SQL Editor, replacing the email:
-- update public.profiles p
-- set role = 'super_admin', is_active = true
-- from auth.users u
-- where p.id = u.id and u.email = 'your-admin-email@example.com';
-- No browser form or public signup endpoint can grant administrative roles.
