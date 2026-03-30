-- Create smes table to store SME organizations independently
CREATE TABLE public.smes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sme_id text UNIQUE NOT NULL,
  company_name text NOT NULL,
  municipality text,
  industry_sector text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.smes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Super admins can manage smes" ON public.smes
  FOR ALL USING (is_super_admin(auth.uid()));

CREATE POLICY "Authenticated users can view smes" ON public.smes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Update handle_new_user function to include industry_sector
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, company_name, user_type, sme_id, industry_sector)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'company_name',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'individual'),
    NEW.raw_user_meta_data ->> 'sme_id',
    NEW.raw_user_meta_data ->> 'industry_sector'
  );
  
  INSERT INTO public.user_roles (user_id, role, is_approved)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'user_type' = 'business' THEN 'sme_admin'::public.app_role
      ELSE 'learner'::public.app_role
    END,
    false
  );
  
  RETURN NEW;
END;
$$;