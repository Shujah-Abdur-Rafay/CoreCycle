import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";

const sections: LegalSection[] = [
  {
    id: "introduction",
    heading: "1. Introduction and Acceptance",
    content: (
      <>
        <p>
          Welcome to <strong>OntRecycle.com</strong> (the &ldquo;Platform&rdquo;), operated by{" "}
          <strong>Jimi Juwape Solutions Limited</strong> (the &ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo;
          or &ldquo;our&rdquo;), a business licensed to operate the OntRecycle brand in Ontario, Canada.
        </p>
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the OntRecycle platform,
          including all training modules, quizzes, certificates, dashboards, and related features. By creating an
          account, clicking &ldquo;I Agree,&rdquo; or using the Platform, you confirm that you have read, understood,
          and agree to be bound by these Terms. If you do not agree, you must not use the Platform.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    heading: "2. Eligibility",
    content: (
      <>
        <h3>2.1 Individual Users</h3>
        <p>
          You must be at least 16 years of age to use this Platform. If you are between 16 and 18, you should review
          these Terms with a parent or guardian before using the Platform.
        </p>
        <h3>2.2 Business Users and Administrators</h3>
        <p>
          If you are registering on behalf of a business, organization, or employer, you represent that: you have the
          authority to bind that organization to these Terms; the information you provide about your business is
          accurate and current; and you will ensure employees or team members accessing the Platform through your
          account are aware of and comply with these Terms.
        </p>
        <h3>2.3 Ontario Focus</h3>
        <p>
          OntRecycle is designed for users and businesses operating in Ontario, Canada. Regulatory guidance on this
          Platform is specific to Ontario&rsquo;s waste management and Extended Producer Responsibility (EPR)
          framework and may not apply elsewhere.
        </p>
      </>
    ),
  },
  {
    id: "account",
    heading: "3. Account Registration and Responsibility",
    content: (
      <>
        <h3>3.1 Account Creation</h3>
        <p>
          To access training content, quizzes, and certificates, you must create an account by providing accurate,
          complete, and current information including your name, email address, and, where applicable, your business
          name, municipality, and job title or role.
        </p>
        <h3>3.2 Account Security</h3>
        <p>You are responsible for maintaining the confidentiality of your login credentials. You agree to:</p>
        <ul>
          <li>Use a strong, unique password</li>
          <li>Not share your account credentials with others</li>
          <li>
            Notify us immediately at{" "}
            <a href="mailto:privacy@ontrecycle.com">privacy@ontrecycle.com</a> if you suspect unauthorized access to
            your account
          </li>
        </ul>
        <h3>3.3 Accurate Information</h3>
        <p>
          You agree to keep your account information accurate and up to date. Providing false or misleading
          information is a violation of these Terms and may result in account suspension.
        </p>
        <h3>3.4 Business Administrator Accounts</h3>
        <p>
          Business administrators may create and manage employee sub-accounts, view employee training progress, and
          access completion records. Administrators are responsible for the use of the Platform by all users under
          their account.
        </p>
      </>
    ),
  },
  {
    id: "content-use",
    heading: "4. Training Content and Permitted Use",
    content: (
      <>
        <h3>4.1 Educational Purpose</h3>
        <p>All training content on OntRecycle is provided for educational and informational purposes only.</p>
        <h3>4.2 Permitted Use</h3>
        <p>You may use Platform content to:</p>
        <ul>
          <li>Complete recycling training for yourself or your employees</li>
          <li>Support your business&rsquo;s internal recycling education programs</li>
          <li>Prepare for compliance with Ontario&rsquo;s waste reduction and EPR requirements</li>
        </ul>
        <h3>4.3 Restrictions on Content Use</h3>
        <p>You may not:</p>
        <ul>
          <li>Reproduce, republish, or redistribute course content outside the Platform without written permission</li>
          <li>Use training materials for commercial training services offered to third parties</li>
          <li>Modify or create derivative works from the content</li>
          <li>Remove or alter any copyright, trademark, or attribution notices</li>
        </ul>
      </>
    ),
  },
  {
    id: "certificates",
    heading: "5. Certificates of Completion",
    content: (
      <>
        <h3>5.1 Certificate Issuance</h3>
        <p>
          Upon successfully completing a course and any associated quiz with a passing score, eligible users will
          receive a digital Certificate of Completion.
        </p>
        <h3>5.2 What a Certificate Represents</h3>
        <p>
          A certificate confirms that the named individual completed the specified training module on the date shown.
          It does <strong>not</strong>:
        </p>
        <ul>
          <li>Constitute a professional licence, designation, or accreditation</li>
          <li>Guarantee compliance with any Ontario, federal, or municipal regulation</li>
          <li>Replace or substitute for legal, regulatory, or professional advice</li>
          <li>Imply endorsement by any government body, regulator, or industry association</li>
        </ul>
        <h3>5.3 No Legal Compliance Guarantee</h3>
        <p>
          Completing courses on OntRecycle does not guarantee that your business is in compliance with Ontario&rsquo;s{" "}
          <em>Resource Recovery and Circular Economy Act, 2016</em>, or any other applicable regulation. Regulatory
          requirements vary by industry, business size, and municipality. Always seek appropriate professional or
          legal advice for your specific compliance obligations.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    heading: "6. Intellectual Property",
    content: (
      <p>
        All content on the OntRecycle platform is owned by or licensed to Jimi Juwape Solutions Limited and is
        protected by Canadian copyright and intellectual property law. &ldquo;OntRecycle&rdquo; and related marks are
        trademarks of Jimi Juwape Solutions Limited. You may not use our trademarks without our prior written
        permission.
      </p>
    ),
  },
  {
    id: "prohibited-uses",
    heading: "7. Prohibited Uses",
    content: (
      <>
        <p>You agree that you will not:</p>
        <ul>
          <li>Use the Platform for any unlawful purpose or in violation of any applicable Canadian or Ontario law</li>
          <li>Attempt to gain unauthorized access to any part of the Platform or other users&rsquo; accounts</li>
          <li>Upload, transmit, or share any harmful, offensive, discriminatory, defamatory, or illegal content</li>
          <li>Impersonate any person, business, or entity</li>
          <li>Use automated tools to scrape, crawl, or harvest data from the Platform</li>
          <li>Attempt to reverse engineer, decompile, or extract source code from the Platform</li>
          <li>Interfere with the Platform&rsquo;s functionality or other users&rsquo; experience</li>
          <li>Make false claims about completing training or holding certificates not legitimately earned</li>
        </ul>
      </>
    ),
  },
  {
    id: "third-party",
    heading: "8. Third-Party Links and Tools",
    content: (
      <p>
        The Platform may include links to external websites, including the Ontario Ministry of the Environment,
        Conservation and Parks, Resource Productivity &amp; Recovery Authority (RPRA), and Circular Materials Ontario.
        These links are for informational convenience only. We do not control, endorse, or take responsibility for the
        content or availability of any third-party website or service.
      </p>
    ),
  },
  {
    id: "availability",
    heading: "9. Platform Availability and Updates",
    content: (
      <p>
        We aim to provide reliable access to OntRecycle but do not guarantee 100% uptime. We may update, modify, or
        discontinue features at any time. Training content reflects Ontario&rsquo;s recycling and EPR framework as it
        evolves &mdash; always consult official sources or professional advisors for the most current regulatory
        requirements.
      </p>
    ),
  },
  {
    id: "legal-disclaimer",
    heading: "10. Disclaimer of Legal Advice",
    content: (
      <p>
        Nothing on OntRecycle constitutes legal advice. Content is provided for general educational purposes only.
        OntRecycle and Jimi Juwape Solutions Limited are not law firms and do not provide legal, regulatory,
        environmental, or compliance services.
      </p>
    ),
  },
  {
    id: "liability",
    heading: "11. Limitation of Liability",
    content: (
      <>
        <p>To the maximum extent permitted by applicable law:</p>
        <ul>
          <li>
            OntRecycle and Jimi Juwape Solutions Limited are not liable for any indirect, incidental, special,
            consequential, or punitive damages arising out of your use of or inability to use the Platform
          </li>
          <li>Our total liability shall not exceed the amount you paid us in the twelve months preceding any claim</li>
        </ul>
      </>
    ),
  },
  {
    id: "termination",
    heading: "12. Termination and Suspension",
    content: (
      <p>
        You may close your account at any time by contacting{" "}
        <a href="mailto:support@ontrecycle.com">support@ontrecycle.com</a>. We reserve the right to suspend or
        terminate your account, without notice, if you breach these Terms, pose a security or legal risk, or provide
        false or misleading information.
      </p>
    ),
  },
  {
    id: "governing-law",
    heading: "13. Governing Law",
    content: (
      <p>
        These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable
        therein. Any disputes shall be subject to the exclusive jurisdiction of the courts of Ontario.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "14. Contact",
    content: (
      <>
        <p>
          <strong>Jimi Juwape Solutions Limited &mdash; OntRecycle</strong>
        </p>
        <ul>
          <li>
            Email: <a href="mailto:legal@ontrecycle.com">legal@ontrecycle.com</a>
          </li>
          <li>
            Website: <a href="https://www.ontrecycle.com">www.ontrecycle.com</a>
          </li>
          <li>Mailing Address: Ontario, Canada</li>
        </ul>
      </>
    ),
  },
];

export default function TermsOfService() {
  return (
    <LegalDocument
      title="Terms of Service"
      version="1.0"
      effectiveDate="June 1, 2025"
      lastUpdated="June 1, 2025"
      badges={["Ontario Business Law", "LMS Platform"]}
      intro={
        <p>
          These Terms of Service govern your access to and use of the OntRecycle platform. Please read them carefully.
          By creating an account or using the Platform, you accept these Terms and our related policies.
        </p>
      }
      sections={sections}
      related={[
        { label: "Privacy Policy", to: "/privacy-policy" },
        { label: "Cookie Policy", to: "/cookie-policy" },
        { label: "Acceptable Use Policy", to: "/acceptable-use-policy" },
      ]}
    />
  );
}
