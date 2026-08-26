create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('Meeting Minutes', 'Covenants', 'By-Laws')),
  description text,
  file_url text not null,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "Authenticated residents can read documents"
  on public.documents for select
  to authenticated
  using (true);

create policy "Admins can insert documents"
  on public.documents for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public)
values ('hoa-documents', 'hoa-documents', false)
on conflict (id) do nothing;

create policy "Admins can upload HOA documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'hoa-documents'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can delete HOA documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'hoa-documents'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Authenticated residents can read HOA documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'hoa-documents');