-- Member management table privileges. RLS policies in 0002 remain the authorization boundary.
grant select, insert, update, delete on table public.members to authenticated;
