import PageLayout from "../PageLayout";
import "./LegalPage.css";

function TermsPage(): JSX.Element {
  return (
    <PageLayout
      title="Terms of Service"
      subtitle="Last updated: December 1, 2024"
      breadcrumbs={[{ label: "Legal" }, { label: "Terms of Service" }]}
    >
      <div className="legal-page">
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using Sacred Vows (&quot;the Service&quot;), you agree to be bound by
              these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these
              terms, you may not access the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Description of Service</h2>
            <p>
              Sacred Vows provides a digital platform for creating, customizing, and sharing wedding
              invitations. Our services include:
            </p>
            <ul>
              <li>Wedding invitation layouts and customization tools</li>
              <li>Guest management and RSVP tracking</li>
              <li>Invitation sharing and analytics</li>
              <li>Premium features for paid subscribers</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. User Accounts</h2>
            <h3>Account Registration</h3>
            <p>
              To use certain features of the Service, you must register for an account. You agree to
              provide accurate, current, and complete information during registration and to update
              such information as necessary.
            </p>
            <h3>Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You agree to notify us
              immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. User Content</h2>
            <h3>Your Content</h3>
            <p>
              You retain ownership of any content you create, upload, or share through the Service
              (&quot;User Content&quot;). By using our Service, you grant us a non-exclusive,
              royalty-free license to use, display, and distribute your User Content solely for the
              purpose of providing the Service.
            </p>
            <h3>Content Guidelines</h3>
            <p>You agree not to upload or share content that:</p>
            <ul>
              <li>Violates any laws or regulations</li>
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains hateful, discriminatory, or harmful content</li>
              <li>Contains malicious code or viruses</li>
              <li>Is false, misleading, or deceptive</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Payment Terms</h2>
            <h3>Pricing</h3>
            <p>
              Certain features of the Service require payment. Current prices are displayed on our
              pricing page. We reserve the right to change prices at any time, but changes will not
              affect existing purchases.
            </p>
            <h3>Billing</h3>
            <p>
              Premium plans are one-time purchases. By purchasing a plan, you agree to pay the
              applicable fees. All payments are processed securely through our payment providers.
            </p>
            <h3>Refunds</h3>
            <p>
              We offer a 30-day money-back guarantee for paid plans. If you are not satisfied with
              your purchase, contact us within 30 days for a full refund.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Sacred
              Vows and are protected by international copyright, trademark, and other intellectual
              property laws. Our layouts, designs, and branding remain our exclusive property.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Resell or redistribute our layouts or services</li>
              <li>Remove any copyright or proprietary notices</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately,
              without prior notice, for any reason, including breach of these Terms. Upon
              termination, your right to use the Service will cease immediately.
            </p>
            <p>
              You may terminate your account at any time by contacting us. Upon termination, your
              data may be deleted according to our data retention policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              ERROR-FREE, OR COMPLETELY SECURE.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Limitation of Liability</h2>
            <p>
              IN NO EVENT SHALL SACRED VOWS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, ARISING
              FROM OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Sacred Vows and its affiliates from any
              claims, damages, or expenses arising from your use of the Service or violation of
              these Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              State of California, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of
              significant changes via email or through the Service. Continued use of the Service
              after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <div className="contact-info">
              <p>
                <strong>Email:</strong> legal@sacredvows.com
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

export default TermsPage;
