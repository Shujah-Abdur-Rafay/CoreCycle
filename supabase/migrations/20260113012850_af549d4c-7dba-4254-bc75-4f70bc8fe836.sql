-- Add instructor approval fields to modules table
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS requires_instructor_approval boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_mandatory_for_certification boolean DEFAULT false;

-- Add instructor approval tracking to module_completions table
ALTER TABLE public.module_completions
ADD COLUMN IF NOT EXISTS instructor_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS instructor_approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS instructor_name text,
ADD COLUMN IF NOT EXISTS attendance_confirmed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS attendance_confirmed_at timestamp with time zone;