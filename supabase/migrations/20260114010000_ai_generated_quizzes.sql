-- Create table for AI-generated quizzes
create table if not exists public.ai_generated_quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  source_content text not null,
  source_filename text,
  source_type text, -- 'pdf', 'docx', 'txt', 'manual'
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  num_questions integer not null,
  generated_by uuid references auth.users(id) on delete set null,
  module_id uuid references public.modules(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create table for AI-generated quiz questions
create table if not exists public.ai_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.ai_generated_quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null, -- array of 4 strings
  correct_answer_index integer not null check (correct_answer_index >= 0 and correct_answer_index <= 3),
  explanation text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists ai_generated_quizzes_generated_by_idx on public.ai_generated_quizzes(generated_by);
create index if not exists ai_generated_quizzes_module_id_idx on public.ai_generated_quizzes(module_id);
create index if not exists ai_generated_quizzes_course_id_idx on public.ai_generated_quizzes(course_id);
create index if not exists ai_quiz_questions_quiz_id_idx on public.ai_quiz_questions(quiz_id);

-- RLS
alter table public.ai_generated_quizzes enable row level security;
alter table public.ai_quiz_questions enable row level security;

-- Admin policies (supports all admin roles)
drop policy if exists "super_admin_all_ai_quizzes" on public.ai_generated_quizzes;
create policy "admins_manage_ai_quizzes"
  on public.ai_generated_quizzes
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() 
      and role in ('super_admin', 'producer_admin', 'municipality_admin', 'sme_admin')
    )
  );

drop policy if exists "super_admin_all_ai_quiz_questions" on public.ai_quiz_questions;
create policy "admins_manage_ai_questions"
  on public.ai_quiz_questions
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() 
      and role in ('super_admin', 'producer_admin', 'municipality_admin', 'sme_admin')
    )
  );

-- Learners/authenticated users can read published quizzes
create policy "users_read_published_ai_quizzes"
  on public.ai_generated_quizzes
  for select
  using (
    is_published = true
  );

create policy "users_read_published_ai_quiz_questions"
  on public.ai_quiz_questions
  for select
  using (
    exists (
      select 1 from public.ai_generated_quizzes
      where id = quiz_id
        and is_published = true
    )
  );

-- Function to update updated_at timestamp
create or replace function update_ai_quiz_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger ai_quiz_updated_at_trigger
  before update on public.ai_generated_quizzes
  for each row
  execute function update_ai_quiz_updated_at();
