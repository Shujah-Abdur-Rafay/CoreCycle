import emailService from './emailService';
import {
  generateWelcomeEmail,
  generateRegistrationConfirmationEmail,
  generateAccountApprovalEmail,
  generateCourseAllocationEmail,
  generateCourseCompletionEmail,
  generatePasswordResetEmail,
  generateTeamInvitationEmail,
  generateAdminAdditionEmail,
  type WelcomeEmailData,
  type RegistrationConfirmationData,
  type AccountApprovalData,
  type CourseAllocationData,
  type CourseCompletionData,
  type PasswordResetData,
  type TeamInvitationData,
  type AdminAdditionData,
} from './emailTemplates';

// ─── Base URLs (from environment) ────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';
const HELP_URL = `${BASE_URL}/help`;
const UNSUBSCRIBE_URL = `${BASE_URL}/unsubscribe`;

/**
 * Replace template placeholders with actual URLs
 */
function injectGlobalUrls(html: string): string {
  return html
    .replace(/{{helpUrl}}/g, HELP_URL)
    .replace(/{{unsubscribeUrl}}/g, UNSUBSCRIBE_URL);
}

// ─── Email Workflows ──────────────────────────────────────────────────────────

/**
 * Send welcome email on user signup
 */
export async function sendWelcomeEmail(data: {
  email: string;
  userName: string;
}) {
  const emailData: WelcomeEmailData = {
    userName: data.userName,
    userEmail: data.email,
    loginUrl: `${BASE_URL}/auth?mode=login`,
    dashboardUrl: `${BASE_URL}/dashboard`,
  };

  const html = injectGlobalUrls(generateWelcomeEmail(emailData));

  return emailService.sendEmail({
    to: data.email,
    subject: 'Welcome to Corecycle! 🎉',
    html,
  });
}

/**
 * Send registration confirmation email
 */
export async function sendRegistrationConfirmationEmail(data: {
  email: string;
  userName: string;
  userType: string;
  companyName?: string;
  approvalRequired: boolean;
}) {
  const emailData: RegistrationConfirmationData = {
    userName: data.userName,
    userEmail: data.email,
    userType: data.userType,
    companyName: data.companyName,
    approvalRequired: data.approvalRequired,
    dashboardUrl: `${BASE_URL}/dashboard`,
  };

  const html = injectGlobalUrls(generateRegistrationConfirmationEmail(emailData));

  return emailService.sendEmail({
    to: data.email,
    subject: 'Registration Confirmed - Corecycle',
    html,
  });
}

/**
 * Send account approval notification
 */
export async function sendAccountApprovalEmail(data: {
  email: string;
  userName: string;
  role: string;
}) {
  const emailData: AccountApprovalData = {
    userName: data.userName,
    role: data.role,
    dashboardUrl: `${BASE_URL}/dashboard`,
    coursesUrl: `${BASE_URL}/courses`,
  };

  const html = injectGlobalUrls(generateAccountApprovalEmail(emailData));

  return emailService.sendEmail({
    to: data.email,
    subject: 'Your Account Has Been Approved! 🎊',
    html,
  });
}

/**
 * Send course allocation notification
 */
export async function sendCourseAllocationEmail(data: {
  email: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  courseDescription?: string;
  allocatedBy: string;
  dueDate?: string;
}) {
  const emailData: CourseAllocationData = {
    userName: data.userName,
    courseTitle: data.courseTitle,
    courseDescription: data.courseDescription,
    allocatedBy: data.allocatedBy,
    dueDate: data.dueDate,
    courseUrl: `${BASE_URL}/course/${data.courseId}`,
    dashboardUrl: `${BASE_URL}/dashboard`,
  };

  const html = injectGlobalUrls(generateCourseAllocationEmail(emailData));

  return emailService.sendEmail({
    to: data.email,
    subject: `New Course Assigned: ${data.courseTitle}`,
    html,
  });
}

/**
 * Send course completion congratulations
 */
export async function sendCourseCompletionEmail(data: {
  email: string;
  userName: string;
  courseTitle: string;
  completionDate: string;
  certificateId: string;
}) {
  const emailData: CourseCompletionData = {
    userName: data.userName,
    courseTitle: data.courseTitle,
    completionDate: data.completionDate,
    certificateUrl: `${BASE_URL}/certificates/${data.certificateId}`,
    nextCoursesUrl: `${BASE_URL}/courses`,
  };

  const html = injectGlobalUrls(generateCourseCompletionEmail(emailData));

  return emailService.sendEmail({
    to: data.email,
    subject: `Congratulations! You completed ${data.courseTitle} 🎓`,
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: {
  email: string;
  userName: string;
  resetToken: string;
  expiryMinutes?: number;
}) {
  const expiryMinutes = data.expiryMinutes || 60;
  const emailData: PasswordResetData = {
    userName: data.userName,
    resetUrl: `${BASE_URL}/reset-password?token=${data.resetToken}`,
    expiryTime: `${expiryMinutes} minutes`,
  };

  const html = injectGlobalUrls(generatePasswordResetEmail(emailData));

  return emailService.sendEmail({
    to: data.email,
    subject: 'Password Reset Request - Corecycle',
    html,
  });
}

/**
 * Send team invitation email
 */
export async function sendTeamInvitationEmail(data: {
  email: string;
  inviteeName: string;
  inviterName: string;
  companyName: string;
  role: string;
  inviteCode: string;
  expiryDays?: number;
}) {
  const expiryDays = data.expiryDays || 7;
  const emailData: TeamInvitationData = {
    inviteeName: data.inviteeName,
    inviterName: data.inviterName,
    companyName: data.companyName,
    role: data.role,
    acceptUrl: `${BASE_URL}/auth?mode=register&invite=${data.inviteCode}`,
    expiryDays,
  };

  const html = injectGlobalUrls(generateTeamInvitationEmail(emailData));

  return emailService.sendEmail({
    to: data.email,
    subject: `You're invited to join ${data.companyName} on Corecycle`,
    html,
  });
}

/**
 * Send notification when a user is promoted to admin or SME admin
 */
export async function sendAdminAdditionEmail(data: {
  email: string;
  recipientName: string;
  addedByName: string;
  role: string;
}) {
  const emailData: AdminAdditionData = {
    recipientName: data.recipientName,
    addedByName: data.addedByName,
    role: data.role,
    dashboardUrl: `${BASE_URL}/dashboard`,
    loginUrl: `${BASE_URL}/auth?mode=login`,
  };

  const html = injectGlobalUrls(generateAdminAdditionEmail(emailData));

  return emailService.sendEmail({
    to: data.email,
    subject: `You've been added as ${data.role} on Corecycle`,
    html,
  });
}

/**
 * Send bulk course allocations (with rate limiting)
 */
export async function sendBulkCourseAllocations(
  allocations: Array<{
    email: string;
    userName: string;
    courseId: string;
    courseTitle: string;
    courseDescription?: string;
    allocatedBy: string;
    dueDate?: string;
  }>
) {
  const emails = allocations.map(allocation => ({
    to: allocation.email,
    subject: `New Course Assigned: ${allocation.courseTitle}`,
    html: injectGlobalUrls(
      generateCourseAllocationEmail({
        userName: allocation.userName,
        courseTitle: allocation.courseTitle,
        courseDescription: allocation.courseDescription,
        allocatedBy: allocation.allocatedBy,
        dueDate: allocation.dueDate,
        courseUrl: `${BASE_URL}/course/${allocation.courseId}`,
        dashboardUrl: `${BASE_URL}/dashboard`,
      })
    ),
  }));

  return emailService.sendBulkEmails(emails, 200);
}

// ─── Export all workflows ─────────────────────────────────────────────────────

export const emailWorkflows = {
  sendWelcomeEmail,
  sendRegistrationConfirmationEmail,
  sendAccountApprovalEmail,
  sendCourseAllocationEmail,
  sendCourseCompletionEmail,
  sendPasswordResetEmail,
  sendTeamInvitationEmail,
  sendAdminAdditionEmail,
  sendBulkCourseAllocations,
};

export default emailWorkflows;
