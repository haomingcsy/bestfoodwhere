-- BestFoodWhere Membership Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- PROFILES TABLE (extends auth.users)
-- ===========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('consumer', 'restaurant', 'admin')) DEFAULT 'consumer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- ===========================================
-- CONSUMER PROFILES TABLE
-- ===========================================
CREATE TABLE public.consumer_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  dietary_preferences TEXT[] DEFAULT '{}',
  favorite_cuisines TEXT[] DEFAULT '{}',
  email_notifications BOOLEAN DEFAULT TRUE,
  deals_notifications BOOLEAN DEFAULT TRUE
);

-- ===========================================
-- RESTAURANT PROFILES TABLE
-- ===========================================
CREATE TABLE public.restaurant_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  business_email TEXT,
  business_phone TEXT,
  mall_location TEXT,
  cuisine_type TEXT,
  website TEXT,
  description TEXT,
  -- Stripe integration
  stripe_customer_id TEXT,
  subscription_tier TEXT CHECK (subscription_tier IN ('basic', 'featured', 'premium', 'enterprise')) DEFAULT 'basic',
  subscription_status TEXT CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing', NULL)),
  subscription_id TEXT,
  -- HubSpot integration
  hubspot_contact_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for subscription lookups
CREATE INDEX idx_restaurant_profiles_stripe ON public.restaurant_profiles(stripe_customer_id);
CREATE INDEX idx_restaurant_profiles_tier ON public.restaurant_profiles(subscription_tier);

-- ===========================================
-- FAVORITES TABLE
-- ===========================================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_slug TEXT NOT NULL,
  location_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, brand_slug, location_slug)
);

-- Index for faster lookups
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_brand ON public.favorites(brand_slug);

-- ===========================================
-- REVIEWS TABLE
-- ===========================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_slug TEXT NOT NULL,
  location_slug TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_reviews_brand ON public.reviews(brand_slug);
CREATE INDEX idx_reviews_status ON public.reviews(status);

-- ===========================================
-- SAVED DEALS TABLE
-- ===========================================
CREATE TABLE public.saved_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deal_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, deal_id)
);

-- Index for faster lookups
CREATE INDEX idx_saved_deals_user ON public.saved_deals(user_id);

-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_deals ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- CONSUMER PROFILES policies
CREATE POLICY "Users can read own consumer profile"
  ON public.consumer_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own consumer profile"
  ON public.consumer_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own consumer profile"
  ON public.consumer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RESTAURANT PROFILES policies
CREATE POLICY "Users can read own restaurant profile"
  ON public.restaurant_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own restaurant profile"
  ON public.restaurant_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own restaurant profile"
  ON public.restaurant_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- FAVORITES policies
CREATE POLICY "Users can manage own favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id);

-- REVIEWS policies
CREATE POLICY "Anyone can read approved reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- SAVED DEALS policies
CREATE POLICY "Users can manage own saved deals"
  ON public.saved_deals FOR ALL
  USING (auth.uid() = user_id);

-- ===========================================
-- ADMIN POLICIES (for users with admin role)
-- ===========================================

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- Admins can read all reviews (including pending)
CREATE POLICY "Admins can read all reviews"
  ON public.reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- Admins can update review status
CREATE POLICY "Admins can update reviews"
  ON public.reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_profiles_updated_at
  BEFORE UPDATE ON public.restaurant_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- HELPER FUNCTION: Create profile on signup
-- ===========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'consumer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
