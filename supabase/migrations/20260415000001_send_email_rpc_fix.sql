-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: replace vault lookup with current_setting (works on all Supabase tiers)
-- Run the two lines below FIRST in SQL Editor, then this whole file.
--
--   alter database postgres set app.resend_api_key to 're_5z1gQ7pF_Bk59fqCDoih6ykwwspPYH1Fs';
--   select pg_reload_conf();
--
-- ─────────────────────────────────────────────────────────────────────────────

-- Ensure pg_net is enabled
create extension if not exists pg_net with schema extensions;

-- Drop old version (had vault dependency)
drop function if exists public.send_email(text, text, text);

-- Recreate using current_setting (reads from ALTER DATABASE config)
create or replace function public.send_email(
  recipient  text,
  subject    text,
  html_body  text
)
returns jsonb
language plpgsql
security definer
set search_path = extensions, public, net
as $$
declare
  api_key    text;
  request_id bigint;
begin
  -- Read API key stored via: ALTER DATABASE postgres SET app.resend_api_key TO '...'
  api_key := current_setting('app.resend_api_key', true);

  if api_key is null or trim(api_key) = '' then
    return jsonb_build_object(
      'success', false,
      'error',   'app.resend_api_key not set. Run: ALTER DATABASE postgres SET app.resend_api_key TO ''your-key'';'
    );
  end if;

  -- Fire HTTP POST to Resend (async via pg_net — returns request ID immediately)
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

-- Grant call access to frontend clients
grant execute on function public.send_email(text, text, text) to authenticated, anon;
