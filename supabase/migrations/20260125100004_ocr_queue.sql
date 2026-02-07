-- Migration: OCR Processing Queue
-- Queue for menu image OCR processing using Claude Vision

CREATE TABLE IF NOT EXISTS menu_ocr_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_menu_id UUID REFERENCES brand_menus(id) ON DELETE CASCADE,
  mall_restaurant_id UUID REFERENCES mall_restaurants(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  image_type TEXT DEFAULT 'menu_photo',
  source_url TEXT,
  priority INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending',
  ocr_provider TEXT DEFAULT 'claude_vision',
  model_used TEXT,
  raw_ocr_result JSONB,
  parsed_menu_items JSONB,
  items_extracted INTEGER DEFAULT 0,
  categories_extracted INTEGER DEFAULT 0,
  confidence_score DECIMAL(3,2),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  processing_started_at TIMESTAMPTZ,
  processing_time_ms INTEGER,
  processed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  applied_by UUID REFERENCES profiles(id),
  tokens_used INTEGER,
  estimated_cost_usd DECIMAL(10,6),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Image type constraint
ALTER TABLE menu_ocr_queue
  ADD CONSTRAINT chk_ocr_image_type
  CHECK (image_type IN ('menu_board', 'menu_pdf', 'menu_photo', 'price_list', 'poster', 'signage'));

-- Status constraint
ALTER TABLE menu_ocr_queue
  ADD CONSTRAINT chk_ocr_status
  CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'needs_review', 'applied', 'skipped'));

-- Provider constraint
ALTER TABLE menu_ocr_queue
  ADD CONSTRAINT chk_ocr_provider
  CHECK (ocr_provider IN ('claude_vision', 'gpt4_vision', 'google_vision', 'manual'));

-- Priority constraint
ALTER TABLE menu_ocr_queue
  ADD CONSTRAINT chk_ocr_priority
  CHECK (priority >= 1 AND priority <= 10);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ocr_queue_pending
  ON menu_ocr_queue(status, priority, created_at)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_ocr_queue_brand
  ON menu_ocr_queue(brand_menu_id)
  WHERE brand_menu_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ocr_queue_processing
  ON menu_ocr_queue(status, processing_started_at)
  WHERE status = 'processing';
CREATE INDEX IF NOT EXISTS idx_ocr_queue_review
  ON menu_ocr_queue(status, confidence_score)
  WHERE status = 'needs_review';
CREATE INDEX IF NOT EXISTS idx_ocr_queue_failed
  ON menu_ocr_queue(status, retry_count)
  WHERE status = 'failed';

-- Function to update timestamp and handle retries
CREATE OR REPLACE FUNCTION update_ocr_queue_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Track processing start time
  IF NEW.status = 'processing' AND OLD.status = 'pending' THEN
    NEW.processing_started_at = NOW();
  END IF;

  -- Calculate processing time on completion
  IF NEW.status IN ('completed', 'failed', 'needs_review') AND NEW.processing_started_at IS NOT NULL THEN
    NEW.processing_time_ms = EXTRACT(MILLISECONDS FROM (NOW() - NEW.processing_started_at))::INTEGER;
    NEW.processed_at = NOW();
  END IF;

  -- Reset for retry
  IF NEW.status = 'pending' AND OLD.status = 'failed' THEN
    NEW.retry_count = OLD.retry_count + 1;
    NEW.error_message = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ocr_queue_status ON menu_ocr_queue;
CREATE TRIGGER trigger_update_ocr_queue_status
  BEFORE UPDATE ON menu_ocr_queue
  FOR EACH ROW EXECUTE FUNCTION update_ocr_queue_status();

-- Function to check if max retries exceeded
CREATE OR REPLACE FUNCTION check_ocr_max_retries()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' AND NEW.retry_count >= NEW.max_retries THEN
    NEW.status = 'failed';
    NEW.error_message = COALESCE(NEW.error_message, 'Max retries exceeded');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_ocr_max_retries ON menu_ocr_queue;
CREATE TRIGGER trigger_check_ocr_max_retries
  BEFORE UPDATE ON menu_ocr_queue
  FOR EACH ROW EXECUTE FUNCTION check_ocr_max_retries();

-- View: OCR queue status
CREATE OR REPLACE VIEW ocr_queue_status AS
SELECT
  status,
  COUNT(*) as count,
  AVG(confidence_score)::DECIMAL(3,2) as avg_confidence,
  SUM(items_extracted) as total_items_extracted,
  AVG(processing_time_ms)::INTEGER as avg_processing_ms,
  SUM(tokens_used) as total_tokens,
  SUM(estimated_cost_usd)::DECIMAL(10,2) as total_cost_usd
FROM menu_ocr_queue
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY status;

-- View: Pending OCR items
CREATE OR REPLACE VIEW pending_ocr_items AS
SELECT
  oq.id,
  oq.image_url,
  oq.image_type,
  oq.priority,
  oq.retry_count,
  oq.created_at,
  bm.name as brand_name,
  bm.slug as brand_slug,
  mr.name as restaurant_name,
  sm.name as mall_name
FROM menu_ocr_queue oq
LEFT JOIN brand_menus bm ON oq.brand_menu_id = bm.id
LEFT JOIN mall_restaurants mr ON oq.mall_restaurant_id = mr.id
LEFT JOIN shopping_malls sm ON mr.mall_id = sm.id
WHERE oq.status = 'pending'
ORDER BY oq.priority ASC, oq.created_at ASC;

-- View: OCR items needing review
CREATE OR REPLACE VIEW ocr_needs_review AS
SELECT
  oq.id,
  oq.image_url,
  oq.parsed_menu_items,
  oq.items_extracted,
  oq.confidence_score,
  oq.processed_at,
  bm.name as brand_name,
  bm.slug as brand_slug
FROM menu_ocr_queue oq
LEFT JOIN brand_menus bm ON oq.brand_menu_id = bm.id
WHERE oq.status = 'needs_review'
ORDER BY oq.confidence_score ASC, oq.processed_at ASC;

-- RLS Policies
ALTER TABLE menu_ocr_queue ENABLE ROW LEVEL SECURITY;

-- Service role full access
DROP POLICY IF EXISTS "Service role full access ocr" ON menu_ocr_queue;
CREATE POLICY "Service role full access ocr" ON menu_ocr_queue
  FOR ALL USING (auth.role() = 'service_role');

-- Admin users can view and manage OCR queue
DROP POLICY IF EXISTS "Admin access ocr" ON menu_ocr_queue;
CREATE POLICY "Admin access ocr" ON menu_ocr_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- Comments
COMMENT ON TABLE menu_ocr_queue IS 'Queue for menu image OCR processing using Claude Vision or other providers';
COMMENT ON COLUMN menu_ocr_queue.raw_ocr_result IS 'Raw JSON response from OCR provider';
COMMENT ON COLUMN menu_ocr_queue.parsed_menu_items IS 'Structured menu items extracted from OCR';
COMMENT ON COLUMN menu_ocr_queue.confidence_score IS 'Overall confidence in extraction accuracy';
COMMENT ON COLUMN menu_ocr_queue.tokens_used IS 'API tokens consumed for cost tracking';
