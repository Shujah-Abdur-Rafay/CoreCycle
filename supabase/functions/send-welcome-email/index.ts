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
      .select('first_name, last_name')
      .eq('id', record.id)
      .single()

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4">
        <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px 20px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:28px">Welcome to OntreCycle!</h1>
          </div>
          <div style="padding:40px 30px">
            <p style="font-size:16px;color:#333;line-height:1.6">Hi ${profile?.first_name || 'there'},</p>
            <p style="font-size:16px;color:#333;line-height:1.6">Welcome to OntreCycle LMS! Your account has been created successfully.</p>
            <p style="font-size:16px;color:#333;line-height:1.6">You can now log in and start exploring our training courses.</p>
            <div style="text-align:center;margin:30px 0">
              <a href="${Deno.env.get('BASE_URL')}/login" style="display:inline-block;background:#10b981;color:#fff;padding:12px 30px;text-decoration:none;border-radius:6px;font-weight:600">Login Now</a>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#6b7280">
            <p style="margin:0">© ${new Date().getFullYear()} OntreCycle. All rights reserved.</p>
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
        sender: { name: 'OntreCycle LMS', email: 'noreply@OntreCycle.com' },
        to: [{ email: record.email }],
        subject: 'Welcome to OntreCycle!',
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
