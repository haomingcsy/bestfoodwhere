-- Migration: API Usage Tracking
-- Tracks API usage and costs for budget monitoring

CREATE TABLE IF NOT EXISTS api_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name TEXT NOT NULL,
  endpoint TEXT,
  operation TEXT,
  request_count INTEGER DEFAULT 1,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_total INTEGER GENERATED ALWAYS AS (tokens_input + tokens_output) STORED,
  estimated_cost_usd DECIMAL(10,6) DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  hour INTEGER DEFAULT EXTRACT(HOUR FROM NOW()),
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  avg_latency_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API name constraint
ALTER TABLE api_usage_tracking
  ADD CONSTRAINT chk_api_name
  CHECK (api_name IN (
    'google_places',
    'google_places_photos',
    'claude_vision',
    'claude_sonnet',
    'claude_haiku',
    'claude_opus',
    'openai_gpt4',
    'resend',
    'supabase_storage',
    'custom'
  ));

-- Unique constraint for aggregation
ALTER TABLE api_usage_tracking
  DROP CONSTRAINT IF EXISTS uq_api_usage_date_hour;
CREATE UNIQUE INDEX IF NOT EXISTS uq_api_usage_date_hour
  ON api_usage_tracking(api_name, endpoint, date, hour)
  WHERE endpoint IS NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_date
  ON api_usage_tracking(date DESC, api_name);
CREATE INDEX IF NOT EXISTS idx_api_usage_api
  ON api_usage_tracking(api_name, date DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_cost
  ON api_usage_tracking(estimated_cost_usd DESC, date DESC)
  WHERE estimated_cost_usd > 0;

-- Function to upsert API usage
CREATE OR REPLACE FUNCTION log_api_usage(
  p_api_name TEXT,
  p_endpoint TEXT DEFAULT NULL,
  p_operation TEXT DEFAULT NULL,
  p_tokens_input INTEGER DEFAULT 0,
  p_tokens_output INTEGER DEFAULT 0,
  p_cost_usd DECIMAL DEFAULT 0,
  p_success BOOLEAN DEFAULT true,
  p_latency_ms INTEGER DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO api_usage_tracking (
    api_name, endpoint, operation,
    request_count, tokens_input, tokens_output,
    estimated_cost_usd, date, hour,
    success_count, error_count, avg_latency_ms
  ) VALUES (
    p_api_name, p_endpoint, p_operation,
    1, p_tokens_input, p_tokens_output,
    p_cost_usd, CURRENT_DATE, EXTRACT(HOUR FROM NOW())::INTEGER,
    CASE WHEN p_success THEN 1 ELSE 0 END,
    CASE WHEN p_success THEN 0 ELSE 1 END,
    p_latency_ms
  )
  ON CONFLICT (api_name, endpoint, date, hour) WHERE endpoint IS NOT NULL
  DO UPDATE SET
    request_count = api_usage_tracking.request_count + 1,
    tokens_input = api_usage_tracking.tokens_input + p_tokens_input,
    tokens_output = api_usage_tracking.tokens_output + p_tokens_output,
    estimated_cost_usd = api_usage_tracking.estimated_cost_usd + p_cost_usd,
    success_count = api_usage_tracking.success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
    error_count = api_usage_tracking.error_count + CASE WHEN p_success THEN 0 ELSE 1 END,
    avg_latency_ms = CASE
      WHEN p_latency_ms IS NOT NULL THEN
        ((api_usage_tracking.avg_latency_ms * api_usage_tracking.request_count) + p_latency_ms) / (api_usage_tracking.request_count + 1)
      ELSE api_usage_tracking.avg_latency_ms
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- View: Daily API usage summary
CREATE OR REPLACE VIEW daily_api_usage AS
SELECT
  date,
  api_name,
  SUM(request_count) as total_requests,
  SUM(tokens_total) as total_tokens,
  SUM(estimated_cost_usd)::DECIMAL(10,2) as total_cost_usd,
  SUM(success_count) as successes,
  SUM(error_count) as errors,
  (SUM(success_count)::DECIMAL / NULLIF(SUM(request_count), 0) * 100)::DECIMAL(5,2) as success_rate,
  AVG(avg_latency_ms)::INTEGER as avg_latency_ms
FROM api_usage_tracking
GROUP BY date, api_name
ORDER BY date DESC, total_cost_usd DESC;

-- View: Monthly cost summary
CREATE OR REPLACE VIEW monthly_api_costs AS
SELECT
  DATE_TRUNC('month', date)::DATE as month,
  api_name,
  SUM(request_count) as total_requests,
  SUM(tokens_total) as total_tokens,
  SUM(estimated_cost_usd)::DECIMAL(10,2) as total_cost_usd
FROM api_usage_tracking
GROUP BY DATE_TRUNC('month', date), api_name
ORDER BY month DESC, total_cost_usd DESC;

-- View: Current day cost tracking
CREATE OR REPLACE VIEW today_api_costs AS
SELECT
  api_name,
  SUM(request_count) as requests_today,
  SUM(tokens_total) as tokens_today,
  SUM(estimated_cost_usd)::DECIMAL(10,4) as cost_today_usd,
  MAX(updated_at) as last_request_at
FROM api_usage_tracking
WHERE date = CURRENT_DATE
GROUP BY api_name
ORDER BY cost_today_usd DESC;

-- View: Cost alerts (daily budget check)
CREATE OR REPLACE VIEW api_cost_alerts AS
SELECT
  date,
  SUM(estimated_cost_usd)::DECIMAL(10,2) as total_cost_usd,
  CASE
    WHEN SUM(estimated_cost_usd) > 100 THEN 'critical'
    WHEN SUM(estimated_cost_usd) > 50 THEN 'warning'
    WHEN SUM(estimated_cost_usd) > 25 THEN 'notice'
    ELSE 'ok'
  END as alert_level
FROM api_usage_tracking
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date
HAVING SUM(estimated_cost_usd) > 25
ORDER BY date DESC;

-- API cost reference table
CREATE TABLE IF NOT EXISTS api_cost_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name TEXT NOT NULL,
  operation TEXT,
  cost_per_request DECIMAL(10,6),
  cost_per_1k_tokens_input DECIMAL(10,6),
  cost_per_1k_tokens_output DECIMAL(10,6),
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert current API costs
INSERT INTO api_cost_reference (api_name, operation, cost_per_request, cost_per_1k_tokens_input, cost_per_1k_tokens_output, notes)
VALUES
  ('google_places', 'text_search', 0.032, NULL, NULL, 'Places API (New) Text Search'),
  ('google_places', 'place_details', 0.017, NULL, NULL, 'Places API (New) Place Details'),
  ('google_places_photos', 'photo', 0.007, NULL, NULL, 'Places Photos per photo'),
  ('claude_vision', 'image_analysis', NULL, 0.003, 0.015, 'Claude 3.5 Sonnet with vision'),
  ('claude_sonnet', 'completion', NULL, 0.003, 0.015, 'Claude 3.5 Sonnet'),
  ('claude_haiku', 'completion', NULL, 0.00025, 0.00125, 'Claude 3 Haiku'),
  ('claude_opus', 'completion', NULL, 0.015, 0.075, 'Claude 3 Opus')
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE api_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_cost_reference ENABLE ROW LEVEL SECURITY;

-- Service role full access
DROP POLICY IF EXISTS "Service role full access api_usage" ON api_usage_tracking;
CREATE POLICY "Service role full access api_usage" ON api_usage_tracking
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access api_costs" ON api_cost_reference;
CREATE POLICY "Service role full access api_costs" ON api_cost_reference
  FOR ALL USING (auth.role() = 'service_role');

-- Admin read access
DROP POLICY IF EXISTS "Admin read api_usage" ON api_usage_tracking;
CREATE POLICY "Admin read api_usage" ON api_usage_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- Comments
COMMENT ON TABLE api_usage_tracking IS 'Tracks API usage and costs for budget monitoring';
COMMENT ON TABLE api_cost_reference IS 'Reference table for API pricing';
COMMENT ON FUNCTION log_api_usage IS 'Upsert function to log API usage with aggregation';
