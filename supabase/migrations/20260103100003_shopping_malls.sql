-- Shopping Malls table
CREATE TABLE IF NOT EXISTS shopping_malls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  hero_image_url TEXT,
  logo_url TEXT,
  address TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  opening_hours JSONB DEFAULT '[]',
  getting_here JSONB DEFAULT '{"mrt": [], "bus": [], "parking": []}',
  map_embed_url TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  restaurant_count INTEGER DEFAULT 0,
  cuisine_count INTEGER DEFAULT 0,
  dining_options_count INTEGER DEFAULT 0,
  region TEXT,
  badge TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mall Restaurants table
CREATE TABLE IF NOT EXISTS mall_restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mall_id UUID REFERENCES shopping_malls(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT,
  image_url TEXT,
  rating DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  price_range TEXT,
  cuisines TEXT[] DEFAULT '{}',
  dining_styles TEXT[] DEFAULT '{}',
  description TEXT,
  opening_hours TEXT,
  phone TEXT,
  website TEXT,
  dining_options TEXT[] DEFAULT '{}',
  has_menu_page BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mall_id, slug)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopping_malls_slug ON shopping_malls(slug);
CREATE INDEX IF NOT EXISTS idx_shopping_malls_active ON shopping_malls(is_active);
CREATE INDEX IF NOT EXISTS idx_shopping_malls_region ON shopping_malls(region);
CREATE INDEX IF NOT EXISTS idx_mall_restaurants_mall_id ON mall_restaurants(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_restaurants_slug ON mall_restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_mall_restaurants_cuisines ON mall_restaurants USING GIN(cuisines);
CREATE INDEX IF NOT EXISTS idx_mall_restaurants_dining_styles ON mall_restaurants USING GIN(dining_styles);

-- Enable Row Level Security
ALTER TABLE shopping_malls ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_restaurants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
DROP POLICY IF EXISTS "Public read access for shopping_malls" ON shopping_malls;
CREATE POLICY "Public read access for shopping_malls" ON shopping_malls
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read access for mall_restaurants" ON mall_restaurants;
CREATE POLICY "Public read access for mall_restaurants" ON mall_restaurants
  FOR SELECT USING (is_active = true);

-- Service role can do anything
DROP POLICY IF EXISTS "Service role full access shopping_malls" ON shopping_malls;
CREATE POLICY "Service role full access shopping_malls" ON shopping_malls
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access mall_restaurants" ON mall_restaurants;
CREATE POLICY "Service role full access mall_restaurants" ON mall_restaurants
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_shopping_malls_updated_at ON shopping_malls;
CREATE TRIGGER update_shopping_malls_updated_at
  BEFORE UPDATE ON shopping_malls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mall_restaurants_updated_at ON mall_restaurants;
CREATE TRIGGER update_mall_restaurants_updated_at
  BEFORE UPDATE ON mall_restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update restaurant count when restaurants change
CREATE OR REPLACE FUNCTION update_mall_restaurant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE shopping_malls
    SET restaurant_count = (
      SELECT COUNT(*) FROM mall_restaurants
      WHERE mall_id = OLD.mall_id AND is_active = true
    )
    WHERE id = OLD.mall_id;
    RETURN OLD;
  ELSE
    UPDATE shopping_malls
    SET restaurant_count = (
      SELECT COUNT(*) FROM mall_restaurants
      WHERE mall_id = NEW.mall_id AND is_active = true
    )
    WHERE id = NEW.mall_id;
    RETURN NEW;
  END IF;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_restaurant_count ON mall_restaurants;
CREATE TRIGGER update_restaurant_count
  AFTER INSERT OR UPDATE OR DELETE ON mall_restaurants
  FOR EACH ROW EXECUTE FUNCTION update_mall_restaurant_count();
