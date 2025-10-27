-- Drop the insecure policies that allow unauthenticated inserts
DROP POLICY IF EXISTS "Anyone can submit join request" ON public.pending_user_roles;
DROP POLICY IF EXISTS "Authenticated can submit join request" ON public.pending_user_roles;

-- Create a secure policy that requires authentication and validates email
CREATE POLICY "Authenticated users can submit join request for their own email"
ON public.pending_user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
);