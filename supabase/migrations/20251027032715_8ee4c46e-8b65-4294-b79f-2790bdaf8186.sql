-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a secure policy that only allows authenticated users to view profiles in their madrasa
CREATE POLICY "Users can view profiles in their madrasa"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  madrasa_name = (
    SELECT madrasa_name 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);