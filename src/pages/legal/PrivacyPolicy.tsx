import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";

const sections: LegalSection[] = [
  {
    id: "introduction",
    heading: "1. Introduction",
    content: (
      <p>
        Jimi Juwape Solutions Limited, operating <strong>OntRecycle.com</strong>, is committed to protecting your
        personal information and respecting your privacy. This Privacy Policy explains what personal information we
        collect, why we collect it, how we use and protect it, and what rights you have. We handle personal information
        in accordance with Canada&rsquo;s <em>Personal Information Protection and Electronic Documents Act (PIPEDA)</em>.
      </p>
    ),
  },
  {
    id: "information-collected",
    heading: "2. Personal Information We Collect",
    content: (
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Information Collected</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Account &amp; Identity</td><td>Full name, email address, phone number (if provided), username, encrypted password</td></tr>
          <tr><td>Business / Organization</td><td>Business name, business address or municipality (Ontario), job title or role</td></tr>
          <tr><td>Training Records</td><td>Courses enrolled, progress, completion status, quiz scores, certificate records</td></tr>
          <tr><td>Platform Activity</td><td>Login timestamps, IP address, browser type, pages visited, policy acceptance records</td></tr>
          <tr><td>Communications</td><td>Support requests, feedback messages</td></tr>
        </tbody>
      </table>
    ),
  },
  {
    id: "why-collected",
    heading: "3. Why We Collect This Information",
    content: (
      <table>
        <thead>
          <tr><th>Purpose</th><th>Information Used</th></tr>
        </thead>
        <tbody>
          <tr><td>Account creation &amp; authentication</td><td>Name, email, password</td></tr>
          <tr><td>Course delivery &amp; progress tracking</td><td>Enrolment records, progress, quiz results</td></tr>
          <tr><td>Certificate issuance</td><td>Name, course name, date, score</td></tr>
          <tr><td>Platform security &amp; fraud prevention</td><td>IP address, login activity</td></tr>
          <tr><td>Analytics &amp; platform improvement</td><td>Aggregated usage data</td></tr>
          <tr><td>Business administrator reporting</td><td>Employee training records (within same account)</td></tr>
          <tr><td>Consent &amp; policy record-keeping</td><td>Accepted policy version, date/time, IP address</td></tr>
          <tr><td>Legal &amp; regulatory record-keeping</td><td>As required by applicable law</td></tr>
        </tbody>
      </table>
    ),
  },
  {
    id: "consent",
    heading: "4. Legal Basis and Consent",
    content: (
      <p>
        We collect personal information with your knowledge and consent, given when you create an account and accept
        these policies. Consent is implied for information necessary to provide services you have requested. You may
        withdraw consent at any time by contacting{" "}
        <a href="mailto:privacy@ontrecycle.com">privacy@ontrecycle.com</a>. Withdrawal may affect our ability to
        provide services to you.
      </p>
    ),
  },
  {
    id: "storage-protection",
    heading: "5. How We Store and Protect Your Information",
    content: (
      <>
        <h3>5.1 Security Measures</h3>
        <p>We use industry-standard safeguards including:</p>
        <ul>
          <li>Encrypted transmission (HTTPS/TLS)</li>
          <li>Encrypted storage of passwords (salted hashing)</li>
          <li>Access controls limiting who can view personal data</li>
          <li>Regular security reviews and monitoring</li>
        </ul>
        <h3>5.2 Cloud Storage</h3>
        <p>
          OntRecycle uses cloud-based hosting services that may store data outside of Canada, including in the United
          States. We ensure any such providers maintain adequate data protection standards and have data processing
          agreements in place where required.
        </p>
        <h3>5.3 Data Retention</h3>
        <table>
          <thead><tr><th>Data Type</th><th>Retention Period</th></tr></thead>
          <tbody>
            <tr><td>Account information</td><td>Duration of account + 2 years after deletion</td></tr>
            <tr><td>Training &amp; completion records</td><td>5 years from date of completion</td></tr>
            <tr><td>Certificate records</td><td>7 years from date of issuance</td></tr>
            <tr><td>Login &amp; activity logs</td><td>12 months</td></tr>
            <tr><td>Policy acceptance records</td><td>7 years</td></tr>
            <tr><td>Support communications</td><td>2 years</td></tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: "admin-access",
    heading: "6. Business Administrator Access",
    content: (
      <p>
        Business administrators may access employee names, roles, course enrolment, progress, quiz scores, and
        certificate records &mdash; for legitimate training management only. Administrators cannot access passwords or
        personal email correspondence.
      </p>
    ),
  },
  {
    id: "your-rights",
    heading: "7. Your Privacy Rights",
    content: (
      <>
        <p>Under PIPEDA and applicable Ontario privacy law, you have the right to:</p>
        <ul>
          <li><strong>Access</strong> &mdash; Request a copy of the personal information we hold about you</li>
          <li><strong>Correction</strong> &mdash; Ask us to correct inaccurate or incomplete information</li>
          <li><strong>Deletion</strong> &mdash; Request deletion of your personal information, subject to legal retention requirements</li>
          <li><strong>Withdrawal of Consent</strong> &mdash; Withdraw consent to our collection and use of your information</li>
          <li><strong>Complaint</strong> &mdash; File a complaint with the Office of the Privacy Commissioner of Canada (<a href="https://www.priv.gc.ca">www.priv.gc.ca</a>)</li>
        </ul>
        <p>
          Submit requests at <a href="https://www.ontrecycle.com/data-request">www.ontrecycle.com/data-request</a> or email{" "}
          <a href="mailto:privacy@ontrecycle.com">privacy@ontrecycle.com</a>. We respond to verified requests within 30 days.
        </p>
      </>
    ),
  },
  {
    id: "data-sharing",
    heading: "8. Data Sharing",
    content: (
      <p>
        We share data only with trusted service providers (cloud hosting, email delivery, analytics) under data
        processing agreements. We may disclose information as required by law or court order. We do not sell, rent, or
        trade your personal information to any third party.
      </p>
    ),
  },
  {
    id: "children",
    heading: "9. Children and Minors",
    content: (
      <p>
        OntRecycle is not directed at children under 16. We do not knowingly collect personal information from
        individuals under 16 without parental consent. Contact{" "}
        <a href="mailto:privacy@ontrecycle.com">privacy@ontrecycle.com</a> to report any concern.
      </p>
    ),
  },
  {
    id: "breach",
    heading: "10. Privacy Breach Notification",
    content: (
      <p>
        In the event of a breach creating real risk of significant harm, we will notify affected users and the Office
        of the Privacy Commissioner of Canada as required under PIPEDA, and take immediate containment steps.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "11. Contact — Privacy Requests",
    content: (
      <>
        <p>
          <strong>Privacy Officer &mdash; Jimi Juwape Solutions Limited / OntRecycle</strong>
        </p>
        <ul>
          <li>Email: <a href="mailto:privacy@ontrecycle.com">privacy@ontrecycle.com</a></li>
          <li>Data Request Form: <a href="https://www.ontrecycle.com/data-request">www.ontrecycle.com/data-request</a></li>
          <li>Office of the Privacy Commissioner of Canada: <a href="https://www.priv.gc.ca">www.priv.gc.ca</a> &middot; 1-800-282-1376</li>
        </ul>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalDocument
      title="Privacy Policy"
      version="1.0"
      effectiveDate="June 1, 2025"
      badges={["PIPEDA Compliant"]}
      intro={
        <p>
          We respect your privacy and are committed to protecting your personal information. This policy explains
          what we collect, how we use it, and the rights you have under Canadian privacy law.
        </p>
      }
      sections={sections}
      related={[
        { label: "Terms of Service", to: "/terms-of-service" },
        { label: "Cookie Policy", to: "/cookie-policy" },
        { label: "Acceptable Use Policy", to: "/acceptable-use-policy" },
      ]}
    />
  );
}
