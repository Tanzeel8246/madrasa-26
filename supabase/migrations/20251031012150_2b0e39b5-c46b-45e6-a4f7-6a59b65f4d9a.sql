-- Drop trigger first, then function
DROP TRIGGER IF EXISTS on_role_assignment ON public.pending_user_roles;
DROP FUNCTION IF EXISTS notify_role_assignment();

CREATE OR REPLACE FUNCTION notify_role_assignment()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Recreate trigger
CREATE TRIGGER on_role_assignment
  AFTER INSERT ON public.pending_user_roles
  FOR EACH ROW
  EXECUTE FUNCTION notify_role_assignment();