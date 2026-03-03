-- Add RLS policies for admins to update profiles
-- This allows admin users to promote other users to admin via the admin panel

-- Allow admins to update any profile (for promoting users to admin)
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- Allow admins to read all consumer profiles
CREATE POLICY "Admins can read all consumer profiles"
  ON public.consumer_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- Allow admins to read all restaurant profiles
CREATE POLICY "Admins can read all restaurant profiles"
  ON public.restaurant_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- Allow admins to delete reviews
CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );
