-- Brand Enrichment: new columns on brand_menus, brand_reviews table, enrichment_jobs table
-- This migration supports AI-powered brand enrichment pipeline

-- =============================================================================
-- 1. Add enrichment columns to brand_menus
-- =============================================================================

ALTER TABLE brand_menus
  ADD COLUMN IF NOT EXISTS recommendations TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS ai_description TEXT,
  ADD COLUMN IF NOT EXISTS ai_description_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_amenities JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS ai_recommendations TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending'
    CHECK (enrichment_status IN ('pending', 'partial', 'complete', 'failed')),
  ADD COLUMN IF NOT EXISTS enrichment_score DECIMAL(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS menu_item_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_prices BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_images BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_brand_menus_enrichment
  ON brand_menus(enrichment_status, enrichment_score);

COMMENT ON COLUMN brand_menus.enrichment_status IS 'pending=not enriched, partial=some fields filled, complete=all fields filled, failed=enrichment error';
COMMENT ON COLUMN brand_menus.enrichment_score IS 'Completeness score from 0.00 to 1.00';
COMMENT ON COLUMN brand_menus.ai_description IS 'AI-generated description of the brand';
COMMENT ON COLUMN brand_menus.ai_amenities IS 'AI-inferred amenities (halal, vegetarian, etc.)';
COMMENT ON COLUMN brand_menus.ai_recommendations IS 'AI-generated recommended dishes';

-- =============================================================================
-- 2. Create brand_reviews table
-- =============================================================================

CREATE TABLE IF NOT EXISTS brand_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_menu_id UUID NOT NULL REFERENCES brand_menus(id) ON DELETE CASCADE,
  mall_restaurant_id UUID REFERENCES mall_restaurants(id) ON DELETE SET NULL,
  location_slug TEXT,
  author TEXT NOT NULL,
  author_photo_url TEXT,
  author_profile_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  publish_time TIMESTAMPTZ,
  relative_date TEXT,
  source TEXT DEFAULT 'google_places'
    CHECK (source IN ('google_places', 'manual', 'imported')),
  google_place_id TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_menu_id, author, publish_time)
);

-- Indexes for brand_reviews
CREATE INDEX IF NOT EXISTS idx_brand_reviews_brand
  ON brand_reviews(brand_menu_id);
CREATE INDEX IF NOT EXISTS idx_brand_reviews_mall_restaurant
  ON brand_reviews(mall_restaurant_id);
CREATE INDEX IF NOT EXISTS idx_brand_reviews_rating
  ON brand_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_brand_reviews_source
  ON brand_reviews(source);
CREATE INDEX IF NOT EXISTS idx_brand_reviews_featured
  ON brand_reviews(is_featured) WHERE is_featured = true;

-- Enable RLS
ALTER TABLE brand_reviews ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Public read access for brand_reviews" ON brand_reviews;
CREATE POLICY "Public read access for brand_reviews" ON brand_reviews
  FOR SELECT USING (true);

-- Service role full access
DROP POLICY IF EXISTS "Service role full access brand_reviews" ON brand_reviews;
CREATE POLICY "Service role full access brand_reviews" ON brand_reviews
  FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE brand_reviews IS 'Google Places reviews and manually curated reviews for brands';

-- =============================================================================
-- 3. Create enrichment_jobs table
-- =============================================================================

CREATE TABLE IF NOT EXISTS enrichment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_menu_id UUID NOT NULL REFERENCES brand_menus(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN (
    'generate_description', 'infer_amenities', 'generate_recommendations',
    'categorize_cuisine', 'generate_social_links', 'full_enrichment'
  )),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'skipped'
  )),
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  model_used TEXT,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  estimated_cost_usd DECIMAL(10,6) DEFAULT 0,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for enrichment_jobs
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_brand
  ON enrichment_jobs(brand_menu_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_status
  ON enrichment_jobs(status);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_type
  ON enrichment_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_pending
  ON enrichment_jobs(status, created_at) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE enrichment_jobs ENABLE ROW LEVEL SECURITY;

-- Service role full access (no public read needed for jobs)
DROP POLICY IF EXISTS "Service role full access enrichment_jobs" ON enrichment_jobs;
CREATE POLICY "Service role full access enrichment_jobs" ON enrichment_jobs
  FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE enrichment_jobs IS 'Tracks AI enrichment jobs for brand data generation';
COMMENT ON COLUMN enrichment_jobs.model_used IS 'AI model used (e.g., claude-sonnet-4-20250514, gpt-4o)';
COMMENT ON COLUMN enrichment_jobs.estimated_cost_usd IS 'Estimated cost in USD based on token usage';
