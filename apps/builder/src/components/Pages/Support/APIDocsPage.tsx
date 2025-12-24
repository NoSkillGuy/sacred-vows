import { Link } from "react-router-dom";
import PageLayout from "../PageLayout";
import "./APIDocsPage.css";

// SVG Icons
const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 18L22 12L16 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 6L2 12L8 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const KeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21 2L19 4M11.3891 11.6109C12.3844 12.6062 13 13.9812 13 15.5C13 18.5376 10.5376 21 7.5 21C4.46243 21 2 18.5376 2 15.5C2 12.4624 4.46243 10 7.5 10C9.01878 10 10.3938 10.6156 11.3891 11.6109ZM11.3891 11.6109L15 8M15 8L18 11L21 8L18 5L15 8Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WebhookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
    <path d="M6 9V15L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 15V9L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const DatabaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M21 12C21 13.6569 16.9706 15 12 15C7.02944 15 3 13.6569 3 12"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M3 5V19C3 20.6569 7.02944 22 12 22C16.9706 22 21 20.6569 21 19V5"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const endpoints = [
  {
    method: "GET",
    path: "/api/invitations",
    description: "List all invitations for the authenticated user",
  },
  {
    method: "GET",
    path: "/api/invitations/:id",
    description: "Get details of a specific invitation",
  },
  {
    method: "POST",
    path: "/api/invitations",
    description: "Create a new invitation",
  },
  {
    method: "PUT",
    path: "/api/invitations/:id",
    description: "Update an existing invitation",
  },
  {
    method: "GET",
    path: "/api/invitations/:id/rsvps",
    description: "Get all RSVPs for an invitation",
  },
  {
    method: "POST",
    path: "/api/rsvp",
    description: "Submit an RSVP response",
  },
  {
    method: "GET",
    path: "/api/layouts",
    description: "List all available layouts",
  },
  {
    method: "GET",
    path: "/api/analytics/:id",
    description: "Get analytics data for an invitation",
  },
];

const features = [
  {
    icon: <KeyIcon />,
    title: "Authentication",
    description: "Secure API key authentication with role-based access control.",
  },
  {
    icon: <WebhookIcon />,
    title: "Webhooks",
    description: "Real-time notifications for RSVP responses and guest activity.",
  },
  {
    icon: <DatabaseIcon />,
    title: "Data Export",
    description: "Export guest data and analytics in JSON or CSV format.",
  },
  {
    icon: <CodeIcon />,
    title: "SDKs",
    description: "Official SDKs for JavaScript, Python, and more coming soon.",
  },
];

function APIDocsPage() {
  return (
    <PageLayout
      title="API Documentation"
      subtitle="Integrate Sacred Vows with your applications. Build custom experiences for your wedding guests."
      breadcrumbs={[{ label: "Support", path: "/help" }, { label: "API" }]}
    >
      <div className="api-docs-page">
        {/* API Features */}
        <section className="api-features">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Getting Started */}
        <section className="api-section">
          <h2>Getting Started</h2>
          <div className="api-card">
            <h3>Authentication</h3>
            <p>
              All API requests require authentication using an API key. Include your key in the
              request header:
            </p>
            <div className="code-block">
              <code>
                <span className="code-keyword">Authorization:</span> Bearer YOUR_API_KEY
              </code>
            </div>
            <p>
              Generate your API key from the <strong>Settings → API</strong> section in your
              dashboard.
            </p>
          </div>
        </section>

        {/* Base URL */}
        <section className="api-section">
          <h2>Base URL</h2>
          <div className="api-card">
            <p>All API requests should be made to:</p>
            <div className="code-block">
              <code>https://api.sacredvows.com/v1</code>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="api-section">
          <h2>API Endpoints</h2>
          <div className="endpoints-table">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((endpoint, index) => (
                  <tr key={index}>
                    <td>
                      <span className={`method-badge ${endpoint.method.toLowerCase()}`}>
                        {endpoint.method}
                      </span>
                    </td>
                    <td>
                      <code>{endpoint.path}</code>
                    </td>
                    <td>{endpoint.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Example Request */}
        <section className="api-section">
          <h2>Example Request</h2>
          <div className="api-card">
            <h3>Get Invitation Details</h3>
            <div className="code-block large">
              <pre>{`curl -X GET "https://api.sacredvows.com/v1/invitations/inv_123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
            </div>
            <h4>Response</h4>
            <div className="code-block large">
              <pre>{`{
  "id": "inv_123",
  "title": "Sarah & Michael's Wedding",
  "date": "2025-12-15",
  "venue": "The Grand Palace",
    "layoutId": "classic-scroll",
  "rsvp_count": 127,
  "created_at": "2024-06-15T10:30:00Z",
  "status": "published"
}`}</pre>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="api-section">
          <h2>Rate Limits</h2>
          <div className="api-card">
            <p>API requests are rate limited to ensure fair usage:</p>
            <ul className="rate-limits">
              <li>
                <strong>Free Plan:</strong> 100 requests/hour
              </li>
              <li>
                <strong>Premium Plan:</strong> 1,000 requests/hour
              </li>
              <li>
                <strong>Luxury Plan:</strong> 10,000 requests/hour
              </li>
            </ul>
            <p>Rate limit headers are included in all responses:</p>
            <div className="code-block">
              <code>
                X-RateLimit-Limit: 1000
                <br />
                X-RateLimit-Remaining: 999
                <br />
                X-RateLimit-Reset: 1609459200
              </code>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="api-help">
          <h2>Need Help with the API?</h2>
          <p>Our developer support team is here to help you integrate successfully.</p>
          <div className="help-buttons">
            <Link to="/contact" className="page-btn page-btn-primary">
              Contact Developer Support
            </Link>
            <Link to="/faqs" className="page-btn page-btn-secondary">
              View FAQs
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default APIDocsPage;
