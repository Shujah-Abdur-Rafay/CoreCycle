import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')!
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, email')
      .eq('id', record.user_id)
      .single()

    const { data: course } = await supabase
      .from('courses')
      .select('title, description')
      .eq('id', record.course_id)
      .single()

    if (!profile || !course) {
      throw new Error('Profile or course not found')
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4">
        <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px 20px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:28px">New Course Assigned!</h1>
          </div>
          <div style="padding:40px 30px">
            <p style="font-size:16px;color:#333;line-height:1.6">Hi ${profile.first_name},</p>
            <p style="font-size:16px;color:#333;line-height:1.6">You have been assigned to a new course:</p>
            <div style="background:#f9fafb;padding:20px;border-radius:6px;margin:20px 0">
              <h2 style="color:#10b981;margin:0 0 10px 0;font-size:20px">${course.title}</h2>
              <p style="color:#6b7280;margin:0;font-size:14px">${course.description || ''}</p>
            </div>
            <p style="font-size:16px;color:#333;line-height:1.6">Start learning now to complete your training requirements.</p>
            <div style="text-align:center;margin:30px 0">
              <a href="${Deno.env.get('BASE_URL')}/courses/${record.course_id}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 30px;text-decoration:none;border-radius:6px;font-weight:600">Start Course</a>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#6b7280">
            <p style="margin:0">© ${new Date().getFullYear()} Corecycle. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Corecycle LMS', email: 'noreply@corecycle.com' },
        to: [{ email: profile.email }],
        subject: `New Course Assigned: ${course.title}`,
        htmlContent: html,
      }),
    })

    if (!response.ok) {
      throw new Error(`Brevo API error: ${await response.text()}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
