
-- Create course allocations table
CREATE TABLE public.course_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  allocation_type text NOT NULL CHECK (allocation_type IN ('user', 'sme')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sme_id text,
  allocated_by uuid NOT NULL,
  allocated_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT valid_allocation CHECK (
    (allocation_type = 'user' AND user_id IS NOT NULL AND sme_id IS NULL) OR
    (allocation_type = 'sme' AND sme_id IS NOT NULL AND user_id IS NULL)
  ),
  UNIQUE(course_id, user_id),
  UNIQUE(course_id, sme_id)
);

-- Enable RLS
ALTER TABLE public.course_allocations ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all allocations
CREATE POLICY "Super admins can manage allocations"
ON public.course_allocations
FOR ALL
USING (is_super_admin(auth.uid()));

-- SME admins can view allocations for their SME
CREATE POLICY "SME admins can view their allocations"
ON public.course_allocations
FOR SELECT
USING (
  sme_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.sme_id = course_allocations.sme_id
  )
);

-- Users can view their own allocations
CREATE POLICY "Users can view own allocations"
ON public.course_allocations
FOR SELECT
USING (auth.uid() = user_id);

-- Function to check if user has access to a course
CREATE OR REPLACE FUNCTION public.user_has_course_access(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Direct user allocation
    SELECT 1 FROM public.course_allocations
    WHERE course_id = _course_id
    AND user_id = _user_id
    AND (expires_at IS NULL OR expires_at > now())
  ) OR EXISTS (
    -- SME allocation
    SELECT 1 FROM public.course_allocations ca
    JOIN public.profiles p ON p.sme_id = ca.sme_id
    WHERE ca.course_id = _course_id
    AND p.user_id = _user_id
    AND (ca.expires_at IS NULL OR ca.expires_at > now())
  ) OR (
    -- Super admins have access to all
    is_super_admin(_user_id)
  );
$$;
