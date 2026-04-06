-- ============================================================
-- 1. Add is_sme_specific flag to courses
-- ============================================================
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS is_sme_specific boolean NOT NULL DEFAULT false;

-- ============================================================
-- 2. RLS: allow sme_admin to read and update their own SME row
-- ============================================================
-- Read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'smes'
      AND policyname = 'sme_admin_read_own_sme'
  ) THEN
    CREATE POLICY sme_admin_read_own_sme ON public.smes
      FOR SELECT TO authenticated
      USING (
        sme_id = (
          SELECT sme_id FROM public.profiles
          WHERE user_id = auth.uid()
          LIMIT 1
        )
      );
  END IF;
END $$;

-- Update
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'smes'
      AND policyname = 'sme_admin_update_own_sme'
  ) THEN
    CREATE POLICY sme_admin_update_own_sme ON public.smes
      FOR UPDATE TO authenticated
      USING (
        sme_id = (
          SELECT sme_id FROM public.profiles
          WHERE user_id = auth.uid()
          LIMIT 1
        )
      )
      WITH CHECK (
        sme_id = (
          SELECT sme_id FROM public.profiles
          WHERE user_id = auth.uid()
          LIMIT 1
        )
      );
  END IF;
END $$;

-- ============================================================
-- 3. RPC: sme_admin can add an existing user (by email) to
--    their own SME.  Runs SECURITY DEFINER so it can update
--    another user's profile row.
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_user_to_my_sme(target_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role   text;
  v_caller_sme_id text;
  v_sme           record;
  v_target        record;
BEGIN
  -- Verify caller is an sme_admin
  SELECT role INTO v_caller_role
    FROM public.user_roles
   WHERE user_id = auth.uid();

  IF v_caller_role IS DISTINCT FROM 'sme_admin' THEN
    RETURN json_build_object('success', false, 'error', 'Only SME admins can add members');
  END IF;

  -- Get caller's sme_id
  SELECT sme_id INTO v_caller_sme_id
    FROM public.profiles
   WHERE user_id = auth.uid()
   LIMIT 1;

  IF v_caller_sme_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Your account is not linked to an SME');
  END IF;

  -- Get SME record for denormalised fields
  SELECT * INTO v_sme FROM public.smes WHERE sme_id = v_caller_sme_id;

  -- Find target user
  SELECT * INTO v_target FROM public.profiles WHERE email = lower(trim(target_email)) LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'No account found with that email address');
  END IF;

  -- Guard: already in a different SME
  IF v_target.sme_id IS NOT NULL AND v_target.sme_id <> v_caller_sme_id THEN
    RETURN json_build_object('success', false, 'error', 'That user is already a member of another organisation');
  END IF;

  -- Guard: already in this SME
  IF v_target.sme_id = v_caller_sme_id THEN
    RETURN json_build_object('success', false, 'error', 'That user is already a member of your organisation');
  END IF;

  -- Link the user
  UPDATE public.profiles
     SET sme_id          = v_caller_sme_id,
         company_name    = v_sme.company_name,
         municipality    = COALESCE(v_target.municipality, v_sme.municipality),
         industry_sector = COALESCE(v_target.industry_sector, v_sme.industry_sector)
   WHERE user_id = v_target.user_id;

  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'user_id',   v_target.user_id,
      'full_name', v_target.full_name,
      'email',     v_target.email
    )
  );
END;
$$;

-- Grant execute to authenticated users (the function itself enforces role checks)
GRANT EXECUTE ON FUNCTION public.add_user_to_my_sme(text) TO authenticated;

NOTIFY pgrst, 'reload schema';
