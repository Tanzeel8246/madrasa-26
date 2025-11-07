-- Manually assign admin role to the current user if they have a madrasa_name
-- This is a one-time fix for existing users

-- First, let's make sure all users with madrasa_name have admin role
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'::app_role
FROM public.profiles p
WHERE p.madrasa_name IS NOT NULL 
  AND p.madrasa_name != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'admin'::app_role
  )
ON CONFLICT (user_id, role) DO NOTHING;