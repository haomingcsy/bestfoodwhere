-- Table for storing AI-generated restaurant descriptions
CREATE TABLE IF NOT EXISTS public.restaurant_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name TEXT NOT NULL,
  mall_slug TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_name, mall_slug)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_descriptions_lookup
ON public.restaurant_descriptions(restaurant_name, mall_slug);

-- Enable RLS
ALTER TABLE public.restaurant_descriptions ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read access" ON public.restaurant_descriptions;
CREATE POLICY "Allow public read access" ON public.restaurant_descriptions
  FOR SELECT USING (true);
