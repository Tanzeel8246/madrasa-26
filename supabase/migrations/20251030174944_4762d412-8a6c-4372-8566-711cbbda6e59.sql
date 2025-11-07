-- Fix infinite recursion in RLS policies by using security definer function

-- 1. Fix profiles table policies
DROP POLICY IF EXISTS "Admins can view all profiles in madrasa" ON public.profiles;

CREATE POLICY "Admins can view all profiles in madrasa"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix user_roles table policies - simplify the admin management policy
DROP POLICY IF EXISTS "Admins can manage roles in their madrasa" ON public.user_roles;

CREATE POLICY "Admins can manage roles in their madrasa"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));