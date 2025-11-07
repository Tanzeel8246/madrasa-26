-- Fix teachers table RLS policies to prevent cross-madrasa data harvesting
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view teachers in their madrasa" ON public.teachers;
DROP POLICY IF EXISTS "Admins can manage teachers in their madrasa" ON public.teachers;

-- Create stricter SELECT policy that ensures both user and teacher have valid madrasa_name
CREATE POLICY "Users can view teachers in their madrasa"
ON public.teachers
FOR SELECT
USING (
  madrasa_name IS NOT NULL 
  AND madrasa_name = (
    SELECT profiles.madrasa_name 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.madrasa_name IS NOT NULL
  )
);

-- Create stricter policy for admins to manage teachers in their madrasa
CREATE POLICY "Admins can manage teachers in their madrasa"
ON public.teachers
FOR ALL
USING (
  madrasa_name IS NOT NULL
  AND madrasa_name = (
    SELECT profiles.madrasa_name 
    FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.madrasa_name IS NOT NULL
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);