-- Add Google Places ID and hero image URL to mall_restaurants
ALTER TABLE mall_restaurants
  ADD COLUMN IF NOT EXISTS google_place_id TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';

-- Create index for google_place_id lookups
CREATE INDEX IF NOT EXISTS idx_mall_restaurants_google_place_id
  ON mall_restaurants(google_place_id);

-- Comment on columns
COMMENT ON COLUMN mall_restaurants.google_place_id IS 'Google Places API place_id for fetching photos';
COMMENT ON COLUMN mall_restaurants.hero_image_url IS 'High-quality hero image URL from Google Places Photos API';
COMMENT ON COLUMN mall_restaurants.photos IS 'Array of photo URLs from Google Places API';
