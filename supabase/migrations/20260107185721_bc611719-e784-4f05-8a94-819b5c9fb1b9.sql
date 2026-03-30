-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  thumbnail_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create modules table
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  has_quiz BOOLEAN DEFAULT false,
  quiz_pass_mark INTEGER DEFAULT 70,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  UNIQUE(user_id, course_id)
);

-- Create module_completions table
CREATE TABLE public.module_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
  time_spent_minutes INTEGER DEFAULT 0,
  quiz_score INTEGER,
  module_version INTEGER DEFAULT 1,
  UNIQUE(user_id, module_id)
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  learner_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  company_name TEXT,
  sme_id TEXT,
  municipality TEXT,
  producer_program_id TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Courses are publicly readable when published
CREATE POLICY "Published courses are viewable by everyone"
ON public.courses FOR SELECT
USING (is_published = true);

-- Modules are viewable if course is published
CREATE POLICY "Modules are viewable for published courses"
ON public.modules FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = modules.course_id AND courses.is_published = true
));

-- Enrollments policies
CREATE POLICY "Users can view their own enrollments"
ON public.enrollments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments"
ON public.enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments"
ON public.enrollments FOR UPDATE
USING (auth.uid() = user_id);

-- Module completions policies
CREATE POLICY "Users can view their own module completions"
ON public.module_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own module completions"
ON public.module_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module completions"
ON public.module_completions FOR UPDATE
USING (auth.uid() = user_id);

-- Certificates policies
CREATE POLICY "Users can view their own certificates"
ON public.certificates FOR SELECT
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
BEFORE UPDATE ON public.modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the default Ontario training course
INSERT INTO public.courses (id, title, description, short_description, duration_minutes, is_published)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Waste Generation, Recycling, and New Recycling Rules in Ontario',
  'This comprehensive course covers everything SME staff need to know about waste generation, recycling basics, Ontario''s new Extended Producer Responsibility (EPR) rules, and practical actions to reduce contamination.',
  'Learn Ontario recycling rules and best practices for your business',
  60,
  true
);

-- Seed modules for the course
INSERT INTO public.modules (course_id, title, description, content, order_index, duration_minutes, has_quiz) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Waste Generation in Ontario', 'Understanding what waste is and how SMEs generate it', 'Learn about the types of waste generated in Ontario, the difference between garbage, recycling, and organics, and the environmental and cost impacts of poor waste handling.', 1, 12, false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Recycling Basics for SMEs', 'Common recyclable materials and proper separation', 'Discover what materials are commonly recyclable in Ontario, why proper separation matters, and how contamination affects recycling outcomes.', 2, 12, false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'What Has Changed – Ontario''s New Recycling Rules', 'Understanding Extended Producer Responsibility', 'Learn about Ontario''s shift to Extended Producer Responsibility (EPR), what producers are now responsible for, and why SME staff behavior still matters.', 3, 12, false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Practical Actions for SMEs', 'Setting up bins and daily habits', 'Get practical guidance on setting up bins correctly, understanding staff roles and responsibilities, and developing daily habits that reduce contamination.', 4, 12, false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Knowledge Check', 'Final quiz to confirm understanding', 'Complete this quiz to demonstrate your understanding of Ontario waste and recycling practices. A passing score unlocks your certificate.', 5, 12, true);