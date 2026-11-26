-- Atomic book circulation operations. Apply after migrations 0001-0004.
alter table public.book_loans
  add column if not exists fine_amount numeric(10,2) not null default 0 check (fine_amount >= 0);

grant select on table public.book_loans to authenticated;

create or replace function public.issue_library_book(
  p_book_id uuid,
  p_member_id uuid,
  p_due_at date
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_book public.books%rowtype;
  v_member public.members%rowtype;
  v_loan_id uuid;
begin
  if not public.has_any_role(array['super_admin','library_admin','librarian']) then
    raise exception 'तपाईंलाई पुस्तक जारी गर्ने अनुमति छैन।';
  end if;

  select * into v_book from public.books where id = p_book_id for update;
  if not found then raise exception 'पुस्तक भेटिएन।'; end if;
  if v_book.available_copies < 1 then raise exception 'यो पुस्तक अहिले उपलब्ध छैन।'; end if;

  select * into v_member from public.members where id = p_member_id for update;
  if not found then raise exception 'सदस्य भेटिएन।'; end if;
  if v_member.status <> 'active' then raise exception 'निष्क्रिय वा निलम्बित सदस्यलाई पुस्तक जारी गर्न मिल्दैन।'; end if;
  if p_due_at < current_date then raise exception 'फिर्ता मिति आज वा भविष्यको हुनुपर्छ।'; end if;

  insert into public.book_loans (book_id, member_id, due_at, status)
  values (p_book_id, p_member_id, p_due_at, 'issued')
  returning id into v_loan_id;

  update public.books set available_copies = available_copies - 1 where id = p_book_id;
  return v_loan_id;
end;
$$;

create or replace function public.return_library_book(
  p_loan_id uuid,
  p_fine_per_day numeric default 0
) returns numeric
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_loan public.book_loans%rowtype;
  v_days_late integer;
  v_fine numeric(10,2);
begin
  if not public.has_any_role(array['super_admin','library_admin','librarian']) then
    raise exception 'तपाईंलाई पुस्तक फिर्ता लिने अनुमति छैन।';
  end if;
  if p_fine_per_day < 0 then raise exception 'जरिवाना दर ऋणात्मक हुन मिल्दैन।'; end if;

  select * into v_loan from public.book_loans where id = p_loan_id for update;
  if not found then raise exception 'लेनदेन अभिलेख भेटिएन।'; end if;
  if v_loan.returned_at is not null or v_loan.status = 'returned' then
    raise exception 'यो पुस्तक पहिले नै फिर्ता भइसकेको छ।';
  end if;

  v_days_late := greatest(current_date - v_loan.due_at, 0);
  v_fine := v_days_late * p_fine_per_day;

  update public.book_loans
  set returned_at = now(), status = 'returned', fine_amount = v_fine
  where id = p_loan_id;

  update public.books set available_copies = least(total_copies, available_copies + 1)
  where id = v_loan.book_id;

  return v_fine;
end;
$$;

revoke all on function public.issue_library_book(uuid, uuid, date) from public;
revoke all on function public.return_library_book(uuid, numeric) from public;
grant execute on function public.issue_library_book(uuid, uuid, date) to authenticated;
grant execute on function public.return_library_book(uuid, numeric) to authenticated;
