-- Create a function to assign admin role to new users who create their own madrasa
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_madrasa text;
BEGIN
  -- Get the madrasa_name from the newly created profile
  SELECT madrasa_name INTO profile_madrasa
  FROM public.profiles
  WHERE id = NEW.id;
  
  -- If user created their own madrasa (has madrasa_name in profile), assign admin role
  IF profile_madrasa IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign admin role after profile is created
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();