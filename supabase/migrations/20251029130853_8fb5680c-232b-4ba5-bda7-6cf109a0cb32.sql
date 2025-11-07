-- Create a trigger on auth.users to automatically create profile
-- First, drop the old trigger from profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON public.profiles;

-- Create a new function that will be triggered when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert into profiles with metadata from signup
  INSERT INTO public.profiles (id, full_name, madrasa_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'madrasa_name'
  );
  
  -- If user created their own madrasa (has madrasa_name), assign admin role
  IF NEW.raw_user_meta_data->>'madrasa_name' IS NOT NULL 
     AND NEW.raw_user_meta_data->>'madrasa_name' != '' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();