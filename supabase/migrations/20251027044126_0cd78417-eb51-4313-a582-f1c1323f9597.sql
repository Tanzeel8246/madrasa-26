-- Fix user_roles table to require authentication
-- Drop and recreate policies with explicit authentication requirements
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles in their madrasa" ON public.user_roles;

-- Ensure RLS is enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy that requires authentication
CREATE POLICY "Authenticated users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- Create policy for admins to manage roles in their madrasa
CREATE POLICY "Admins can manage roles in their madrasa"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND has_role(auth.uid(), 'admin'::app_role) 
  AND (user_id IN (
    SELECT profiles.id
    FROM public.profiles
    WHERE profiles.madrasa_name = (
      SELECT profiles_1.madrasa_name
      FROM public.profiles profiles_1
      WHERE profiles_1.id = auth.uid()
      AND profiles_1.madrasa_name IS NOT NULL
    )
  ))
);