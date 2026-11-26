-- Add a unique barcode identifier to each book record.
alter table public.books
  add column if not exists barcode text;

create unique index if not exists books_barcode_unique
  on public.books (barcode)
  where barcode is not null;

comment on column public.books.barcode is
  'Unique library barcode value; scanner payload uses GCL-BOOK:<barcode>.';
