-- Fix all tables to require authentication for SELECT operations
-- This prevents public access to sensitive data

-- 1. Fix profiles table
DROP POLICY IF EXISTS "Authenticated users can view profiles in their madrasa" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles in their madrasa"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND madrasa_name = (
    SELECT profiles_1.madrasa_name
    FROM public.profiles profiles_1
    WHERE profiles_1.id = auth.uid()
  )
);

-- 2. Fix students table
DROP POLICY IF EXISTS "Users can view students in their madrasa" ON public.students;
CREATE POLICY "Authenticated users can view students in their madrasa"
ON public.students
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND madrasa_name = (
    SELECT profiles.madrasa_name
    FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
);

-- 3. Fix teachers table
DROP POLICY IF EXISTS "Users can view teachers in their madrasa" ON public.teachers;
CREATE POLICY "Authenticated users can view teachers in their madrasa"
ON public.teachers
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND madrasa_name IS NOT NULL 
  AND madrasa_name = (
    SELECT profiles.madrasa_name 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.madrasa_name IS NOT NULL
  )
);

-- 4. Fix fees table
DROP POLICY IF EXISTS "Users can view fees in their madrasa" ON public.fees;
CREATE POLICY "Authenticated users can view fees in their madrasa"
ON public.fees
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND madrasa_name = (
    SELECT profiles.madrasa_name
    FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
);

-- 5. Fix attendance table
DROP POLICY IF EXISTS "Users can view attendance in their madrasa" ON public.attendance;
CREATE POLICY "Authenticated users can view attendance in their madrasa"
ON public.attendance
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND madrasa_name = (
    SELECT profiles.madrasa_name
    FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
);

-- 6. Fix education_reports table
DROP POLICY IF EXISTS "Users can view education reports in their madrasa" ON public.education_reports;
CREATE POLICY "Authenticated users can view education reports in their madrasa"
ON public.education_reports
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND madrasa_name = (
    SELECT profiles.madrasa_name
    FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
);

-- 7. Fix pending_user_roles table - only admins should view these
DROP POLICY IF EXISTS "Admins can manage pending roles in their madrasa" ON public.pending_user_roles;
CREATE POLICY "Admins can view and manage pending roles in their madrasa"
ON public.pending_user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND madrasa_name = (
    SELECT profiles.madrasa_name
    FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Recreate the ALL policy for pending_user_roles
CREATE POLICY "Admins can manage pending roles in their madrasa"
ON public.pending_user_roles
FOR ALL
TO authenticated
USING (
  madrasa_name = (
    SELECT profiles.madrasa_name
    FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);