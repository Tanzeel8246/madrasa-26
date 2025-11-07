-- Create triggers to automatically set madrasa_name on insert for all tables

-- Trigger for students table
DROP TRIGGER IF EXISTS set_madrasa_name_students ON public.students;
CREATE TRIGGER set_madrasa_name_students
  BEFORE INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.set_madrasa_name();

-- Trigger for teachers table
DROP TRIGGER IF EXISTS set_madrasa_name_teachers ON public.teachers;
CREATE TRIGGER set_madrasa_name_teachers
  BEFORE INSERT ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_madrasa_name();

-- Trigger for attendance table
DROP TRIGGER IF EXISTS set_madrasa_name_attendance ON public.attendance;
CREATE TRIGGER set_madrasa_name_attendance
  BEFORE INSERT ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.set_madrasa_name();

-- Trigger for education_reports table
DROP TRIGGER IF EXISTS set_madrasa_name_education_reports ON public.education_reports;
CREATE TRIGGER set_madrasa_name_education_reports
  BEFORE INSERT ON public.education_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_madrasa_name();

-- Trigger for classes table
DROP TRIGGER IF EXISTS set_madrasa_name_classes ON public.classes;
CREATE TRIGGER set_madrasa_name_classes
  BEFORE INSERT ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_madrasa_name();

-- Trigger for courses table
DROP TRIGGER IF EXISTS set_madrasa_name_courses ON public.courses;
CREATE TRIGGER set_madrasa_name_courses
  BEFORE INSERT ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_madrasa_name();

-- Trigger for fees table
DROP TRIGGER IF EXISTS set_madrasa_name_fees ON public.fees;
CREATE TRIGGER set_madrasa_name_fees
  BEFORE INSERT ON public.fees
  FOR EACH ROW
  EXECUTE FUNCTION public.set_madrasa_name();