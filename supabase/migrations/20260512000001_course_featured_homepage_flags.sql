-- Add admin-controlled flags for featuring a course and showing it
-- in the "Start Your Journey" section on the public homepage.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS show_on_homepage boolean NOT NULL DEFAULT false;

-- Only one course should appear on the homepage at a time.
CREATE UNIQUE INDEX IF NOT EXISTS courses_one_homepage_idx
  ON public.courses ((1)) WHERE show_on_homepage;

NOTIFY pgrst, 'reload schema';
