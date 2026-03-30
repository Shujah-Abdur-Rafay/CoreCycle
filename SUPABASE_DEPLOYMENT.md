# Supabase Edge Functions Deployment Guide

## Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Supabase project linked: `supabase link --project-ref YOUR_PROJECT_REF`

## Environment Variables

Set these secrets in your Supabase project:

```bash
supabase secrets set BREVO_API_KEY=your_brevo_api_key_here
supabase secrets set BASE_URL=https://your-app-url.com
```

## Deploy Functions

Deploy all email functions:

```bash
# Deploy welcome email function
supabase functions deploy send-welcome-email

# Deploy course allocation email function
supabase functions deploy send-course-allocation

# Deploy course completion email function
supabase functions deploy send-course-completion
```

Or deploy all at once:

```bash
supabase functions deploy
```

## Apply Database Migrations

Run the email triggers migration:

```bash
supabase db push
```

Or apply specific migration:

```bash
supabase migration up
```

## Verify Deployment

1. Check function logs:
```bash
supabase functions logs send-welcome-email
supabase functions logs send-course-allocation
supabase functions logs send-course-completion
```

2. Test manually:
```bash
supabase functions invoke send-welcome-email --data '{"record":{"id":"test-user-id","email":"test@example.com"}}'
```

## Automated Email Triggers

Once deployed, emails will be sent automatically:

- **Welcome Email**: Sent when a new user signs up
- **Course Allocation Email**: Sent when a course is assigned to a user
- **Course Completion Email**: Sent when a user completes a course

## Troubleshooting

- Check function logs for errors
- Verify BREVO_API_KEY is set correctly
- Ensure BASE_URL points to your production app
- Check Supabase dashboard for function invocation history
