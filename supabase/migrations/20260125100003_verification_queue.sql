-- Migration: Verification Queue
-- Queue for manual verification of detected changes

CREATE TABLE IF NOT EXISTS verification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_slug TEXT,
  entity_name TEXT,
  change_type TEXT NOT NULL,
  priority INTEGER DEFAULT 5,
  detected_value TEXT,
  current_value TEXT,
  detection_source TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  status TEXT DEFAULT 'pending',
  assigned_to UUID REFERENCES profiles(id),
  notes TEXT,
  admin_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_action TEXT,
  related_change_id UUID REFERENCES data_change_history(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entity type constraint
ALTER TABLE verification_queue
  ADD CONSTRAINT chk_verification_entity_type
  CHECK (entity_type IN (
    'mall_restaurant',
    'brand_menu',
    'menu_item',
    'menu_category',
    'promotion',
    'brand_location'
  ));

-- Change type constraint
ALTER TABLE verification_queue
  ADD CONSTRAINT chk_verification_change_type
  CHECK (change_type IN (
    'closure',
    'temporary_closure',
    'hours_change',
    'address_change',
    'phone_change',
    'menu_change',
    'price_change',
    'new_promotion',
    'promotion_expired',
    'data_conflict',
    'new_restaurant',
    'name_change',
    'image_change',
    'low_confidence',
    'other'
  ));

-- Priority constraint (1 = highest, 10 = lowest)
ALTER TABLE verification_queue
  ADD CONSTRAINT chk_verification_priority
  CHECK (priority >= 1 AND priority <= 10);

-- Status constraint
ALTER TABLE verification_queue
  ADD CONSTRAINT chk_verification_status
  CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'auto_resolved', 'deferred'));

-- Detection source constraint
ALTER TABLE verification_queue
  ADD CONSTRAINT chk_verification_source
  CHECK (detection_source IN (
    'google_places',
    'website_scrape',
    'ocr',
    'user_report',
    'owner_update',
    'n8n_workflow',
    'api',
    'system'
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_verification_pending
  ON verification_queue(status, priority, created_at)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_verification_entity
  ON verification_queue(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_verification_type
  ON verification_queue(change_type, status);
CREATE INDEX IF NOT EXISTS idx_verification_assigned
  ON verification_queue(assigned_to, status)
  WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_verification_high_priority
  ON verification_queue(priority, created_at)
  WHERE status = 'pending' AND priority <= 3;

-- Function to auto-assign priority based on change type
CREATE OR REPLACE FUNCTION set_verification_priority()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-set priority if not provided
  IF NEW.priority = 5 THEN -- Default priority
    CASE NEW.change_type
      WHEN 'closure' THEN NEW.priority = 1;
      WHEN 'temporary_closure' THEN NEW.priority = 2;
      WHEN 'address_change' THEN NEW.priority = 2;
      WHEN 'hours_change' THEN NEW.priority = 3;
      WHEN 'phone_change' THEN NEW.priority = 4;
      WHEN 'menu_change' THEN NEW.priority = 5;
      WHEN 'price_change' THEN NEW.priority = 5;
      WHEN 'new_promotion' THEN NEW.priority = 6;
      WHEN 'image_change' THEN NEW.priority = 7;
      WHEN 'low_confidence' THEN NEW.priority = 8;
      ELSE NEW.priority = 5;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_verification_priority ON verification_queue;
CREATE TRIGGER trigger_set_verification_priority
  BEFORE INSERT ON verification_queue
  FOR EACH ROW EXECUTE FUNCTION set_verification_priority();

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_verification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Set resolved_at when status changes to resolved state
  IF NEW.status IN ('approved', 'rejected', 'auto_resolved') AND OLD.status NOT IN ('approved', 'rejected', 'auto_resolved') THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_verification_timestamp ON verification_queue;
CREATE TRIGGER trigger_update_verification_timestamp
  BEFORE UPDATE ON verification_queue
  FOR EACH ROW EXECUTE FUNCTION update_verification_timestamp();

-- View: Pending verifications by priority
CREATE OR REPLACE VIEW pending_verifications AS
SELECT
  vq.id,
  vq.entity_type,
  vq.entity_name,
  vq.entity_slug,
  vq.change_type,
  vq.priority,
  vq.detected_value,
  vq.current_value,
  vq.detection_source,
  vq.confidence_score,
  vq.notes,
  vq.created_at,
  EXTRACT(HOURS FROM (NOW() - vq.created_at)) as hours_pending,
  p.display_name as assigned_to_name
FROM verification_queue vq
LEFT JOIN profiles p ON vq.assigned_to = p.id
WHERE vq.status = 'pending'
ORDER BY vq.priority ASC, vq.created_at ASC;

-- View: Verification statistics
CREATE OR REPLACE VIEW verification_statistics AS
SELECT
  change_type,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'in_review') as in_review,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE status = 'auto_resolved') as auto_resolved,
  AVG(EXTRACT(HOURS FROM (COALESCE(resolved_at, NOW()) - created_at)))::INTEGER as avg_resolution_hours
FROM verification_queue
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY change_type;

-- RLS Policies
ALTER TABLE verification_queue ENABLE ROW LEVEL SECURITY;

-- Service role full access
DROP POLICY IF EXISTS "Service role full access verification" ON verification_queue;
CREATE POLICY "Service role full access verification" ON verification_queue
  FOR ALL USING (auth.role() = 'service_role');

-- Admin users can manage verification queue
DROP POLICY IF EXISTS "Admin access verification" ON verification_queue;
CREATE POLICY "Admin access verification" ON verification_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- Comments
COMMENT ON TABLE verification_queue IS 'Queue for manual verification of auto-detected data changes';
COMMENT ON COLUMN verification_queue.priority IS 'Priority 1-10, where 1 is highest priority';
COMMENT ON COLUMN verification_queue.confidence_score IS 'Detection confidence score from the source';
