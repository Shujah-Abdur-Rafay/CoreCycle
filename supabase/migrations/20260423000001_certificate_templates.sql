-- Certificate Templates: reusable visual templates for course completion certificates
create table if not exists public.certificate_templates (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  header_text           text not null default 'Certificate of Completion',
  provider_name         text,
  background_color      text not null default '#f0fdf4',
  background_url        text,
  logo_url              text,
  style_config          jsonb not null default '{}'::jsonb,
  created_by            uuid references auth.users(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- One active template per course (UNIQUE on course_id enforces this)
create table if not exists public.course_certificate_map (
  id                       uuid primary key default gen_random_uuid(),
  course_id                uuid not null references public.courses(id) on delete cascade,
  certificate_template_id  uuid not null references public.certificate_templates(id) on delete cascade,
  created_by               uuid references auth.users(id) on delete set null,
  created_at               timestamptz not null default now(),
  constraint uq_course_certificate unique (course_id)
);

-- Indexes for efficient lookup
create index if not exists idx_course_certificate_map_course_id
  on public.course_certificate_map(course_id);

create index if not exists idx_course_certificate_map_template_id
  on public.course_certificate_map(certificate_template_id);

-- Auto-update updated_at on template edits
create or replace function public.set_certificate_template_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_certificate_templates_updated_at
  before update on public.certificate_templates
  for each row execute function public.set_certificate_template_updated_at();

-- Storage bucket for certificate assets (backgrounds + logos)
insert into storage.buckets (id, name, public)
values ('certificate-assets', 'certificate-assets', true)
on conflict (id) do nothing;

-- Allow super admins to upload/delete assets
create policy "super_admins_upload_certificate_assets"
  on storage.objects for insert
  with check (
    bucket_id = 'certificate-assets'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role = 'super_admin'
    )
  );

create policy "super_admins_delete_certificate_assets"
  on storage.objects for delete
  using (
    bucket_id = 'certificate-assets'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role = 'super_admin'
    )
  );

-- Public read for certificate assets (rendered on certificates)
create policy "public_read_certificate_assets"
  on storage.objects for select
  using (bucket_id = 'certificate-assets');

-- RLS
alter table public.certificate_templates enable row level security;
alter table public.course_certificate_map enable row level security;

-- Super admins: full CRUD on templates
create policy "super_admins_manage_certificate_templates"
  on public.certificate_templates
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role = 'super_admin'
    )
  );

-- All authenticated users can read published templates (for rendering certificates)
create policy "authenticated_read_certificate_templates"
  on public.certificate_templates
  for select
  using (auth.uid() is not null);

-- Super admins: full CRUD on course-template mapping
create policy "super_admins_manage_course_certificate_map"
  on public.course_certificate_map
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role = 'super_admin'
    )
  );

-- All authenticated users can read course-template mappings
create policy "authenticated_read_course_certificate_map"
  on public.course_certificate_map
  for select
  using (auth.uid() is not null);
