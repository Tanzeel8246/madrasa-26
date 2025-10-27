-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view profiles in their madrasa" ON public.profiles;

-- Create a secure policy that explicitly requires authentication
CREATE POLICY "Authenticated users can view profiles in their madrasa"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND madrasa_name = (
    SELECT madrasa_name 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);