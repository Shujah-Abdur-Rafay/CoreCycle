-- Allow super admins to view all enrollments for reporting
CREATE POLICY "Super admins can view all enrollments"
ON public.enrollments
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Allow super admins to view all certificates for reporting
CREATE POLICY "Super admins can view all certificates"
ON public.certificates
FOR SELECT
USING (is_super_admin(auth.uid()));