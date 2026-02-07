-- Migration: Data Freshness Tracking
-- Adds columns to track data freshness, source, and verification status

-- Add data freshness columns to mall_restaurants
ALTER TABLE mall_restaurants
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_google_sync_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_scrape_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS is_permanently_closed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS closure_detected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS hours_changed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS address_changed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_reason TEXT,
  ADD COLUMN IF NOT EXISTS google_place_id TEXT;

-- Add constraint for data_source
ALTER TABLE mall_restaurants
  DROP CONSTRAINT IF EXISTS chk_mall_restaurants_data_source;
ALTER TABLE mall_restaurants
  ADD CONSTRAINT chk_mall_restaurants_data_source
  CHECK (data_source IN ('google_places', 'website_scrape', 'manual', 'hybrid', 'unknown'));

-- Add constraint for confidence_score
ALTER TABLE mall_restaurants
  DROP CONSTRAINT IF EXISTS chk_mall_restaurants_confidence;
ALTER TABLE mall_restaurants
  ADD CONSTRAINT chk_mall_restaurants_confidence
  CHECK (confidence_score >= 0 AND confidence_score <= 1);

-- Add data freshness columns to brand_menus
ALTER TABLE brand_menus
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_menu_update_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS menu_source_type TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_reason TEXT,
  ADD COLUMN IF NOT EXISTS owner_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id);

-- Add constraint for brand_menus data_source
ALTER TABLE brand_menus
  DROP CONSTRAINT IF EXISTS chk_brand_menus_data_source;
ALTER TABLE brand_menus
  ADD CONSTRAINT chk_brand_menus_data_source
  CHECK (data_source IN ('google_places', 'website_scrape', 'manual', 'hybrid', 'ocr', 'unknown'));

-- Add constraint for brand_menus confidence_score
ALTER TABLE brand_menus
  DROP CONSTRAINT IF EXISTS chk_brand_menus_confidence;
ALTER TABLE brand_menus
  ADD CONSTRAINT chk_brand_menus_confidence
  CHECK (confidence_score >= 0 AND confidence_score <= 1);

-- Add constraint for menu_source_type
ALTER TABLE brand_menus
  DROP CONSTRAINT IF EXISTS chk_brand_menus_menu_source;
ALTER TABLE brand_menus
  ADD CONSTRAINT chk_brand_menus_menu_source
  CHECK (menu_source_type IN ('digital', 'image_ocr', 'pdf', 'manual', 'unknown'));

-- Indexes for freshness queries
CREATE INDEX IF NOT EXISTS idx_mall_restaurants_last_verified
  ON mall_restaurants(last_verified_at);
CREATE INDEX IF NOT EXISTS idx_mall_restaurants_needs_review
  ON mall_restaurants(needs_review) WHERE needs_review = true;
CREATE INDEX IF NOT EXISTS idx_mall_restaurants_closed
  ON mall_restaurants(is_permanently_closed) WHERE is_permanently_closed = true;
CREATE INDEX IF NOT EXISTS idx_mall_restaurants_google_place_id
  ON mall_restaurants(google_place_id) WHERE google_place_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_brand_menus_last_verified
  ON brand_menus(last_verified_at);
CREATE INDEX IF NOT EXISTS idx_brand_menus_needs_review
  ON brand_menus(needs_review) WHERE needs_review = true;
CREATE INDEX IF NOT EXISTS idx_brand_menus_owner
  ON brand_menus(owner_id) WHERE owner_id IS NOT NULL;

-- View: Stale restaurants (not verified in 7+ days)
CREATE OR REPLACE VIEW stale_restaurants AS
SELECT
  mr.id,
  mr.slug,
  mr.name,
  sm.name as mall_name,
  sm.slug as mall_slug,
  mr.last_verified_at,
  EXTRACT(DAY FROM NOW() - mr.last_verified_at) as days_stale,
  mr.confidence_score,
  mr.data_source,
  mr.is_permanently_closed,
  mr.needs_review,
  mr.review_reason
FROM mall_restaurants mr
JOIN shopping_malls sm ON mr.mall_id = sm.id
WHERE mr.is_active = true
  AND (
    mr.last_verified_at IS NULL
    OR mr.last_verified_at < NOW() - INTERVAL '7 days'
  )
ORDER BY mr.last_verified_at ASC NULLS FIRST;

-- View: Data freshness summary
CREATE OR REPLACE VIEW data_freshness_summary AS
SELECT
  COUNT(*) as total_restaurants,
  COUNT(*) FILTER (WHERE last_verified_at >= NOW() - INTERVAL '24 hours') as verified_24h,
  COUNT(*) FILTER (WHERE last_verified_at >= NOW() - INTERVAL '7 days') as verified_7d,
  COUNT(*) FILTER (WHERE last_verified_at >= NOW() - INTERVAL '30 days') as verified_30d,
  COUNT(*) FILTER (WHERE last_verified_at IS NULL OR last_verified_at < NOW() - INTERVAL '7 days') as stale,
  COUNT(*) FILTER (WHERE last_verified_at IS NULL) as never_verified,
  COUNT(*) FILTER (WHERE is_permanently_closed = true) as closed,
  COUNT(*) FILTER (WHERE needs_review = true) as needs_review,
  AVG(confidence_score)::DECIMAL(3,2) as avg_confidence,
  COUNT(*) FILTER (WHERE confidence_score >= 0.9) as high_confidence,
  COUNT(*) FILTER (WHERE confidence_score >= 0.7 AND confidence_score < 0.9) as medium_confidence,
  COUNT(*) FILTER (WHERE confidence_score < 0.7) as low_confidence
FROM mall_restaurants
WHERE is_active = true;

-- Comment on columns for documentation
COMMENT ON COLUMN mall_restaurants.last_verified_at IS 'Timestamp of last data verification from any source';
COMMENT ON COLUMN mall_restaurants.last_google_sync_at IS 'Timestamp of last Google Places API sync';
COMMENT ON COLUMN mall_restaurants.data_source IS 'Primary source of current data';
COMMENT ON COLUMN mall_restaurants.confidence_score IS 'Data accuracy confidence (0-1)';
COMMENT ON COLUMN mall_restaurants.is_permanently_closed IS 'Restaurant has permanently closed';
COMMENT ON COLUMN mall_restaurants.needs_review IS 'Flagged for manual verification';
COMMENT ON COLUMN mall_restaurants.google_place_id IS 'Google Places API place ID for future lookups';
