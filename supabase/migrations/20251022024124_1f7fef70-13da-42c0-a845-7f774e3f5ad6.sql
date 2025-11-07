-- Add madrasa_name to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS madrasa_name TEXT;

-- Update students table schema
DROP TABLE IF EXISTS public.students CASCADE;
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  contact TEXT,
  photo_url TEXT,
  age INTEGER,
  grade TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update teachers table schema
DROP TABLE IF EXISTS public.teachers CASCADE;
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  qualification TEXT NOT NULL,
  subject TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT NOT NULL,
  specialization TEXT,
  classes_count INTEGER DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update classes table schema
DROP TABLE IF EXISTS public.classes CASCADE;
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  section TEXT,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  year TEXT,
  schedule TEXT,
  duration TEXT,
  room TEXT,
  level TEXT,
  students_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update attendance table schema
DROP TABLE IF EXISTS public.attendance CASCADE;
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  time TIME,
  noted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create education_reports table
CREATE TABLE public.education_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  father_name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sabak JSONB DEFAULT '{}',
  sabqi JSONB DEFAULT '{}',
  manzil JSONB DEFAULT '{}',
  remarks TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
CREATE POLICY "Authenticated users can view students"
  ON public.students FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage students"
  ON public.students FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can manage students"
  ON public.students FOR ALL
  USING (has_role(auth.uid(), 'teacher'::app_role));

-- RLS Policies for teachers
CREATE POLICY "Authenticated users can view teachers"
  ON public.teachers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage teachers"
  ON public.teachers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for classes
CREATE POLICY "Authenticated users can view classes"
  ON public.classes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage classes"
  ON public.classes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can manage their classes"
  ON public.classes FOR ALL
  USING (teacher_id = auth.uid());

-- RLS Policies for attendance
CREATE POLICY "Authenticated users can view attendance"
  ON public.attendance FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage attendance"
  ON public.attendance FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can manage attendance"
  ON public.attendance FOR ALL
  USING (has_role(auth.uid(), 'teacher'::app_role));

-- RLS Policies for education_reports
CREATE POLICY "Authenticated users can view education reports"
  ON public.education_reports FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage education reports"
  ON public.education_reports FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can manage education reports"
  ON public.education_reports FOR ALL
  USING (has_role(auth.uid(), 'teacher'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_education_reports_updated_at
  BEFORE UPDATE ON public.education_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();