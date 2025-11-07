-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Create the delete policy
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);