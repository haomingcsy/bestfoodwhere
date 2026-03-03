-- Add SEO meta description column to brand_menus for AI-generated meta descriptions
ALTER TABLE brand_menus ADD COLUMN IF NOT EXISTS seo_meta_description TEXT;
ALTER TABLE brand_menus ADD COLUMN IF NOT EXISTS seo_meta_description_generated_at TIMESTAMPTZ;
