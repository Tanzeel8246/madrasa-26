-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- User roles policies (only admins can manage roles)
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Drop all existing public access policies
DROP POLICY IF EXISTS "Allow public read access on students" ON public.students;
DROP POLICY IF EXISTS "Allow public insert access on students" ON public.students;
DROP POLICY IF EXISTS "Allow public update access on students" ON public.students;
DROP POLICY IF EXISTS "Allow public delete access on students" ON public.students;

DROP POLICY IF EXISTS "Allow public read access on teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow public insert access on teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow public update access on teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow public delete access on teachers" ON public.teachers;

DROP POLICY IF EXISTS "Allow public read access on classes" ON public.classes;
DROP POLICY IF EXISTS "Allow public insert access on classes" ON public.classes;
DROP POLICY IF EXISTS "Allow public update access on classes" ON public.classes;
DROP POLICY IF EXISTS "Allow public delete access on classes" ON public.classes;

DROP POLICY IF EXISTS "Allow public read access on courses" ON public.courses;
DROP POLICY IF EXISTS "Allow public insert access on courses" ON public.courses;
DROP POLICY IF EXISTS "Allow public update access on courses" ON public.courses;
DROP POLICY IF EXISTS "Allow public delete access on courses" ON public.courses;

DROP POLICY IF EXISTS "Allow public read access on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public insert access on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public update access on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public delete access on attendance" ON public.attendance;

-- Students table policies (authenticated users can view, admins can manage)
CREATE POLICY "Authenticated users can view students"
ON public.students FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage students"
ON public.students FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Teachers table policies (authenticated users can view, admins can manage)
CREATE POLICY "Authenticated users can view teachers"
ON public.teachers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage teachers"
ON public.teachers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Classes table policies (authenticated users can view, admins and teachers can manage)
CREATE POLICY "Authenticated users can view classes"
ON public.classes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage classes"
ON public.classes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage their classes"
ON public.classes FOR ALL
TO authenticated
USING (teacher_id = auth.uid());

-- Courses table policies (authenticated users can view, admins can manage)
CREATE POLICY "Authenticated users can view courses"
ON public.courses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage courses"
ON public.courses FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Attendance table policies (authenticated users can view, admins and teachers can manage)
CREATE POLICY "Authenticated users can view attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage attendance"
ON public.attendance FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage attendance"
ON public.attendance FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_id AND c.teacher_id = auth.uid()
  )
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();