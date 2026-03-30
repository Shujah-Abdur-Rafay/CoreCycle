
-- Create or replace function to handle new user signup with auto-approval for individuals
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_type text;
BEGIN
  -- Get user_type from the profile (created by another trigger)
  SELECT user_type INTO _user_type
  FROM public.profiles
  WHERE user_id = NEW.id;

  -- Insert user role with auto-approval for individuals
  INSERT INTO public.user_roles (user_id, role, is_approved, approved_at)
  VALUES (
    NEW.id,
    'learner',
    COALESCE(_user_type = 'individual', false),
    CASE WHEN COALESCE(_user_type = 'individual', false) THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

-- Create trigger to run after profile is created
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();
