-- Recipe Content Table
-- Stores enriched recipe content generated from web research
-- Links to WordPress posts via wp_slug

CREATE TABLE recipe_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wp_slug TEXT UNIQUE NOT NULL,
  wp_post_id INTEGER,

  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  introduction TEXT,
  why_love_it TEXT,

  -- Quick Facts (actual researched values)
  prep_time_minutes INTEGER NOT NULL,
  cook_time_minutes INTEGER NOT NULL,
  total_time_minutes INTEGER GENERATED ALWAYS AS (prep_time_minutes + cook_time_minutes) STORED,
  servings INTEGER NOT NULL DEFAULT 4,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),

  -- Structured Content (JSONB)
  ingredients JSONB NOT NULL DEFAULT '[]', -- [{item, quantity, unit, notes, section}]
  instructions JSONB NOT NULL DEFAULT '[]', -- [{step, text, time_minutes, tip, image_hint}]
  equipment JSONB DEFAULT '[]', -- [{name, required, affiliate_link}]
  substitutions JSONB DEFAULT '[]', -- [{original, substitute, notes}]
  nutrition JSONB, -- {calories, protein, carbs, fat, fiber, sodium}

  -- Additional Helpful Content
  doneness_tips TEXT,
  storage_tips TEXT,
  pro_tips TEXT[] DEFAULT '{}',
  common_mistakes TEXT[] DEFAULT '{}',

  -- FAQ
  faq JSONB DEFAULT '[]', -- [{question, answer}]

  -- Attribution & Metadata
  sources JSONB NOT NULL DEFAULT '[]', -- [{url, title, accessed_date}]
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_recipe_content_slug ON recipe_content(wp_slug);
CREATE INDEX idx_recipe_content_verified ON recipe_content(is_verified);
CREATE INDEX idx_recipe_content_wp_post_id ON recipe_content(wp_post_id);

-- Enable Row Level Security
ALTER TABLE recipe_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can read all recipe content
CREATE POLICY "Public can read recipe content"
  ON recipe_content
  FOR SELECT
  TO public
  USING (true);

-- Service role can do everything (for the skill to insert/update)
CREATE POLICY "Service role has full access"
  ON recipe_content
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recipe_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipe_content_updated_at
  BEFORE UPDATE ON recipe_content
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_content_updated_at();

-- Comments for documentation
COMMENT ON TABLE recipe_content IS 'Enriched recipe content generated from web research';
COMMENT ON COLUMN recipe_content.wp_slug IS 'Links to WordPress post slug';
COMMENT ON COLUMN recipe_content.ingredients IS 'Array of {item, quantity, unit, notes, section}';
COMMENT ON COLUMN recipe_content.instructions IS 'Array of {step, text, time_minutes, tip, image_hint}';
COMMENT ON COLUMN recipe_content.sources IS 'Array of {url, title, accessed_date} for attribution';
