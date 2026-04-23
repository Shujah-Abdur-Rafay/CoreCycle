-- Fix: use positional args + explicit casts for net.http_post
-- Named parameters caused type-inference failure on the url literal

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

  -- Positional args with explicit casts — avoids type-inference issues
  select net.http_post(
    'https://api.resend.com/emails'::text,
    jsonb_build_object(
      'from',    'OntreCycle LMS <onboarding@resend.dev>',
      'to',      jsonb_build_array(recipient),
      'subject', subject,
      'html',    html_body
    )::text,
    NULL::jsonb,
    jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type',  'application/json'
    )::jsonb
  ) into request_id;

  return jsonb_build_object('success', true, 'request_id', request_id);

exception when others then
  return jsonb_build_object('success', false, 'error', sqlerrm);
end;
$$;

grant execute on function public.send_email(text, text, text) to authenticated, anon;
