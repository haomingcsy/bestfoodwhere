-- Menu Item Image Cache Table
-- Stores CDN URLs for menu-related images (menu items, hero, logo, promotions)

CREATE TABLE IF NOT EXISTS public.menu_item_image_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url TEXT NOT NULL,
  cdn_url TEXT NOT NULL,
  brand_slug TEXT NOT NULL,
  menu_item_name TEXT,
  image_type TEXT DEFAULT 'menu_item' CHECK (image_type IN ('menu_item', 'hero', 'logo', 'promotion', 'recommendation', 'related_brand')),
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(original_url)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_menu_item_image_cache_original_url
ON public.menu_item_image_cache(original_url);

CREATE INDEX IF NOT EXISTS idx_menu_item_image_cache_brand
ON public.menu_item_image_cache(brand_slug);

CREATE INDEX IF NOT EXISTS idx_menu_item_image_cache_type
ON public.menu_item_image_cache(image_type);

-- Enable Row Level Security
ALTER TABLE public.menu_item_image_cache ENABLE ROW LEVEL SECURITY;

-- Public read access policy
CREATE POLICY "Allow public read access to menu image cache"
ON public.menu_item_image_cache
FOR SELECT
TO public
USING (true);

-- Service role full access policy
CREATE POLICY "Allow service role full access to menu image cache"
ON public.menu_item_image_cache
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create storage bucket for menu images if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for menu-images bucket
CREATE POLICY "Allow public read access to menu images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menu-images');

CREATE POLICY "Allow service role upload to menu images"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "Allow service role update menu images"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "Allow service role delete menu images"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'menu-images');

-- Comment for documentation
COMMENT ON TABLE public.menu_item_image_cache IS 'Cache table for menu-related images CDN URLs. Maps original image URLs to optimized Supabase Storage CDN URLs.';
COMMENT ON COLUMN public.menu_item_image_cache.image_type IS 'Type of image: menu_item, hero, logo, promotion, recommendation, related_brand';
