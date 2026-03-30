-- Add RLS policy for super admins to view all quiz questions (including those from unpublished courses)
CREATE POLICY "Super admins can view all quiz questions" 
ON public.quiz_questions 
FOR SELECT 
USING (is_super_admin(auth.uid()));