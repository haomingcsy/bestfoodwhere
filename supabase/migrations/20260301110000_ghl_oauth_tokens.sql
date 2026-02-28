-- Store GHL OAuth tokens
CREATE TABLE IF NOT EXISTS public.ghl_oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: only service role can access
ALTER TABLE public.ghl_oauth_tokens ENABLE ROW LEVEL SECURITY;
