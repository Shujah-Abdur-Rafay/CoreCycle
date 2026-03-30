-- Enable pg_net extension for HTTP requests
create extension if not exists pg_net;

-- Trigger: Send welcome email on user signup
create or replace function trigger_welcome_email()
returns trigger as $$
begin
  perform net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
    ),
    body := jsonb_build_object('record', to_jsonb(new))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function trigger_welcome_email();

-- Trigger: Send course allocation email
create or replace function trigger_course_allocation_email()
returns trigger as $$
begin
  perform net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-course-allocation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
    ),
    body := jsonb_build_object('record', to_jsonb(new))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_course_allocation_created
  after insert on course_allocations
  for each row execute function trigger_course_allocation_email();

-- Trigger: Send course completion email
create or replace function trigger_course_completion_email()
returns trigger as $$
begin
  if new.status = 'completed' and (old.status is null or old.status != 'completed') then
    perform net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-course-completion',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := jsonb_build_object('record', to_jsonb(new))
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_enrollment_completed
  after update on enrollments
  for each row execute function trigger_course_completion_email();
