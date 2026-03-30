const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const FROM_EMAIL = 'noreply@corecycle.com';
const FROM_NAME = 'Corecycle LMS';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

class EmailService {
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const { to, subject, html, text } = options;
    const recipients = Array.isArray(to) ? to : [to];

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(BREVO_API_URL, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': BREVO_API_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: FROM_NAME, email: FROM_EMAIL },
            to: recipients.map(email => ({ email })),
            subject,
            htmlContent: html,
            textContent: text || this.stripHtml(html),
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Brevo API error: ${error}`);
        }

        const result = await response.json();
        console.log(`[EmailService] Email sent to ${recipients.join(', ')}`);
        
        return {
          success: true,
          messageId: result.messageId,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error(`[EmailService] Attempt ${attempt} failed:`, error);
        if (attempt === 3) {
          return {
            success: false,
            error: (error as Error).message,
            timestamp: new Date(),
          };
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }

    return {
      success: false,
      error: 'All retry attempts failed',
      timestamp: new Date(),
    };
  }

  async sendBulkEmails(emails: EmailOptions[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    return results;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async verifyConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.brevo.com/v3/account', {
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getStatus() {
    return {
      configured: !!BREVO_API_KEY,
      provider: 'Brevo',
      from: FROM_EMAIL,
    };
  }
}

export const emailService = new EmailService();

export async function sendEmail(to: string | string[], subject: string, html: string): Promise<EmailResult> {
  return emailService.sendEmail({ to, subject, html });
}

export async function verifyEmailService(): Promise<boolean> {
  return emailService.verifyConnection();
}

export function getEmailServiceStatus() {
  return emailService.getStatus();
}

export default emailService;
