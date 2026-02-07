-- WordPress Posts Migration
-- Stores blog posts/recipes migrated from WordPress

-- Categories table
CREATE TABLE IF NOT EXISTS wp_categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS wp_posts (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  author_name TEXT DEFAULT 'BestFoodWhere',
  status TEXT DEFAULT 'publish',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post-Category relationship (many-to-many)
CREATE TABLE IF NOT EXISTS wp_post_categories (
  post_id INTEGER REFERENCES wp_posts(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES wp_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wp_posts_slug ON wp_posts(slug);
CREATE INDEX IF NOT EXISTS idx_wp_posts_published ON wp_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_wp_categories_slug ON wp_categories(slug);

-- Enable RLS
ALTER TABLE wp_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wp_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wp_post_categories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read categories" ON wp_categories FOR SELECT TO public USING (true);
CREATE POLICY "Public can read posts" ON wp_posts FOR SELECT TO public USING (status = 'publish');
CREATE POLICY "Public can read post categories" ON wp_post_categories FOR SELECT TO public USING (true);

-- Service role full access
CREATE POLICY "Service role full access categories" ON wp_categories FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access posts" ON wp_posts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access post_categories" ON wp_post_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Update trigger for posts
CREATE OR REPLACE FUNCTION update_wp_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wp_posts_updated_at
  BEFORE UPDATE ON wp_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_wp_posts_updated_at();
