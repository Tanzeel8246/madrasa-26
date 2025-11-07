-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  age INTEGER,
  grade TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teachers table
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  specialization TEXT NOT NULL,
  classes_count INTEGER DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  level TEXT,
  modules INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  schedule TEXT,
  duration TEXT,
  room TEXT,
  level TEXT,
  students_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  time TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a madrasa management system)
CREATE POLICY "Allow public read access on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on students" ON public.students FOR DELETE USING (true);

CREATE POLICY "Allow public read access on teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on teachers" ON public.teachers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on teachers" ON public.teachers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on teachers" ON public.teachers FOR DELETE USING (true);

CREATE POLICY "Allow public read access on courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on courses" ON public.courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on courses" ON public.courses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on courses" ON public.courses FOR DELETE USING (true);

CREATE POLICY "Allow public read access on classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on classes" ON public.classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on classes" ON public.classes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on classes" ON public.classes FOR DELETE USING (true);

CREATE POLICY "Allow public read access on attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on attendance" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on attendance" ON public.attendance FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();