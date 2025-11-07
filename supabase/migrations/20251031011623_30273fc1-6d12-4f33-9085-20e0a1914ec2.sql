-- Drop existing problematic policy
DROP POLICY IF EXISTS "Authenticated users can submit join request for their own email" ON pending_user_roles;

-- Fix the admin management policy to include proper WITH CHECK for INSERT
DROP POLICY IF EXISTS "Admins can manage pending roles in their madrasa" ON pending_user_roles;

-- Create updated admin policy with both USING and WITH CHECK
CREATE POLICY "Admins can manage pending roles in their madrasa"
ON pending_user_roles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  (madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid()) OR madrasa_name IS NULL)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow authenticated users to create join requests for any email
CREATE POLICY "Users can create join requests"
ON pending_user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);