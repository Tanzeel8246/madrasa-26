-- First, ensure the trigger exists for profiles table
DROP TRIGGER IF EXISTS on_auth_user_created ON public.profiles;

-- Create or replace the trigger to automatically assign admin role on new profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also ensure that when a user signs up with a madrasa_name, they get admin role
-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If user created their own madrasa (has madrasa_name in profile), assign admin role
  IF NEW.madrasa_name IS NOT NULL AND NEW.madrasa_name != '' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;