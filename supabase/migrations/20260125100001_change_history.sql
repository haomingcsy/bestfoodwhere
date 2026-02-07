-- Migration: Change History and Sync Logs
-- Tracks all data changes for audit trail and sync execution logs

-- Change history for audit trail
CREATE TABLE IF NOT EXISTS data_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_slug TEXT,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_source TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  changed_by UUID REFERENCES profiles(id),
  change_reason TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints
ALTER TABLE data_change_history
  ADD CONSTRAINT chk_change_history_entity_type
  CHECK (entity_type IN ('mall_restaurant', 'brand_menu', 'menu_item', 'menu_category', 'promotion', 'brand_location'));

ALTER TABLE data_change_history
  ADD CONSTRAINT chk_change_history_source
  CHECK (change_source IN ('google_places', 'website_scrape', 'manual', 'owner_portal', 'api', 'ocr', 'n8n_workflow', 'system'));

-- Indexes for change history queries
CREATE INDEX IF NOT EXISTS idx_change_history_entity
  ON data_change_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_change_history_created
  ON data_change_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_history_unverified
  ON data_change_history(is_verified, created_at DESC) WHERE is_verified = false;
CREATE INDEX IF NOT EXISTS idx_change_history_field
  ON data_change_history(entity_type, field_name);

-- Sync execution logs
CREATE TABLE IF NOT EXISTS data_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL,
  sync_source TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  total_entities INTEGER DEFAULT 0,
  entities_processed INTEGER DEFAULT 0,
  entities_updated INTEGER DEFAULT 0,
  entities_created INTEGER DEFAULT 0,
  entities_unchanged INTEGER DEFAULT 0,
  entities_failed INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  error_details JSONB DEFAULT '[]',
  warnings JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  triggered_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints for sync logs
ALTER TABLE data_sync_logs
  ADD CONSTRAINT chk_sync_logs_type
  CHECK (sync_type IN ('full_refresh', 'incremental', 'targeted', 'webhook_triggered', 'manual', 'scheduled'));

ALTER TABLE data_sync_logs
  ADD CONSTRAINT chk_sync_logs_source
  CHECK (sync_source IN ('google_places', 'website_scrape', 'n8n_workflow', 'manual', 'api', 'ocr'));

ALTER TABLE data_sync_logs
  ADD CONSTRAINT chk_sync_logs_status
  CHECK (status IN ('running', 'completed', 'failed', 'partial', 'cancelled'));

-- Indexes for sync logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_status
  ON data_sync_logs(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_type
  ON data_sync_logs(sync_type, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_recent
  ON data_sync_logs(started_at DESC);

-- Function to auto-update sync log completion
CREATE OR REPLACE FUNCTION update_sync_log_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate totals when status changes to completed/failed/partial
  IF NEW.status IN ('completed', 'failed', 'partial') AND OLD.status = 'running' THEN
    NEW.completed_at = NOW();
    NEW.entities_processed = COALESCE(NEW.entities_updated, 0) +
                             COALESCE(NEW.entities_created, 0) +
                             COALESCE(NEW.entities_unchanged, 0) +
                             COALESCE(NEW.entities_failed, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sync_log_stats ON data_sync_logs;
CREATE TRIGGER trigger_update_sync_log_stats
  BEFORE UPDATE ON data_sync_logs
  FOR EACH ROW EXECUTE FUNCTION update_sync_log_stats();

-- View: Recent sync activity
CREATE OR REPLACE VIEW recent_sync_activity AS
SELECT
  id,
  sync_type,
  sync_source,
  status,
  started_at,
  completed_at,
  EXTRACT(EPOCH FROM (COALESCE(completed_at, NOW()) - started_at))::INTEGER as duration_seconds,
  total_entities,
  entities_updated,
  entities_created,
  entities_unchanged,
  entities_failed,
  errors_count
FROM data_sync_logs
ORDER BY started_at DESC
LIMIT 50;

-- View: Sync statistics
CREATE OR REPLACE VIEW sync_statistics AS
SELECT
  sync_source,
  COUNT(*) as total_syncs,
  COUNT(*) FILTER (WHERE status = 'completed') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'partial') as partial,
  SUM(entities_updated) as total_updated,
  SUM(entities_created) as total_created,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at)))::INTEGER as avg_duration_seconds,
  MAX(started_at) as last_sync_at
FROM data_sync_logs
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY sync_source;

-- RLS Policies
ALTER TABLE data_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sync_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for change history (filtered)
DROP POLICY IF EXISTS "Public read recent changes" ON data_change_history;
CREATE POLICY "Public read recent changes" ON data_change_history
  FOR SELECT USING (created_at >= NOW() - INTERVAL '7 days');

-- Service role full access
DROP POLICY IF EXISTS "Service role full access change_history" ON data_change_history;
CREATE POLICY "Service role full access change_history" ON data_change_history
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access sync_logs" ON data_sync_logs;
CREATE POLICY "Service role full access sync_logs" ON data_sync_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE data_change_history IS 'Audit log of all data changes for restaurants and menus';
COMMENT ON TABLE data_sync_logs IS 'Execution logs for data synchronization jobs';
