-- Menu System Tables for 900+ Restaurant Menu Pages
-- This migration creates the Supabase-native menu data storage

-- 1. Brand menus (top-level restaurant/brand)
CREATE TABLE IF NOT EXISTS brand_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT,
  social_links JSONB DEFAULT '{}',
  promotions TEXT[] DEFAULT '{}',
  coupons TEXT[] DEFAULT '{}',
  amenities JSONB DEFAULT '[]',
  scrape_status TEXT DEFAULT 'pending' CHECK (scrape_status IN ('pending', 'in_progress', 'completed', 'failed', 'no_website', 'manual')),
  scrape_error TEXT,
  last_scraped_at TIMESTAMPTZ,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Menu categories (e.g., "Appetizers", "Main Course", "Drinks")
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_menu_id UUID NOT NULL REFERENCES brand_menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Menu items (individual food/drink items)
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  brand_menu_id UUID NOT NULL REFERENCES brand_menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT,
  price_numeric DECIMAL(10,2),
  original_image_url TEXT,
  cdn_image_url TEXT,
  dietary_tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Brand locations (links brand to mall_restaurants for multi-location brands)
CREATE TABLE IF NOT EXISTS brand_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_menu_id UUID NOT NULL REFERENCES brand_menus(id) ON DELETE CASCADE,
  mall_restaurant_id UUID REFERENCES mall_restaurants(id) ON DELETE SET NULL,
  mall_slug TEXT NOT NULL,
  location_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  opening_hours TEXT,
  website TEXT,
  description TEXT,
  amenities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_menu_id, mall_slug)
);

-- 5. Scrape logs (for debugging and tracking scraping attempts)
CREATE TABLE IF NOT EXISTS scrape_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_menu_id UUID REFERENCES brand_menus(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial', 'skipped')),
  items_found INTEGER DEFAULT 0,
  categories_found INTEGER DEFAULT 0,
  images_found INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_menus_slug ON brand_menus(slug);
CREATE INDEX IF NOT EXISTS idx_brand_menus_scrape_status ON brand_menus(scrape_status);
CREATE INDEX IF NOT EXISTS idx_brand_menus_active ON brand_menus(is_active);

CREATE INDEX IF NOT EXISTS idx_menu_categories_brand ON menu_categories(brand_menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_sort ON menu_categories(brand_menu_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_menu_items_brand ON menu_items(brand_menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort ON menu_items(category_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_brand_locations_brand ON brand_locations(brand_menu_id);
CREATE INDEX IF NOT EXISTS idx_brand_locations_mall ON brand_locations(mall_slug);
CREATE INDEX IF NOT EXISTS idx_brand_locations_restaurant ON brand_locations(mall_restaurant_id);

CREATE INDEX IF NOT EXISTS idx_scrape_logs_brand ON scrape_logs(brand_menu_id);
CREATE INDEX IF NOT EXISTS idx_scrape_logs_status ON scrape_logs(status);

-- Enable Row Level Security
ALTER TABLE brand_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
DROP POLICY IF EXISTS "Public read access for brand_menus" ON brand_menus;
CREATE POLICY "Public read access for brand_menus" ON brand_menus
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read access for menu_categories" ON menu_categories;
CREATE POLICY "Public read access for menu_categories" ON menu_categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read access for menu_items" ON menu_items;
CREATE POLICY "Public read access for menu_items" ON menu_items
  FOR SELECT USING (is_available = true);

DROP POLICY IF EXISTS "Public read access for brand_locations" ON brand_locations;
CREATE POLICY "Public read access for brand_locations" ON brand_locations
  FOR SELECT USING (true);

-- Service role can do anything (for scripts)
DROP POLICY IF EXISTS "Service role full access brand_menus" ON brand_menus;
CREATE POLICY "Service role full access brand_menus" ON brand_menus
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access menu_categories" ON menu_categories;
CREATE POLICY "Service role full access menu_categories" ON menu_categories
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access menu_items" ON menu_items;
CREATE POLICY "Service role full access menu_items" ON menu_items
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access brand_locations" ON brand_locations;
CREATE POLICY "Service role full access brand_locations" ON brand_locations
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access scrape_logs" ON scrape_logs;
CREATE POLICY "Service role full access scrape_logs" ON scrape_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_menu_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_brand_menus_updated_at ON brand_menus;
CREATE TRIGGER update_brand_menus_updated_at
  BEFORE UPDATE ON brand_menus
  FOR EACH ROW EXECUTE FUNCTION update_menu_updated_at();

DROP TRIGGER IF EXISTS update_menu_categories_updated_at ON menu_categories;
CREATE TRIGGER update_menu_categories_updated_at
  BEFORE UPDATE ON menu_categories
  FOR EACH ROW EXECUTE FUNCTION update_menu_updated_at();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_menu_updated_at();

DROP TRIGGER IF EXISTS update_brand_locations_updated_at ON brand_locations;
CREATE TRIGGER update_brand_locations_updated_at
  BEFORE UPDATE ON brand_locations
  FOR EACH ROW EXECUTE FUNCTION update_menu_updated_at();

-- Comments
COMMENT ON TABLE brand_menus IS 'Top-level restaurant/brand menu data';
COMMENT ON TABLE menu_categories IS 'Menu sections like Appetizers, Main Course, Drinks';
COMMENT ON TABLE menu_items IS 'Individual food/drink items with prices and images';
COMMENT ON TABLE brand_locations IS 'Links brands to specific mall locations';
COMMENT ON TABLE scrape_logs IS 'Tracks web scraping attempts for debugging';

COMMENT ON COLUMN brand_menus.scrape_status IS 'pending=not scraped, in_progress=scraping, completed=success, failed=error, no_website=no URL, manual=manually entered';
COMMENT ON COLUMN menu_items.price_numeric IS 'Parsed numeric price for sorting/filtering';
COMMENT ON COLUMN menu_items.dietary_tags IS 'Tags like vegetarian, halal, gluten-free';
