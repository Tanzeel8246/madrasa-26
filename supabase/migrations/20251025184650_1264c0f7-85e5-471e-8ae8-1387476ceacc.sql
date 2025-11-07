-- Add full_name column to pending_user_roles
ALTER TABLE public.pending_user_roles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Allow anyone to insert join requests (they're not authenticated yet)
CREATE POLICY "Anyone can submit join request"
ON public.pending_user_roles
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to submit join requests too
CREATE POLICY "Authenticated can submit join request"
ON public.pending_user_roles
FOR INSERT
TO authenticated
WITH CHECK (true);