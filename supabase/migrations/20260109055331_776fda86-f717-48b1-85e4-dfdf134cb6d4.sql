-- Update the handle_new_user function to include sme_id from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, user_type, company_name, industry_sector, other_sector_detail, sme_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'individual'),
    NEW.raw_user_meta_data ->> 'company_name',
    NEW.raw_user_meta_data ->> 'industry_sector',
    NEW.raw_user_meta_data ->> 'other_sector_detail',
    NEW.raw_user_meta_data ->> 'sme_id'
  );
  RETURN NEW;
END;
$function$;