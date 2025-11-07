-- Create a table for pending user roles (assigned before signup)
CREATE TABLE public.pending_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role app_role NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage pending roles
CREATE POLICY "Admins can manage pending roles"
ON public.pending_user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Modify the handle_new_user trigger to assign roles based on pending_user_roles or default to admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending_role app_role;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
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