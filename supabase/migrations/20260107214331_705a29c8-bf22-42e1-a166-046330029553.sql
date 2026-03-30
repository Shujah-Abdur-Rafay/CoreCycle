
-- Create quiz_questions table to store actual quiz questions per module
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer_index INTEGER NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Quiz questions are viewable for published courses
CREATE POLICY "Quiz questions viewable for published courses"
ON public.quiz_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = quiz_questions.module_id
    AND c.is_published = true
  )
);

-- Create index for performance
CREATE INDEX idx_quiz_questions_module_id ON public.quiz_questions(module_id);
