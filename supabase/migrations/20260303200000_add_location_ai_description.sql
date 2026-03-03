-- Add AI-generated meta description columns to brand_locations
-- for unique per-location SEO descriptions
ALTER TABLE brand_locations
  ADD COLUMN IF NOT EXISTS ai_description TEXT,
  ADD COLUMN IF NOT EXISTS ai_description_generated_at TIMESTAMPTZ;
