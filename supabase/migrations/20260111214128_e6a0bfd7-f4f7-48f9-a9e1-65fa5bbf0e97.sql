-- Add RLS policy for super admins to view all modules (including those from unpublished courses)
CREATE POLICY "Super admins can view all modules" 
ON public.modules 
FOR SELECT 
USING (is_super_admin(auth.uid()));