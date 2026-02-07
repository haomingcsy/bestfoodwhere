-- Create storage bucket for restaurant images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-images',
  'restaurant-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow public read access to restaurant images
CREATE POLICY "Public read access for restaurant images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');

-- Allow authenticated users to upload images (for n8n service role)
CREATE POLICY "Service role can upload restaurant images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'restaurant-images');

-- Allow service role to update/delete images
CREATE POLICY "Service role can update restaurant images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'restaurant-images');

CREATE POLICY "Service role can delete restaurant images"
ON storage.objects FOR DELETE
USING (bucket_id = 'restaurant-images');

-- Create a table to track processed images
CREATE TABLE IF NOT EXISTS public.restaurant_image_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url TEXT NOT NULL,
  cdn_url TEXT NOT NULL,
  mall_slug TEXT NOT NULL,
  restaurant_slug TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(original_url)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_image_cache_original_url
ON public.restaurant_image_cache(original_url);

CREATE INDEX IF NOT EXISTS idx_restaurant_image_cache_mall_restaurant
ON public.restaurant_image_cache(mall_slug, restaurant_slug);

-- RLS policies for restaurant_image_cache
ALTER TABLE public.restaurant_image_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for image cache"
ON public.restaurant_image_cache FOR SELECT
USING (true);

CREATE POLICY "Service role can manage image cache"
ON public.restaurant_image_cache FOR ALL
USING (true);

COMMENT ON TABLE public.restaurant_image_cache IS 'Cache of processed restaurant images with CDN URLs';
