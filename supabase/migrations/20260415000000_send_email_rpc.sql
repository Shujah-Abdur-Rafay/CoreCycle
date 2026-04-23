-- ─────────────────────────────────────────────────────────────────────────────
-- send_email RPC — calls Resend API via pg_net (no Edge Function required)
-- Prerequisites:
--   1. Add secret named "RESEND_API_KEY" in Supabase Dashboard → Secrets
--   2. Run this migration in Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable pg_net (built-in on all Supabase projects)
create extension if not exists pg_net with schema extensions;

-- ─── Main send_email function ─────────────────────────────────────────────────
create or replace function public.send_email(
  recipient  text,
  subject    text,
  html_body  text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  api_key    text;
  request_id bigint;
begin
  -- Read API key from Supabase Vault (Dashboard → Secrets → "RESEND_API_KEY")
  select decrypted_secret
    into api_key
    from vault.decrypted_secrets
   where name = 'RESEND_API_KEY'
   limit 1;

  if api_key is null then
    return jsonb_build_object(
      'success', false,
      'error',   'RESEND_API_KEY not found. Add it in Supabase Dashboard → Secrets.'
    );
  end if;

  -- POST to Resend API (pg_net is async — returns a request ID immediately)
  select extensions.http_post(
    url     := 'https://api.resend.com/emails',
    body    := jsonb_build_object(
      'from',    'OntreCycle LMS <noreply@OntreCycle.com>',
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

-- Allow both authenticated users and anon (public) to call this function
grant execute on function public.send_email(text, text, text) to authenticated, anon;
