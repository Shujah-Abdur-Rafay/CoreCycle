-- Fix existing business accounts that don't have sme_id
-- Generate unique SME IDs for profiles with user_type = 'sme_admin' and no sme_id

DO $$
DECLARE
  profile_record RECORD;
  new_sme_id TEXT;
BEGIN
  FOR profile_record IN 
    SELECT user_id, company_name, municipality, industry_sector 
    FROM public.profiles 
    WHERE user_type = 'sme_admin' AND sme_id IS NULL AND company_name IS NOT NULL
  LOOP
    -- Generate unique SME ID
    new_sme_id := 'SME-' || EXTRACT(EPOCH FROM now())::bigint || '-' || UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 5));
    
    -- Update the profile with the new sme_id
    UPDATE public.profiles 
    SET sme_id = new_sme_id 
    WHERE user_id = profile_record.user_id;
    
    -- Create corresponding SME record
    INSERT INTO public.smes (sme_id, company_name, municipality, industry_sector)
    VALUES (new_sme_id, profile_record.company_name, profile_record.municipality, profile_record.industry_sector)
    ON CONFLICT (sme_id) DO NOTHING;
  END LOOP;
END $$;