-- Fix: net.http_post body must be jsonb, not text
-- Previous migration incorrectly cast body to ::text causing
-- "function net.http_post(text, text, jsonb, jsonb) does not exist"

drop function if exists public.send_email(text, text, text);

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
  select value into api_key
  from public.app_secrets
  where name = 'resend_api_key';

  if api_key is null then
    return jsonb_build_object('success', false, 'error', 'resend_api_key not found in app_secrets');
  end if;

  -- body stays as jsonb — net.http_post(url text, body jsonb, params jsonb, headers jsonb)
  select net.http_post(
    'https://api.resend.com/emails'::text,
    jsonb_build_object(
      'from',    'OntreCycle LMS <noreply@ontrecycle.ca>',
      'to',      jsonb_build_array(recipient),
      'subject', subject,
      'html',    html_body
    ),
    '{}'::jsonb,
    jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type',  'application/json'
    )
  ) into request_id;

  return jsonb_build_object('success', true, 'request_id', request_id);

exception when others then
  return jsonb_build_object('success', false, 'error', sqlerrm);
end;
$$;

grant execute on function public.send_email(text, text, text) to authenticated, anon;
