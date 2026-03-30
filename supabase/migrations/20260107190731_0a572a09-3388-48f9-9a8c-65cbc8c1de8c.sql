-- Allow super admins to view all profiles
CREATE POLICY "Super admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- Allow super admins to update all profiles
CREATE POLICY "Super admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.is_super_admin(auth.uid()));

-- Create admin_reports table for generated reports
CREATE TABLE public.admin_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL CHECK (report_type IN ('training_summary', 'compliance', 'user_activity', 'certificate_audit')),
  title TEXT NOT NULL,
  generated_by UUID NOT NULL,
  date_range_start DATE,
  date_range_end DATE,
  filters JSONB DEFAULT '{}',
  report_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage reports"
ON public.admin_reports FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Producers can view reports"
ON public.admin_reports FOR SELECT
USING (public.has_report_access(auth.uid()));