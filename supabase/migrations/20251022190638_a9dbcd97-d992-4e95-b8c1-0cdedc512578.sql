-- Refresh database types by adding a helpful comment
-- This migration ensures all tables are properly recognized by TypeScript

-- Add comment to profiles table to trigger types refresh
COMMENT ON TABLE public.profiles IS 'User profile information';
COMMENT ON TABLE public.students IS 'Student records and information';
COMMENT ON TABLE public.teachers IS 'Teacher information and assignments';
COMMENT ON TABLE public.classes IS 'Class schedules and details';
COMMENT ON TABLE public.courses IS 'Course catalog and progress tracking';
COMMENT ON TABLE public.education_reports IS 'Daily education progress reports';
COMMENT ON TABLE public.attendance IS 'Student attendance tracking';
COMMENT ON TABLE public.user_roles IS 'User role assignments for access control';