-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Ensure ai_quiz_questions.options column exists (fixes schema-cache error)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Create ai_generated_quizzes if it somehow does not exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ai_generated_quizzes'
  ) THEN
    CREATE TABLE public.ai_generated_quizzes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      description text,
      source_content text NOT NULL,
      source_filename text,
      source_type text,
      difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
      num_questions integer NOT NULL,
      generated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE,
      course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
      is_published boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;

  -- Create ai_quiz_questions if it somehow does not exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ai_quiz_questions'
  ) THEN
    CREATE TABLE public.ai_quiz_questions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      quiz_id uuid NOT NULL REFERENCES public.ai_generated_quizzes(id) ON DELETE CASCADE,
      question text NOT NULL,
      options jsonb NOT NULL DEFAULT '[]'::jsonb,
      correct_answer_index integer NOT NULL CHECK (correct_answer_index >= 0 AND correct_answer_index <= 3),
      explanation text NOT NULL,
      order_index integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  ELSE
    -- Table exists — add the column if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'ai_quiz_questions'
        AND column_name = 'options'
    ) THEN
      ALTER TABLE public.ai_quiz_questions
        ADD COLUMN options jsonb NOT NULL DEFAULT '[]'::jsonb;
    END IF;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. quiz_attempts — track every AI quiz attempt by a learner
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id      uuid        NOT NULL REFERENCES public.ai_generated_quizzes(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id    uuid        REFERENCES public.courses(id) ON DELETE SET NULL,
  score        integer     NOT NULL CHECK (score >= 0 AND score <= 100),
  passed       boolean     NOT NULL,
  answers      jsonb       NOT NULL DEFAULT '[]'::jsonb,
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quiz_attempts_quiz_id_idx      ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_user_id_idx      ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_course_id_idx    ON public.quiz_attempts(course_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_completed_at_idx ON public.quiz_attempts(completed_at);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_insert_own_quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "users_insert_own_quiz_attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_read_own_quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "users_read_own_quiz_attempts"
  ON public.quiz_attempts FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_all_quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "admins_all_quiz_attempts"
  ON public.quiz_attempts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'producer_admin', 'municipality_admin', 'sme_admin')
    )
  );

-- ─── Reload PostgREST schema cache ──────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
