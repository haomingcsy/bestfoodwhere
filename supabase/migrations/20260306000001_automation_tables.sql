-- Automation tables for pipeline tracking and engagement

-- Track pipeline stage movements
CREATE TABLE IF NOT EXISTS public.pipeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_opportunity_id text NOT NULL,
  ghl_contact_id text,
  pipeline_name text NOT NULL,
  old_stage text,
  new_stage text NOT NULL,
  trigger_source text,  -- 'n8n', 'ghl_workflow', 'manual'
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pipeline_events_opp ON public.pipeline_events(ghl_opportunity_id);
CREATE INDEX idx_pipeline_events_contact ON public.pipeline_events(ghl_contact_id);
CREATE INDEX idx_pipeline_events_created ON public.pipeline_events(created_at DESC);

ALTER TABLE public.pipeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.pipeline_events
  FOR ALL USING (true) WITH CHECK (true);

-- Track email engagement events from GHL webhooks
CREATE TABLE IF NOT EXISTS public.engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  event_type text NOT NULL,  -- open, click, bounce, unsubscribe, reply
  ghl_contact_id text,
  sequence_name text,
  email_number int,
  link_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_engagement_email ON public.engagement_events(email);
CREATE INDEX idx_engagement_type ON public.engagement_events(event_type);
CREATE INDEX idx_engagement_created ON public.engagement_events(created_at DESC);

ALTER TABLE public.engagement_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.engagement_events
  FOR ALL USING (true) WITH CHECK (true);

-- Sync GHL contacts for cross-referencing
CREATE TABLE IF NOT EXISTS public.ghl_contacts_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_contact_id text UNIQUE NOT NULL,
  email text,
  first_name text,
  last_name text,
  phone text,
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}',
  engagement_tier text DEFAULT 'new',
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ghl_sync_email ON public.ghl_contacts_sync(email);
CREATE INDEX idx_ghl_sync_tier ON public.ghl_contacts_sync(engagement_tier);

ALTER TABLE public.ghl_contacts_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.ghl_contacts_sync
  FOR ALL USING (true) WITH CHECK (true);

-- Reporting views
CREATE OR REPLACE VIEW public.v_pipeline_conversion_rates AS
SELECT
  pipeline_name,
  new_stage,
  COUNT(*) AS entries,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS entries_7d,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS entries_30d
FROM public.pipeline_events
GROUP BY pipeline_name, new_stage
ORDER BY pipeline_name, new_stage;

CREATE OR REPLACE VIEW public.v_daily_lead_summary AS
SELECT
  DATE(created_at) AS day,
  source,
  COUNT(*) AS submissions,
  COUNT(*) FILTER (WHERE ghl_sync_success = true) AS synced_to_ghl,
  COUNT(*) FILTER (WHERE ghl_sync_success = false) AS ghl_failures
FROM public.form_submissions
GROUP BY DATE(created_at), source
ORDER BY day DESC, source;
