-- Grant table privileges; row-level security policies continue to enforce role-based access.
grant select on table public.books to anon, authenticated;
grant insert, update, delete on table public.books to authenticated;
