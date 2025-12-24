import PageLayout from "../PageLayout";
import "./LegalPage.css";

function PrivacyPage(): JSX.Element {
  return (
    <PageLayout
      title="Privacy Policy"
      subtitle="Last updated: December 1, 2024"
      breadcrumbs={[{ label: "Legal" }, { label: "Privacy Policy" }]}
    >
      <div className="legal-page">
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              Sacred Vows (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to
              protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our website and services.
            </p>
            <p>
              By using Sacred Vows, you agree to the collection and use of information in accordance
              with this policy. If you do not agree with our policies and practices, please do not
              use our services.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect personal information that you provide directly to us, including:</p>
            <ul>
              <li>Name and email address when you create an account</li>
              <li>Wedding details you add to your invitation (names, date, venue)</li>
              <li>Payment information when you purchase a plan</li>
              <li>Communications with our support team</li>
              <li>Any other information you choose to provide</li>
            </ul>

            <h3>Information Collected Automatically</h3>
            <p>When you use our services, we automatically collect certain information:</p>
            <ul>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and general location</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Personalize your experience and provide content relevant to you</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information only in the
              following circumstances:
            </p>
            <ul>
              <li>
                <strong>With your consent:</strong> We may share information when you direct us to
                do so.
              </li>
              <li>
                <strong>Service providers:</strong> We may share information with third-party
                vendors who perform services on our behalf (payment processing, hosting, analytics).
              </li>
              <li>
                <strong>Legal requirements:</strong> We may disclose information if required by law
                or in response to valid requests by public authorities.
              </li>
              <li>
                <strong>Business transfers:</strong> In connection with any merger, sale, or
                transfer of company assets.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or
              destruction. However, no method of transmission over the Internet is 100% secure, and
              we cannot guarantee absolute security.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services
              and fulfill the purposes described in this policy. We may retain certain information
              as required by law or for legitimate business purposes.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal
              information:
            </p>
            <ul>
              <li>Access and receive a copy of your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>To exercise these rights, please contact us at privacy@sacredvows.com.</p>
          </section>

          <section className="legal-section">
            <h2>8. Children&apos;s Privacy</h2>
            <p>
              Our services are not intended for children under 16 years of age. We do not knowingly
              collect personal information from children under 16. If you believe we have collected
              information from a child, please contact us immediately.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. International Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place to protect your information in
              accordance with this privacy policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the &quot;Last updated&quot; date.
              Your continued use of our services after any changes indicates your acceptance of the
              updated policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <div className="contact-info">
              <p>
                <strong>Email:</strong> privacy@sacredvows.com
              </p>
              <p>
                <strong>Address:</strong> 123 Love Lane, Suite 100, San Francisco, CA 94102
              </p>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}

export default PrivacyPage;
