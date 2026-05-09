import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";

const sections: LegalSection[] = [
  {
    id: "purpose",
    heading: "1. Purpose",
    content: (
      <p>
        This Acceptable Use Policy (&ldquo;AUP&rdquo;) sets out the rules for how you may use OntRecycle.com. It
        supplements our Terms of Service and applies to all users, including individual learners, business employees,
        and business administrators.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    heading: "2. Acceptable Use",
    content: (
      <>
        <p>You may use OntRecycle to:</p>
        <ul>
          <li>Complete recycling education and training courses for yourself or your employees</li>
          <li>Access course materials, quizzes, and certificates for legitimate training purposes</li>
          <li>Download and use provided educational resources for internal workplace training</li>
          <li>Contact us through official support and feedback channels</li>
          <li>Manage employee training records as a business administrator, in accordance with our Privacy Policy</li>
        </ul>
      </>
    ),
  },
  {
    id: "misuse-of-content",
    heading: "3. Misuse of Training Content",
    content: (
      <>
        <p>You must not:</p>
        <ul>
          <li>Redistribute or resell course materials, modules, videos, quizzes, or certificates without written authorization</li>
          <li>Use OntRecycle content to deliver commercial training services to third parties</li>
          <li>Modify, adapt, or create derivative works from platform content without written permission</li>
          <li>Share login credentials to allow others to complete courses or receive certificates under your name</li>
          <li>Complete courses or quizzes on behalf of another person &mdash; all training must reflect genuine participation</li>
        </ul>
      </>
    ),
  },
  {
    id: "certification-integrity",
    heading: "4. Certification Integrity",
    content: (
      <>
        <p>You must not:</p>
        <ul>
          <li>Claim to hold a certificate you did not legitimately earn through completing required courses and assessments</li>
          <li>Misrepresent a certificate as a professional licence, government endorsement, or regulatory compliance approval</li>
          <li>Alter or reproduce any certificate issued by OntRecycle</li>
          <li>Use a certificate in any way that could mislead clients, partners, government bodies, or the public</li>
        </ul>
      </>
    ),
  },
  {
    id: "prohibited-content",
    heading: "5. Prohibited Content",
    content: (
      <>
        <p>You must not upload, share, or transmit:</p>
        <ul>
          <li>Content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or discriminatory</li>
          <li>False or misleading information about yourself, your business, or your regulatory compliance status</li>
          <li>Malware, viruses, ransomware, or any malicious code</li>
          <li>Spam, unsolicited commercial communications, or phishing content</li>
          <li>Any content that infringes the intellectual property, privacy, or other rights of any person or organization</li>
        </ul>
      </>
    ),
  },
  {
    id: "system-security",
    heading: "6. System and Security Abuse",
    content: (
      <>
        <p>You must not:</p>
        <ul>
          <li>Attempt to gain unauthorized access to any part of the Platform, user accounts, or backend systems</li>
          <li>Probe, scan, or test the Platform for vulnerabilities without our prior written consent</li>
          <li>Use automated tools (bots, crawlers, scrapers) to access, collect, or extract content or data</li>
          <li>Attempt to reverse engineer, decompile, or disassemble any part of the Platform or its technology</li>
          <li>Overload or disrupt the Platform through denial-of-service attacks or other means</li>
          <li>Bypass or circumvent any security, authentication, or access control measures</li>
        </ul>
      </>
    ),
  },
  {
    id: "impersonation",
    heading: "7. Impersonation",
    content: (
      <p>
        You must not impersonate any individual, business, or government body; create a false identity or provide
        misleading information in your account profile; or register multiple accounts to bypass restrictions or obtain
        certificates fraudulently.
      </p>
    ),
  },
  {
    id: "unlawful-use",
    heading: "8. Unlawful Use",
    content: (
      <p>
        You must not use OntRecycle for any purpose that violates Canadian federal law, Ontario provincial law, or
        applicable municipal regulations; or in any manner that misrepresents compliance with Ontario&rsquo;s waste
        management or EPR regulations.
      </p>
    ),
  },
  {
    id: "reporting",
    heading: "9. Reporting Violations",
    content: (
      <p>
        Report concerns to{" "}
        <a href="mailto:support@ontrecycle.com?subject=Acceptable%20Use%20Concern">support@ontrecycle.com</a>{" "}
        &mdash; subject line &ldquo;Acceptable Use Concern.&rdquo; We take all reports seriously and will investigate
        in a timely manner.
      </p>
    ),
  },
  {
    id: "consequences",
    heading: "10. Consequences of Violations",
    content: (
      <>
        <p>Violations may result in:</p>
        <ul>
          <li>Immediate account suspension or termination</li>
          <li>Revocation of fraudulently obtained certificates</li>
          <li>Referral to law enforcement</li>
          <li>Legal action to recover damages or enforce our rights</li>
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    heading: "11. Contact",
    content: (
      <>
        <p><strong>OntRecycle &mdash; Support</strong></p>
        <ul>
          <li>Email: <a href="mailto:support@ontrecycle.com">support@ontrecycle.com</a></li>
          <li>Website: <a href="https://www.ontrecycle.com/contact">www.ontrecycle.com/contact</a></li>
        </ul>
      </>
    ),
  },
];

export default function AcceptableUsePolicy() {
  return (
    <LegalDocument
      title="Acceptable Use Policy"
      version="1.0"
      effectiveDate="June 1, 2025"
      lastUpdated="June 1, 2025"
      sections={sections}
      intro={
        <p>
          This policy supplements our Terms of Service and applies to every user of OntRecycle. It defines what is
          permitted, what is prohibited, and the consequences of violations.
        </p>
      }
      related={[
        { label: "Terms of Service", to: "/terms-of-service" },
        { label: "Privacy Policy", to: "/privacy-policy" },
        { label: "Cookie Policy", to: "/cookie-policy" },
      ]}
    />
  );
}
