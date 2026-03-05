create table if not exists public.form_submissions (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  name text,
  phone text,
  source text not null,
  tags text[] default '{}',
  subject text,
  message text,
  page_url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  traffic_channel text,
  lead_score integer,
  ghl_contact_id text,
  ghl_sync_success boolean default false,
  custom_fields jsonb default '{}',
  ip_address text,
  created_at timestamptz default now()
);

-- Index for deduplication and lookups
create index idx_form_submissions_email on public.form_submissions(email);
create index idx_form_submissions_source on public.form_submissions(source);
create index idx_form_submissions_created on public.form_submissions(created_at desc);

-- RLS: only service role can insert (API routes use service role key)
alter table public.form_submissions enable row level security;

create policy "Service role full access" on public.form_submissions
  for all using (true) with check (true);
