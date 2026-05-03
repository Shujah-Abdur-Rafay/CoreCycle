-- ============================================================
-- User Consent Table
-- Stores one-time consent per user (email/password + OAuth)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_consent (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_given     BOOLEAN     NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_consent_user_id ON public.user_consent(user_id);

-- ── RLS Policies ─────────────────────────────────────────────

CREATE POLICY "Users can view own consent"
  ON public.user_consent FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent"
  ON public.user_consent FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consent"
  ON public.user_consent FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Super admins can audit all consent records
CREATE POLICY "Super admins can view all consent"
  ON public.user_consent FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- ── Auto-update updated_at ────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_user_consent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_consent_updated_at
  BEFORE UPDATE ON public.user_consent
  FOR EACH ROW EXECUTE FUNCTION public.update_user_consent_updated_at();

-- ── Auto-create consent record on new user signup ─────────────
-- Works for both email/password and OAuth (Google) signups

CREATE OR REPLACE FUNCTION public.handle_new_user_consent()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_consent (user_id, consent_given)
  VALUES (NEW.id, false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_consent
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_consent();

-- ── Example query: check consent status during login ──────────
-- SELECT consent_given, consent_timestamp
-- FROM public.user_consent
-- WHERE user_id = auth.uid();
