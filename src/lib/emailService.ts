// ─── Email Service — transport via Supabase RPC (pg_net → Resend) ─────────────
// No Edge Function or direct browser fetch required — zero CORS issues.
// The API key lives in Supabase Vault (Dashboard → Secrets → RESEND_API_KEY).

import { supabase } from '@/integrations/supabase/client';

// ─── In-memory email log (session-scoped, last 100 entries) ──────────────────

interface EmailLogEntry {
  id: string;
  to: string | string[];
  subject: string;
  success: boolean;
  error?: string;
  timestamp: Date;
}

const emailLog: EmailLogEntry[] = [];

export function getEmailLog(): EmailLogEntry[] {
  return [...emailLog];
}

function logEmail(entry: EmailLogEntry) {
  emailLog.unshift(entry);
  if (emailLog.length > 100) emailLog.pop();
  const status = entry.success ? '✓' : '✗';
  console.log(
    `[EmailService] ${status} ${entry.subject} → ${Array.isArray(entry.to) ? entry.to.join(', ') : entry.to}`
  );
  if (!entry.success) console.error(`[EmailService] Error: ${entry.error}`);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

// ─── EmailService ─────────────────────────────────────────────────────────────

class EmailService {
  /**
   * Send a single email via the send_email Postgres RPC (pg_net → Resend).
   * Retries up to 3 times with exponential backoff on transient failures.
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const { to, subject, html } = options;
    // RPC accepts one recipient — if array supplied take the first address
    const recipient = Array.isArray(to) ? to[0] : to;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { data, error } = await supabase.rpc('send_email', {
          recipient,
          subject,
          html_body: html,
        });

        if (error) throw new Error(error.message);

        // The RPC returns { success: boolean, error?: string, request_id?: number }
        if (data && data.success === false) {
          throw new Error(data.error ?? 'Unknown error from send_email RPC');
        }

        const entry: EmailLogEntry = {
          id: String(data?.request_id ?? crypto.randomUUID()),
          to,
          subject,
          success: true,
          timestamp: new Date(),
        };
        logEmail(entry);

        return { success: true, messageId: String(data?.request_id ?? ''), timestamp: new Date() };
      } catch (err: any) {
        if (attempt === 3) {
          const entry: EmailLogEntry = {
            id: crypto.randomUUID(),
            to,
            subject,
            success: false,
            error: err.message,
            timestamp: new Date(),
          };
          logEmail(entry);
          return { success: false, error: err.message, timestamp: new Date() };
        }
        // Exponential backoff before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    return { success: false, error: 'All retry attempts failed', timestamp: new Date() };
  }

  /**
   * Send multiple emails sequentially with optional delay between sends.
   */
  async sendBulkEmails(emails: EmailOptions[], delayMs = 200): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    for (const email of emails) {
      results.push(await this.sendEmail(email));
      if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
    }
    return results;
  }

  getStatus() {
    return {
      configured: true,
      provider: 'Resend (via pg_net RPC)',
      from: 'noreply@corecycle.com',
    };
  }
}

export const emailService = new EmailService();

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
): Promise<EmailResult> {
  return emailService.sendEmail({ to, subject, html });
}

export function getEmailServiceStatus() {
  return emailService.getStatus();
}

export default emailService;
