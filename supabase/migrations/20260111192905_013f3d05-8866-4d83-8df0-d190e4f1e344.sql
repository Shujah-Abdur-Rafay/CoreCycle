-- Add SELECT policy for super admins to view ALL courses (including unpublished)
CREATE POLICY "Super admins can view all courses"
ON public.courses
FOR SELECT
USING (is_super_admin(auth.uid()));