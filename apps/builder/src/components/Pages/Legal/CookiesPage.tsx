import PageLayout from '../PageLayout';
import './LegalPage.css';

function CookiesPage(): JSX.Element {
  return (
    <PageLayout
      title="Cookie Policy"
      subtitle="Last updated: December 1, 2024"
      breadcrumbs={[{ label: 'Legal' }, { label: 'Cookie Policy' }]}
    >
      <div className="legal-page">
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit a 
              website. They are widely used to make websites work more efficiently and to 
              provide information to website owners.
            </p>
            <p>
              This Cookie Policy explains how Sacred Vows uses cookies and similar technologies 
              to recognize you when you visit our website.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Types of Cookies We Use</h2>
            
            <h3>Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. They enable 
              core functionality such as security, account authentication, and remembering 
              your preferences. You cannot opt out of these cookies.
            </p>
            <div className="cookie-table">
              <table>
                <thead>
                  <tr>
                    <th>Cookie</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>session_id</td>
                    <td>Maintains your login session</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <td>csrf_token</td>
                    <td>Security protection</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <td>preferences</td>
                    <td>Stores your site preferences</td>
                    <td>1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Analytics Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our website by 
              collecting and reporting information anonymously. This helps us improve our 
              services and user experience.
            </p>
            <div className="cookie-table">
              <table>
                <thead>
                  <tr>
                    <th>Cookie</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>_ga</td>
                    <td>Google Analytics - distinguishes users</td>
                    <td>2 years</td>
                  </tr>
                  <tr>
                    <td>_gid</td>
                    <td>Google Analytics - distinguishes users</td>
                    <td>24 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Functional Cookies</h3>
            <p>
              These cookies enable enhanced functionality and personalization, such as 
              remembering your language preferences or the region you are in.
            </p>

            <h3>Marketing Cookies</h3>
            <p>
              These cookies may be set through our site by advertising partners. They may 
              be used to build a profile of your interests and show you relevant ads on 
              other sites. We currently do not use marketing cookies.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. How to Control Cookies</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can 
              exercise your cookie preferences in the following ways:
            </p>
            <ul>
              <li>
                <strong>Browser Settings:</strong> Most browsers allow you to control cookies 
                through their settings. You can set your browser to block or alert you about 
                cookies.
              </li>
              <li>
                <strong>Cookie Consent:</strong> When you first visit our site, you can choose 
                which types of cookies to accept through our cookie consent banner.
              </li>
              <li>
                <strong>Opt-Out Links:</strong> Some analytics providers offer opt-out mechanisms. 
                For Google Analytics, visit: tools.google.com/dlpage/gaoptout
              </li>
            </ul>
            <p>
              Please note that blocking certain cookies may impact your experience on our 
              website and limit the services we can provide.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Other Tracking Technologies</h2>
            <p>In addition to cookies, we may use other tracking technologies:</p>
            <ul>
              <li>
                <strong>Local Storage:</strong> Similar to cookies but can store larger amounts 
                of data. Used for offline functionality and caching.
              </li>
              <li>
                <strong>Session Storage:</strong> Temporary storage that is cleared when you 
                close your browser.
              </li>
              <li>
                <strong>Pixels/Beacons:</strong> Small invisible images used to track page views 
                and email opens.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Third-Party Cookies</h2>
            <p>
              Some cookies on our site are placed by third parties. These third parties may 
              include analytics providers and payment processors. We do not control these 
              third-party cookies and recommend reviewing their privacy policies:
            </p>
            <ul>
              <li>Google Analytics - privacy.google.com</li>
              <li>Stripe (payments) - stripe.com/privacy</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our 
              practices or for other operational, legal, or regulatory reasons. Please check 
              this page periodically for updates.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> privacy@sacredvows.com</p>
              <p><strong>Address:</strong> 123 Love Lane, Suite 100, San Francisco, CA 94102</p>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}

export default CookiesPage;

