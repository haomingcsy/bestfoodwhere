-- App Secrets Storage
-- Stores sensitive credentials as backup

CREATE TABLE IF NOT EXISTS app_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only service role can access
ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON app_secrets
  FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE app_secrets IS 'Stores sensitive credentials and API keys as backup';
