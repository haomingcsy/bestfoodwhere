-- Webhook failure log for debugging and retry
create table if not exists public.webhook_failures (
  id uuid default gen_random_uuid() primary key,
  webhook_url text not null,
  payload text,
  error_message text not null,
  source text,
  contact_email text,
  retried boolean default false,
  created_at timestamptz default now()
);

create index idx_webhook_failures_created on public.webhook_failures(created_at desc);
create index idx_webhook_failures_source on public.webhook_failures(source);

alter table public.webhook_failures enable row level security;

create policy "Service role full access" on public.webhook_failures
  for all using (true) with check (true);
