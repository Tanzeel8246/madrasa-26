-- Add madrasa_name columns to all tables for data isolation
ALTER TABLE students ADD COLUMN IF NOT EXISTS madrasa_name TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS madrasa_name TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS madrasa_name TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS madrasa_name TEXT;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS madrasa_name TEXT;
ALTER TABLE education_reports ADD COLUMN IF NOT EXISTS madrasa_name TEXT;
ALTER TABLE pending_user_roles ADD COLUMN IF NOT EXISTS madrasa_name TEXT;

-- Create fees table if not exists
CREATE TABLE IF NOT EXISTS fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL,
  fee_type TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  payment_screenshot_url TEXT,
  madrasa_name TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on fees table
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for fee payment screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fee-payments', 'fee-payments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for fee payments bucket
CREATE POLICY "Users can upload their own fee payment screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fee-payments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view fee payment screenshots in their madrasa"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'fee-payments'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR auth.uid()::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can update their own fee payment screenshots"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'fee-payments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own fee payment screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'fee-payments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Update handle_new_user function to properly handle madrasa assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending_role app_role;
  pending_madrasa TEXT;
BEGIN
  -- Check if there's a pending role for this email
  SELECT role, madrasa_name INTO pending_role, pending_madrasa
  FROM public.pending_user_roles
  WHERE email = NEW.email;
  
  -- Determine the madrasa name: use pending if exists, otherwise use from signup metadata
  IF pending_madrasa IS NOT NULL THEN
    -- Insert profile with pending madrasa (user is joining an existing madrasa)
    INSERT INTO public.profiles (id, full_name, madrasa_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      pending_madrasa
    );
    
    -- Assign the pending role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, pending_role);
    
    -- Delete the pending role record
    DELETE FROM public.pending_user_roles WHERE email = NEW.email;
  ELSE
    -- Insert profile with madrasa from signup (new independent madrasa)
    INSERT INTO public.profiles (id, full_name, madrasa_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.raw_user_meta_data->>'madrasa_name'
    );
    
    -- Assign admin role (new madrasa admin)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to automatically set madrasa_name on insert
CREATE OR REPLACE FUNCTION public.set_madrasa_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_madrasa TEXT;
BEGIN
  -- Get the user's madrasa name
  SELECT madrasa_name INTO user_madrasa
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Set the madrasa_name on the new record
  NEW.madrasa_name := user_madrasa;
  
  RETURN NEW;
END;
$$;

-- Create triggers to automatically set madrasa_name
DROP TRIGGER IF EXISTS set_student_madrasa ON students;
CREATE TRIGGER set_student_madrasa
  BEFORE INSERT ON students
  FOR EACH ROW
  EXECUTE FUNCTION set_madrasa_name();

DROP TRIGGER IF EXISTS set_teacher_madrasa ON teachers;
CREATE TRIGGER set_teacher_madrasa
  BEFORE INSERT ON teachers
  FOR EACH ROW
  EXECUTE FUNCTION set_madrasa_name();

DROP TRIGGER IF EXISTS set_class_madrasa ON classes;
CREATE TRIGGER set_class_madrasa
  BEFORE INSERT ON classes
  FOR EACH ROW
  EXECUTE FUNCTION set_madrasa_name();

DROP TRIGGER IF EXISTS set_course_madrasa ON courses;
CREATE TRIGGER set_course_madrasa
  BEFORE INSERT ON courses
  FOR EACH ROW
  EXECUTE FUNCTION set_madrasa_name();

DROP TRIGGER IF EXISTS set_attendance_madrasa ON attendance;
CREATE TRIGGER set_attendance_madrasa
  BEFORE INSERT ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION set_madrasa_name();

DROP TRIGGER IF EXISTS set_education_report_madrasa ON education_reports;
CREATE TRIGGER set_education_report_madrasa
  BEFORE INSERT ON education_reports
  FOR EACH ROW
  EXECUTE FUNCTION set_madrasa_name();

DROP TRIGGER IF EXISTS set_fee_madrasa ON fees;
CREATE TRIGGER set_fee_madrasa
  BEFORE INSERT ON fees
  FOR EACH ROW
  EXECUTE FUNCTION set_madrasa_name();

DROP TRIGGER IF EXISTS set_pending_role_madrasa ON pending_user_roles;
CREATE TRIGGER set_pending_role_madrasa
  BEFORE INSERT ON pending_user_roles
  FOR EACH ROW
  EXECUTE FUNCTION set_madrasa_name();

-- Update RLS policies for data isolation by madrasa_name
-- Students
DROP POLICY IF EXISTS "Authenticated users can view students" ON students;
CREATE POLICY "Users can view students in their madrasa"
ON students FOR SELECT
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage students" ON students;
DROP POLICY IF EXISTS "Teachers can manage students" ON students;
CREATE POLICY "Admins and teachers can manage students in their madrasa"
ON students FOR ALL
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
);

-- Teachers
DROP POLICY IF EXISTS "Authenticated users can view teachers" ON teachers;
CREATE POLICY "Users can view teachers in their madrasa"
ON teachers FOR SELECT
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage teachers" ON teachers;
CREATE POLICY "Admins can manage teachers in their madrasa"
ON teachers FOR ALL
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Classes
DROP POLICY IF EXISTS "Authenticated users can view classes" ON classes;
CREATE POLICY "Users can view classes in their madrasa"
ON classes FOR SELECT
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage classes" ON classes;
DROP POLICY IF EXISTS "Teachers can manage their classes" ON classes;
CREATE POLICY "Admins and teachers can manage classes in their madrasa"
ON classes FOR ALL
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
);

-- Courses
DROP POLICY IF EXISTS "Authenticated users can view courses" ON courses;
CREATE POLICY "Users can view courses in their madrasa"
ON courses FOR SELECT
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
CREATE POLICY "Admins can manage courses in their madrasa"
ON courses FOR ALL
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Attendance
DROP POLICY IF EXISTS "Authenticated users can view attendance" ON attendance;
CREATE POLICY "Users can view attendance in their madrasa"
ON attendance FOR SELECT
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage attendance" ON attendance;
DROP POLICY IF EXISTS "Teachers can manage attendance" ON attendance;
CREATE POLICY "Admins and teachers can manage attendance in their madrasa"
ON attendance FOR ALL
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
);

-- Education Reports
DROP POLICY IF EXISTS "Authenticated users can view education reports" ON education_reports;
CREATE POLICY "Users can view education reports in their madrasa"
ON education_reports FOR SELECT
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage education reports" ON education_reports;
DROP POLICY IF EXISTS "Teachers can manage education reports" ON education_reports;
CREATE POLICY "Admins and teachers can manage education reports in their madrasa"
ON education_reports FOR ALL
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
);

-- Fees
CREATE POLICY "Users can view fees in their madrasa"
ON fees FOR SELECT
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins and teachers can manage fees in their madrasa"
ON fees FOR ALL
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
);

-- Pending User Roles
DROP POLICY IF EXISTS "Admins can manage pending roles" ON pending_user_roles;
CREATE POLICY "Admins can manage pending roles in their madrasa"
ON pending_user_roles FOR ALL
USING (
  madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- User Roles - update to filter by madrasa
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
CREATE POLICY "Admins can manage roles in their madrasa"
ON user_roles FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND user_id IN (
    SELECT id FROM profiles 
    WHERE madrasa_name = (SELECT madrasa_name FROM profiles WHERE id = auth.uid())
  )
);

-- Add trigger for updated_at on fees
DROP TRIGGER IF EXISTS update_fees_updated_at ON fees;
CREATE TRIGGER update_fees_updated_at
  BEFORE UPDATE ON fees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();