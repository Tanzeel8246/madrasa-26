-- Fix the infinite recursion issue in profiles RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Authenticated users can view profiles in their madrasa" ON public.profiles;

-- Create a simpler policy that doesn't cause recursion
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles in their madrasa
CREATE POLICY "Admins can view all profiles in madrasa"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'::app_role
  )
);