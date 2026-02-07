-- Fix infinite recursion in RLS policies
-- The admin policies were querying the profiles table, causing recursion

-- Drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can read all consumer profiles" ON public.consumer_profiles;
DROP POLICY IF EXISTS "Admins can read all restaurant profiles" ON public.restaurant_profiles;

-- Create a security definer function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND account_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate admin policies using the function
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can read all reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can update reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can read all consumer profiles"
  ON public.consumer_profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can read all restaurant profiles"
  ON public.restaurant_profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());
