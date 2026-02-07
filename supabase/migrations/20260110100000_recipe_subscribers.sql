-- Recipe Newsletter Subscribers Table
-- Stores email subscribers from recipe pages

CREATE TABLE IF NOT EXISTS recipe_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  source_url TEXT,
  is_active BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_recipe_subscribers_email ON recipe_subscribers(email);

-- Index for active subscribers
CREATE INDEX IF NOT EXISTS idx_recipe_subscribers_active ON recipe_subscribers(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE recipe_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access to recipe_subscribers"
  ON recipe_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow public to insert (for newsletter signups)
CREATE POLICY "Anyone can subscribe to recipe newsletter"
  ON recipe_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_recipe_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipe_subscribers_updated_at
  BEFORE UPDATE ON recipe_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_subscribers_updated_at();
