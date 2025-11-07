-- Add contact information fields to pending_user_roles table
ALTER TABLE public.pending_user_roles 
ADD COLUMN IF NOT EXISTS contact_number text,
ADD COLUMN IF NOT EXISTS contact_email text;

-- Add comment to explain the fields
COMMENT ON COLUMN public.pending_user_roles.contact_number IS 'Contact/mobile number of the user requesting to join';
COMMENT ON COLUMN public.pending_user_roles.contact_email IS 'Contact email for communication with the user';