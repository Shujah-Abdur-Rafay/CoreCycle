import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";

const cookieTable = (rows: { name: string; purpose: string; duration: string }[]) => (
  <table>
    <thead><tr><th>Cookie</th><th>Purpose</th><th>Duration</th></tr></thead>
    <tbody>
      {rows.map((r) => (
        <tr key={r.name}>
          <td><code>{r.name}</code></td>
          <td>{r.purpose}</td>
          <td>{r.duration}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const sections: LegalSection[] = [
  {
    id: "what-are-cookies",
    heading: "1. What Are Cookies?",
    content: (
      <p>
        Cookies are small text files placed on your device when you use a website. OntRecycle uses cookies and similar
        technologies to operate the platform, improve your experience, and understand how the Platform is used.
      </p>
    ),
  },
  {
    id: "types",
    heading: "2. Types of Cookies We Use",
    content: (
      <>
        <h3>Essential Cookies — Always Active</h3>
        {cookieTable([
          { name: "session_id", purpose: "Maintains your logged-in session", duration: "Session" },
          { name: "csrf_token", purpose: "Protects against cross-site request forgery", duration: "Session" },
          { name: "consent_version", purpose: "Records which policy version you accepted", duration: "1 year" },
        ])}
        <h3>Authentication Cookies — Always Active</h3>
        {cookieTable([
          { name: "auth_token", purpose: "Authenticates your account login", duration: "30 days or session" },
          { name: "user_role", purpose: "Stores your access role (learner, admin, etc.)", duration: "Session" },
        ])}
        <h3>Functional Cookies — Require Consent</h3>
        {cookieTable([
          { name: "ui_language", purpose: "Remembers your language preference", duration: "1 year" },
          { name: "course_progress_cache", purpose: "Temporarily stores in-progress course state", duration: "7 days" },
          { name: "cookie_preferences", purpose: "Stores your cookie consent choices", duration: "1 year" },
        ])}
        <h3>Analytics Cookies — Require Consent</h3>
        {cookieTable([
          { name: "_ga", purpose: "Google Analytics — tracks platform usage", duration: "2 years" },
          { name: "_ga_[ID]", purpose: "Google Analytics session tracking", duration: "1 year" },
          { name: "_session_analytics", purpose: "Internal session analytics", duration: "30 days" },
        ])}
        <h3>Performance Cookies — Require Consent</h3>
        {cookieTable([
          { name: "perf_monitor", purpose: "Tracks page load times and errors", duration: "Session" },
          { name: "cdn_cache", purpose: "Optimizes content delivery speed", duration: "24 hours" },
        ])}
      </>
    ),
  },
  {
    id: "what-we-dont",
    heading: "3. What We Do Not Use Cookies For",
    content: (
      <>
        <p>We do not use cookies to:</p>
        <ul>
          <li>Serve advertising or targeted marketing</li>
          <li>Track your activity on other websites</li>
          <li>Build advertising profiles</li>
          <li>Sell your data to third parties</li>
        </ul>
      </>
    ),
  },
  {
    id: "managing-preferences",
    heading: "4. Managing Your Cookie Preferences",
    content: (
      <>
        <h3>4.1 Cookie Banner</h3>
        <p>
          When you first visit OntRecycle, you will see a consent banner. You may: <strong>Accept All</strong> &mdash;
          enable all cookie categories; <strong>Accept Essential Only</strong> &mdash; use only required cookies; or{" "}
          <strong>Manage Preferences</strong> &mdash; choose which optional categories to enable.
        </p>
        <h3>4.2 Updating Your Preferences</h3>
        <p>
          Update preferences at any time via{" "}
          <a href="https://www.ontrecycle.com/cookie-policy">www.ontrecycle.com/cookie-policy</a>, or via{" "}
          <strong>Account Settings &gt; Privacy &amp; Cookies</strong> when logged in.
        </p>
        <h3>4.3 Browser-Level Controls</h3>
        <p>
          You may also control cookies through your browser settings. Note that blocking essential cookies will prevent
          the Platform from working properly.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    heading: "5. Contact",
    content: (
      <>
        <p><strong>Cookie &amp; Privacy Inquiries &mdash; OntRecycle</strong></p>
        <ul>
          <li>Email: <a href="mailto:privacy@ontrecycle.com">privacy@ontrecycle.com</a></li>
          <li>Website: <a href="https://www.ontrecycle.com/contact">www.ontrecycle.com/contact</a></li>
        </ul>
      </>
    ),
  },
];

export default function CookiePolicy() {
  return (
    <LegalDocument
      title="Cookie Policy"
      version="1.0"
      effectiveDate="June 1, 2025"
      lastUpdated="June 1, 2025"
      sections={sections}
      intro={
        <p>
          This Cookie Policy explains how OntRecycle uses cookies and similar technologies, what categories we use, and
          how you can control them.
        </p>
      }
      related={[
        { label: "Terms of Service", to: "/terms-of-service" },
        { label: "Privacy Policy", to: "/privacy-policy" },
        { label: "Acceptable Use Policy", to: "/acceptable-use-policy" },
      ]}
    />
  );
}
