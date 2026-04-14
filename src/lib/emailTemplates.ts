// ─── Email Template Base ─────────────────────────────────────────────────────

const emailStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f5f5f5;
  }
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  }
  .email-header {
    background: linear-gradient(135deg, #166534 0%, #22c55e 100%);
    padding: 40px 20px;
    text-align: center;
  }
  .email-logo {
    color: #ffffff;
    font-size: 28px;
    font-weight: bold;
    margin: 0;
  }
  .email-body {
    padding: 40px 30px;
  }
  .email-title {
    color: #1a1a1a;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 20px 0;
  }
  .email-text {
    color: #4a4a4a;
    font-size: 16px;
    line-height: 1.6;
    margin: 0 0 20px 0;
  }
  .email-button {
    display: inline-block;
    padding: 14px 32px;
    background-color: #166534;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    margin: 20px 0;
  }
  .email-button:hover {
    background-color: #14532d;
  }
  .email-info-box {
    background-color: #f0fdf4;
    border-left: 4px solid #22c55e;
    padding: 16px;
    margin: 20px 0;
  }
  .email-footer {
    background-color: #f9fafb;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #e5e7eb;
  }
  .email-footer-text {
    color: #6b7280;
    font-size: 14px;
    margin: 5px 0;
  }
  .email-footer-link {
    color: #166534;
    text-decoration: none;
  }
  .email-divider {
    height: 1px;
    background-color: #e5e7eb;
    margin: 30px 0;
  }
  .highlight {
    color: #166534;
    font-weight: 600;
  }
`;

function wrapTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Corecycle</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1 class="email-logo">🌱 Corecycle</h1>
    </div>
    ${content}
    <div class="email-footer">
      <p class="email-footer-text">
        <strong>Corecycle</strong> - Ontario Waste Diversion Academy
      </p>
      <p class="email-footer-text">
        <a href="{{unsubscribeUrl}}" class="email-footer-link">Unsubscribe</a> | 
        <a href="{{helpUrl}}" class="email-footer-link">Help Center</a>
      </p>
      <p class="email-footer-text">
        © ${new Date().getFullYear()} Corecycle. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ─── Welcome Email Template ──────────────────────────────────────────────────

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  loginUrl: string;
  dashboardUrl: string;
}

export function generateWelcomeEmail(data: WelcomeEmailData): string {
  const content = `
    <div class="email-body">
      <h2 class="email-title">Welcome to Corecycle! 🎉</h2>
      
      <p class="email-text">
        Hi <span class="highlight">${data.userName}</span>,
      </p>
      
      <p class="email-text">
        Thank you for joining Corecycle, Ontario's premier waste diversion training platform. 
        We're excited to have you on board!
      </p>
      
      <div class="email-info-box">
        <p class="email-text" style="margin: 0;">
          <strong>Your account has been created:</strong><br>
          Email: ${data.userEmail}
        </p>
      </div>
      
      <p class="email-text">
        You can now access our comprehensive training courses on Ontario's Extended Producer 
        Responsibility (EPR) regulations, recycling best practices, and compliance requirements.
      </p>
      
      <div style="text-align: center;">
        <a href="${data.dashboardUrl}" class="email-button">
          Go to Dashboard
        </a>
      </div>
      
      <div class="email-divider"></div>
      
      <p class="email-text">
        <strong>What's next?</strong>
      </p>
      <ul class="email-text">
        <li>Browse available courses</li>
        <li>Complete your profile</li>
        <li>Start your first training module</li>
        <li>Earn certificates upon completion</li>
      </ul>
      
      <p class="email-text">
        If you have any questions, our support team is here to help.
      </p>
      
      <p class="email-text">
        Best regards,<br>
        <strong>The Corecycle Team</strong>
      </p>
    </div>
  `;
  
  return wrapTemplate(content);
}

// ─── Registration Confirmation Email ─────────────────────────────────────────

export interface RegistrationConfirmationData {
  userName: string;
  userEmail: string;
  userType: string;
  companyName?: string;
  approvalRequired: boolean;
  dashboardUrl: string;
}

export function generateRegistrationConfirmationEmail(
  data: RegistrationConfirmationData
): string {
  const content = `
    <div class="email-body">
      <h2 class="email-title">Registration Confirmed ✅</h2>
      
      <p class="email-text">
        Hi <span class="highlight">${data.userName}</span>,
      </p>
      
      <p class="email-text">
        Your registration with Corecycle has been successfully confirmed!
      </p>
      
      <div class="email-info-box">
        <p class="email-text" style="margin: 0 0 10px 0;">
          <strong>Account Details:</strong>
        </p>
        <p class="email-text" style="margin: 0;">
          Email: ${data.userEmail}<br>
          Account Type: ${data.userType}
          ${data.companyName ? `<br>Company: ${data.companyName}` : ''}
        </p>
      </div>
      
      ${data.approvalRequired ? `
        <p class="email-text">
          <strong>⏳ Approval Pending</strong><br>
          Your account is currently pending approval from our administrators. 
          You'll receive another email once your account has been approved and you can 
          start accessing courses.
        </p>
      ` : `
        <p class="email-text">
          Your account is now active! You can start exploring our training courses 
          and begin your learning journey.
        </p>
        
        <div style="text-align: center;">
          <a href="${data.dashboardUrl}" class="email-button">
            Access Your Dashboard
          </a>
        </div>
      `}
      
      <div class="email-divider"></div>
      
      <p class="email-text">
        <strong>Need help?</strong><br>
        If you have any questions about your registration or account, please don't 
        hesitate to contact our support team.
      </p>
      
      <p class="email-text">
        Best regards,<br>
        <strong>The Corecycle Team</strong>
      </p>
    </div>
  `;
  
  return wrapTemplate(content);
}

// ─── Account Approval Email ──────────────────────────────────────────────────

export interface AccountApprovalData {
  userName: string;
  role: string;
  dashboardUrl: string;
  coursesUrl: string;
}

export function generateAccountApprovalEmail(data: AccountApprovalData): string {
  const content = `
    <div class="email-body">
      <h2 class="email-title">Account Approved! 🎊</h2>
      
      <p class="email-text">
        Hi <span class="highlight">${data.userName}</span>,
      </p>
      
      <p class="email-text">
        Great news! Your Corecycle account has been approved and is now fully active.
      </p>
      
      <div class="email-info-box">
        <p class="email-text" style="margin: 0;">
          <strong>Your Role:</strong> ${data.role}<br>
          You now have full access to all features and courses available for your account type.
        </p>
      </div>
      
      <p class="email-text">
        You can now:
      </p>
      <ul class="email-text">
        <li>Enroll in training courses</li>
        <li>Track your learning progress</li>
        <li>Earn certificates of completion</li>
        <li>Access compliance resources</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${data.coursesUrl}" class="email-button">
          Browse Courses
        </a>
      </div>
      
      <p class="email-text">
        We're excited to support your learning journey in Ontario's waste diversion 
        and recycling regulations.
      </p>
      
      <p class="email-text">
        Best regards,<br>
        <strong>The Corecycle Team</strong>
      </p>
    </div>
  `;
  
  return wrapTemplate(content);
}

// ─── Course Allocation Email ─────────────────────────────────────────────────

export interface CourseAllocationData {
  userName: string;
  courseTitle: string;
  courseDescription?: string;
  allocatedBy: string;
  dueDate?: string;
  courseUrl: string;
  dashboardUrl: string;
}

export function generateCourseAllocationEmail(data: CourseAllocationData): string {
  const content = `
    <div class="email-body">
      <h2 class="email-title">New Course Assigned 📚</h2>
      
      <p class="email-text">
        Hi <span class="highlight">${data.userName}</span>,
      </p>
      
      <p class="email-text">
        A new training course has been assigned to you by ${data.allocatedBy}.
      </p>
      
      <div class="email-info-box">
        <p class="email-text" style="margin: 0 0 10px 0;">
          <strong>${data.courseTitle}</strong>
        </p>
        ${data.courseDescription ? `
          <p class="email-text" style="margin: 0;">
            ${data.courseDescription}
          </p>
        ` : ''}
        ${data.dueDate ? `
          <p class="email-text" style="margin: 10px 0 0 0;">
            <strong>Due Date:</strong> ${data.dueDate}
          </p>
        ` : ''}
      </div>
      
      <p class="email-text">
        This course has been specifically allocated to you as part of your training 
        requirements. Please complete it at your earliest convenience.
      </p>
      
      <div style="text-align: center;">
        <a href="${data.courseUrl}" class="email-button">
          Start Course
        </a>
      </div>
      
      <div class="email-divider"></div>
      
      <p class="email-text">
        <strong>Track Your Progress</strong><br>
        You can view all your assigned courses and track your progress from your dashboard.
      </p>
      
      <p class="email-text" style="text-align: center;">
        <a href="${data.dashboardUrl}" class="email-footer-link">View Dashboard</a>
      </p>
      
      <p class="email-text">
        Best regards,<br>
        <strong>The Corecycle Team</strong>
      </p>
    </div>
  `;
  
  return wrapTemplate(content);
}

// ─── Course Completion Email ─────────────────────────────────────────────────

export interface CourseCompletionData {
  userName: string;
  courseTitle: string;
  completionDate: string;
  certificateUrl: string;
  nextCoursesUrl: string;
}

export function generateCourseCompletionEmail(data: CourseCompletionData): string {
  const content = `
    <div class="email-body">
      <h2 class="email-title">Congratulations! 🎓</h2>
      
      <p class="email-text">
        Hi <span class="highlight">${data.userName}</span>,
      </p>
      
      <p class="email-text">
        Congratulations on successfully completing <strong>${data.courseTitle}</strong>!
      </p>
      
      <div class="email-info-box">
        <p class="email-text" style="margin: 0;">
          <strong>Completion Date:</strong> ${data.completionDate}<br>
          Your certificate of completion is now available for download.
        </p>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.certificateUrl}" class="email-button">
          Download Certificate
        </a>
      </div>
      
      <p class="email-text">
        This certificate demonstrates your understanding of Ontario's waste diversion 
        regulations and best practices. Keep it for your records and compliance documentation.
      </p>
      
      <div class="email-divider"></div>
      
      <p class="email-text">
        <strong>Continue Learning</strong><br>
        Explore more courses to expand your knowledge and stay up-to-date with 
        the latest regulations.
      </p>
      
      <p class="email-text" style="text-align: center;">
        <a href="${data.nextCoursesUrl}" class="email-footer-link">Browse More Courses</a>
      </p>
      
      <p class="email-text">
        Best regards,<br>
        <strong>The Corecycle Team</strong>
      </p>
    </div>
  `;
  
  return wrapTemplate(content);
}

// ─── Password Reset Email ────────────────────────────────────────────────────

export interface PasswordResetData {
  userName: string;
  resetUrl: string;
  expiryTime: string;
}

export function generatePasswordResetEmail(data: PasswordResetData): string {
  const content = `
    <div class="email-body">
      <h2 class="email-title">Password Reset Request 🔐</h2>
      
      <p class="email-text">
        Hi <span class="highlight">${data.userName}</span>,
      </p>
      
      <p class="email-text">
        We received a request to reset your Corecycle account password.
      </p>
      
      <div style="text-align: center;">
        <a href="${data.resetUrl}" class="email-button">
          Reset Password
        </a>
      </div>
      
      <p class="email-text">
        This link will expire in <strong>${data.expiryTime}</strong>. If you didn't 
        request this password reset, you can safely ignore this email.
      </p>
      
      <div class="email-info-box">
        <p class="email-text" style="margin: 0;">
          <strong>Security Tip:</strong> Never share your password with anyone. 
          Corecycle will never ask for your password via email.
        </p>
      </div>
      
      <p class="email-text">
        If you're having trouble with the button above, copy and paste this URL 
        into your browser:
      </p>
      
      <p class="email-text" style="word-break: break-all; color: #166534;">
        ${data.resetUrl}
      </p>
      
      <p class="email-text">
        Best regards,<br>
        <strong>The Corecycle Team</strong>
      </p>
    </div>
  `;
  
  return wrapTemplate(content);
}

// ─── Team Invitation Email ───────────────────────────────────────────────────

export interface TeamInvitationData {
  inviteeName: string;
  inviterName: string;
  companyName: string;
  role: string;
  acceptUrl: string;
  expiryDays: number;
}

// ─── Admin / SME Addition Email ──────────────────────────────────────────────

export interface AdminAdditionData {
  recipientName: string;
  addedByName: string;
  role: string;
  dashboardUrl: string;
  loginUrl: string;
}

export function generateAdminAdditionEmail(data: AdminAdditionData): string {
  const content = `
    <div class="email-body">
      <h2 class="email-title">You've Been Added as ${data.role} 🛡️</h2>

      <p class="email-text">
        Hi <span class="highlight">${data.recipientName}</span>,
      </p>

      <p class="email-text">
        <strong>${data.addedByName}</strong> has granted you <strong>${data.role}</strong>
        access on the Corecycle platform.
      </p>

      <div class="email-info-box">
        <p class="email-text" style="margin: 0;">
          <strong>Your New Role:</strong> ${data.role}<br>
          You now have elevated permissions to manage users, courses, and platform settings.
        </p>
      </div>

      <p class="email-text">
        As a ${data.role}, you can:
      </p>
      <ul class="email-text">
        <li>Manage user accounts and permissions</li>
        <li>Allocate courses to users and organisations</li>
        <li>Access reports and compliance data</li>
        <li>Oversee training programmes</li>
      </ul>

      <div style="text-align: center;">
        <a href="${data.dashboardUrl}" class="email-button">
          Go to Dashboard
        </a>
      </div>

      <p class="email-text">
        If you believe this was done in error, please contact the platform administrator immediately.
      </p>

      <p class="email-text">
        Best regards,<br>
        <strong>The Corecycle Team</strong>
      </p>
    </div>
  `;

  return wrapTemplate(content);
}

export function generateTeamInvitationEmail(data: TeamInvitationData): string {
  const content = `
    <div class="email-body">
      <h2 class="email-title">You're Invited! 💼</h2>
      
      <p class="email-text">
        Hi <span class="highlight">${data.inviteeName}</span>,
      </p>
      
      <p class="email-text">
        <strong>${data.inviterName}</strong> has invited you to join 
        <strong>${data.companyName}</strong> on Corecycle.
      </p>
      
      <div class="email-info-box">
        <p class="email-text" style="margin: 0;">
          <strong>Your Role:</strong> ${data.role}<br>
          Join your team to access training courses and track compliance together.
        </p>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.acceptUrl}" class="email-button">
          Accept Invitation
        </a>
      </div>
      
      <p class="email-text">
        This invitation will expire in <strong>${data.expiryDays} days</strong>. 
        Click the button above to create your account and get started.
      </p>
      
      <p class="email-text">
        <strong>About Corecycle:</strong><br>
        Corecycle is Ontario's leading platform for waste diversion and recycling 
        training. Access comprehensive courses on EPR regulations, compliance 
        requirements, and best practices.
      </p>
      
      <p class="email-text">
        Best regards,<br>
        <strong>The Corecycle Team</strong>
      </p>
    </div>
  `;
  
  return wrapTemplate(content);
}
