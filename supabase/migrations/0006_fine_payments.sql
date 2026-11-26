-- Fine payment ledger. Apply after 0005_book_circulation.sql.
create table if not exists public.fine_payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.book_loans(id) on delete restrict,
  amount numeric(10,2) not null check (amount > 0),
  payment_method text not null default 'cash'
    check (payment_method in ('cash','bank_transfer','mobile_wallet','other')),
  reference_no text,
  notes text,
  received_by uuid references auth.users(id) on delete set null,
  paid_at timestamptz not null default now()
);

create index if not exists fine_payments_loan_idx on public.fine_payments(loan_id);
create index if not exists fine_payments_paid_at_idx on public.fine_payments(paid_at desc);

alter table public.fine_payments enable row level security;

drop policy if exists "Library staff can read fine payments" on public.fine_payments;
create policy "Library staff can read fine payments"
on public.fine_payments for select to authenticated
using (public.has_any_role(array['super_admin','library_admin','librarian']));

grant select on table public.fine_payments to authenticated;
revoke insert, update, delete on table public.fine_payments from authenticated;

create or replace function public.record_library_fine_payment(
  p_loan_id uuid,
  p_amount numeric,
  p_payment_method text default 'cash',
  p_reference_no text default null,
  p_notes text default null
) returns numeric
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_loan public.book_loans%rowtype;
  v_paid numeric(10,2);
  v_balance numeric(10,2);
begin
  if not public.has_any_role(array['super_admin','library_admin','librarian']) then
    raise exception 'तपाईंलाई जरिवाना भुक्तानी दर्ता गर्ने अनुमति छैन।';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'भुक्तानी रकम शून्यभन्दा बढी हुनुपर्छ।';
  end if;

  if p_payment_method not in ('cash','bank_transfer','mobile_wallet','other') then
    raise exception 'भुक्तानीको माध्यम मान्य छैन।';
  end if;

  select * into v_loan
  from public.book_loans
  where id = p_loan_id
  for update;

  if not found then raise exception 'पुस्तक लेनदेन अभिलेख भेटिएन।'; end if;
  if v_loan.returned_at is null or v_loan.fine_amount <= 0 then
    raise exception 'यस लेनदेनमा भुक्तानीयोग्य जरिवाना छैन।';
  end if;

  select coalesce(sum(amount), 0) into v_paid
  from public.fine_payments
  where loan_id = p_loan_id;

  v_balance := v_loan.fine_amount - v_paid;
  if p_amount > v_balance then
    raise exception 'भुक्तानी रकम बाँकी जरिवानाभन्दा बढी हुन मिल्दैन। बाँकी रकम: रु. %', v_balance;
  end if;

  insert into public.fine_payments
    (loan_id, amount, payment_method, reference_no, notes, received_by)
  values
    (p_loan_id, p_amount, p_payment_method, nullif(trim(p_reference_no), ''),
     nullif(trim(p_notes), ''), auth.uid());

  return v_balance - p_amount;
end;
$$;

revoke all on function public.record_library_fine_payment(uuid, numeric, text, text, text) from public;
grant execute on function public.record_library_fine_payment(uuid, numeric, text, text, text) to authenticated;
