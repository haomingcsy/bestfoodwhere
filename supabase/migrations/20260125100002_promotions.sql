-- Migration: Restaurant Promotions
-- Tracks promotions, deals, and offers with expiry management

CREATE TABLE IF NOT EXISTS restaurant_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_menu_id UUID REFERENCES brand_menus(id) ON DELETE CASCADE,
  mall_restaurant_id UUID REFERENCES mall_restaurants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  promotion_type TEXT NOT NULL,
  discount_value TEXT, -- e.g., "20%", "$5 off", "1-for-1"
  discount_percentage DECIMAL(5,2), -- Numeric value for sorting/filtering
  minimum_spend DECIMAL(10,2),
  terms_conditions TEXT,
  promo_code TEXT,
  image_url TEXT,
  source_url TEXT,
  source_type TEXT,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- At least one of brand_menu_id or mall_restaurant_id must be set
ALTER TABLE restaurant_promotions
  ADD CONSTRAINT chk_promotion_entity
  CHECK (brand_menu_id IS NOT NULL OR mall_restaurant_id IS NOT NULL);

-- Promotion type constraint
ALTER TABLE restaurant_promotions
  ADD CONSTRAINT chk_promotion_type
  CHECK (promotion_type IN (
    'discount',
    'bundle',
    'limited_time',
    'seasonal',
    'member',
    'bank_promo',
    'delivery',
    'dine_in',
    'takeaway',
    '1_for_1',
    'free_item',
    'cashback',
    'other'
  ));

-- Source type constraint
ALTER TABLE restaurant_promotions
  ADD CONSTRAINT chk_promotion_source
  CHECK (source_type IS NULL OR source_type IN (
    'website',
    'google_posts',
    'facebook',
    'instagram',
    'email',
    'manual',
    'owner',
    'scrape'
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promotions_active
  ON restaurant_promotions(is_active, expires_at)
  WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_promotions_brand
  ON restaurant_promotions(brand_menu_id)
  WHERE brand_menu_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_restaurant
  ON restaurant_promotions(mall_restaurant_id)
  WHERE mall_restaurant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_type
  ON restaurant_promotions(promotion_type, is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_expires
  ON restaurant_promotions(expires_at)
  WHERE is_active = true AND expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_unverified
  ON restaurant_promotions(is_verified, created_at)
  WHERE is_verified = false;

-- Function to auto-expire promotions
CREATE OR REPLACE FUNCTION auto_expire_promotions()
RETURNS void AS $$
BEGIN
  UPDATE restaurant_promotions
  SET is_active = false, updated_at = NOW()
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_promotion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_promotion_timestamp ON restaurant_promotions;
CREATE TRIGGER trigger_update_promotion_timestamp
  BEFORE UPDATE ON restaurant_promotions
  FOR EACH ROW EXECUTE FUNCTION update_promotion_timestamp();

-- View: Active promotions with restaurant details
CREATE OR REPLACE VIEW active_promotions AS
SELECT
  p.id,
  p.title,
  p.description,
  p.promotion_type,
  p.discount_value,
  p.promo_code,
  p.starts_at,
  p.expires_at,
  p.image_url,
  p.confidence_score,
  p.view_count,
  COALESCE(bm.name, mr.name) as restaurant_name,
  COALESCE(bm.slug, mr.slug) as restaurant_slug,
  sm.name as mall_name,
  sm.slug as mall_slug,
  p.created_at
FROM restaurant_promotions p
LEFT JOIN brand_menus bm ON p.brand_menu_id = bm.id
LEFT JOIN mall_restaurants mr ON p.mall_restaurant_id = mr.id
LEFT JOIN shopping_malls sm ON mr.mall_id = sm.id
WHERE p.is_active = true
  AND (p.expires_at IS NULL OR p.expires_at > NOW())
  AND (p.starts_at IS NULL OR p.starts_at <= NOW())
ORDER BY p.created_at DESC;

-- View: Promotion statistics
CREATE OR REPLACE VIEW promotion_statistics AS
SELECT
  promotion_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW())) as active,
  COUNT(*) FILTER (WHERE expires_at < NOW()) as expired,
  COUNT(*) FILTER (WHERE is_verified = true) as verified,
  SUM(view_count) as total_views,
  SUM(click_count) as total_clicks
FROM restaurant_promotions
GROUP BY promotion_type;

-- RLS Policies
ALTER TABLE restaurant_promotions ENABLE ROW LEVEL SECURITY;

-- Public read access for active promotions
DROP POLICY IF EXISTS "Public read active promotions" ON restaurant_promotions;
CREATE POLICY "Public read active promotions" ON restaurant_promotions
  FOR SELECT USING (is_active = true);

-- Service role full access
DROP POLICY IF EXISTS "Service role full access promotions" ON restaurant_promotions;
CREATE POLICY "Service role full access promotions" ON restaurant_promotions
  FOR ALL USING (auth.role() = 'service_role');

-- Restaurant owners can manage their promotions
DROP POLICY IF EXISTS "Owners manage promotions" ON restaurant_promotions;
CREATE POLICY "Owners manage promotions" ON restaurant_promotions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM brand_menus bm
      WHERE bm.id = restaurant_promotions.brand_menu_id
        AND bm.owner_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE restaurant_promotions IS 'Restaurant promotions, deals, and offers with expiry tracking';
COMMENT ON COLUMN restaurant_promotions.discount_value IS 'Human-readable discount (e.g., "20%", "$5 off")';
COMMENT ON COLUMN restaurant_promotions.discount_percentage IS 'Numeric percentage for sorting/filtering';
COMMENT ON COLUMN restaurant_promotions.confidence_score IS 'Accuracy confidence for auto-detected promotions';
