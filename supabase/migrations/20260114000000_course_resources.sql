-- Create course_resources table
create table if not exists public.course_resources (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  resource_type text not null check (resource_type in ('file', 'link')),
  url text not null,
  file_type text null,
  created_at timestamptz not null default now()
);

-- Index for fast lookups by course
create index if not exists course_resources_course_id_idx on public.course_resources(course_id);

-- RLS
alter table public.course_resources enable row level security;

-- Super admins can do everything
create policy "super_admin_all_course_resources"
  on public.course_resources
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'super_admin'
    )
  );

-- Enrolled users (or users with course access) can read resources
create policy "enrolled_users_read_course_resources"
  on public.course_resources
  for select
  using (
    public.user_has_course_access(course_id, auth.uid())
  );
