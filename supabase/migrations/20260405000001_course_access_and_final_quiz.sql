-- ─── Task 1: Course access_type ─────────────────────────────────────────────
-- Add access_type column to courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS access_type text NOT NULL DEFAULT 'public'
  CHECK (access_type IN ('public', 'private', 'allocated_only'));

-- ─── Task 4: Course-level final quiz ────────────────────────────────────────
-- Add final_quiz_id column to courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS final_quiz_id uuid
  REFERENCES public.ai_generated_quizzes(id) ON DELETE SET NULL;

-- ─── RLS: update course visibility policy ────────────────────────────────────
-- Drop old blanket published-only policy (name may vary; use DO block to be safe)
DO $$
BEGIN
  -- Drop any existing SELECT policies on courses so we can replace them
  DROP POLICY IF EXISTS "Published courses are viewable by approved users" ON public.courses;
  DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
  DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
  DROP POLICY IF EXISTS "Learners can view accessible courses" ON public.courses;
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$$;

-- New policy: public courses visible to all approved users;
-- private/allocated_only courses visible only when explicitly allocated.
CREATE POLICY "Courses visible based on access type"
  ON public.courses
  FOR SELECT
  USING (
    is_published = true
    AND (
      access_type = 'public'
      OR user_has_course_access(auth.uid(), id)
    )
  );

-- Super admins can always see all courses (including unpublished)
CREATE POLICY "Super admins can view all courses"
  ON public.courses
  FOR SELECT
  USING (
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'super_admin'
  );

-- Ensure super admins can still insert/update/delete
DROP POLICY IF EXISTS "Super admins can manage courses" ON public.courses;
CREATE POLICY "Super admins can manage courses"
  ON public.courses
  FOR ALL
  USING (
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'super_admin'
  )
  WITH CHECK (
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'super_admin'
  );
