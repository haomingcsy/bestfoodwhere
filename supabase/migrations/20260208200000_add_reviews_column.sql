-- Add reviews JSONB column to store Google Places reviews
ALTER TABLE mall_restaurants ADD COLUMN IF NOT EXISTS reviews JSONB;

-- Add a comment explaining the column
COMMENT ON COLUMN mall_restaurants.reviews IS 'Google Places reviews data - array of review objects with author, rating, content, etc.';
