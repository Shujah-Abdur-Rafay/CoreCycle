-- ─────────────────────────────────────────────────────────────────────────────
-- send_email via pg_net — stores API key in app_secrets table (no vault/ALTER needed)
-- Run entirely from Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Config table — RLS blocks all direct access, security definer functions bypass it
create table if not exists public.app_secrets (
  name  text primary key,
  value text not null
);
alter table public.app_secrets enable row level security;
-- No RLS policies = no direct read/write for anon or authenticated roles

-- 2. Store the Resend API key
insert into public.app_secrets (name, value)
values ('resend_api_key', 're_5z1gQ7pF_Bk59fqCDoih6ykwwspPYH1Fs')
on conflict (name) do update set value = excluded.value;

-- 3. Enable pg_net
create extension if not exists pg_net with schema extensions;

-- 4. Drop old versions
drop function if exists public.send_email(text, text, text);

-- 5. Recreate function
create or replace function public.send_email(
  recipient  text,
  subject    text,
  html_body  text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, net
as $$
declare
  api_key    text;
  request_id bigint;
begin
  -- Read key from app_secrets (security definer bypasses RLS)
  select value into api_key
  from public.app_secrets
  where name = 'resend_api_key';

  if api_key is null then
    return jsonb_build_object(
      'success', false,
      'error',   'resend_api_key not found in app_secrets table'
    );
  end if;

  -- Call Resend API via pg_net (server-side, no CORS)
  select net.http_post(
    url     := 'https://api.resend.com/emails',
    body    := jsonb_build_object(
      'from',    'OntreCycle LMS <onboarding@resend.dev>',
      'to',      jsonb_build_array(recipient),
      'subject', subject,
      'html',    html_body
    )::text,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type',  'application/json'
    )
  ) into request_id;

  return jsonb_build_object('success', true, 'request_id', request_id);

exception when others then
  return jsonb_build_object('success', false, 'error', sqlerrm);
end;
$$;

-- Allow frontend clients to call this function
grant execute on function public.send_email(text, text, text) to authenticated, anon;
