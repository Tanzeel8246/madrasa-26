-- Update the handle_new_user trigger to save madrasa_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending_role app_role;
BEGIN
  -- Insert profile with madrasa_name
  INSERT INTO public.profiles (id, full_name, madrasa_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'madrasa_name'
  );
  
  -- Check if there's a pending role for this email
  SELECT role INTO pending_role
  FROM public.pending_user_roles
  WHERE email = NEW.email;
  
  -- Assign the role (pending role if exists, otherwise admin)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(pending_role, 'admin'::app_role));
  
  -- Delete the pending role record if it exists
  IF pending_role IS NOT NULL THEN
    DELETE FROM public.pending_user_roles WHERE email = NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;