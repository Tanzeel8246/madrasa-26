-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can create notifications
CREATE POLICY "Admins can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add status column to pending_user_roles
ALTER TABLE public.pending_user_roles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Add notification_sent column
ALTER TABLE public.pending_user_roles 
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;

-- Create function to send notification when role is assigned
CREATE OR REPLACE FUNCTION notify_role_assignment()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Check if this is for an existing user (has user_id in auth.users)
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = NEW.email;
  
  IF target_user_id IS NOT NULL THEN
    -- Create notification for existing user
    notification_title := 'نیا رول اسائنمنٹ';
    notification_message := 'آپ کو ' || NEW.role || ' کا رول تفویض کیا گیا ہے';
    
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      target_user_id,
      'role_assignment',
      notification_title,
      notification_message,
      jsonb_build_object(
        'pending_role_id', NEW.id,
        'role', NEW.role,
        'email', NEW.email
      )
    );
    
    -- Mark notification as sent
    NEW.notification_sent := TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role assignment notifications
DROP TRIGGER IF EXISTS on_role_assignment ON public.pending_user_roles;
CREATE TRIGGER on_role_assignment
  AFTER INSERT ON public.pending_user_roles
  FOR EACH ROW
  EXECUTE FUNCTION notify_role_assignment();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Add trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();