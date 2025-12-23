import { useState, ReactElement, FormEvent, ChangeEvent } from 'react';
import PageLayout from '../PageLayout';
import './ContactPage.css';

// SVG Icons
const MailIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PhoneIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.09501 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MapPinIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const ClockIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const MessageIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HelpIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15848 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="17" r="1" fill="currentColor"/>
  </svg>
);

interface ContactInfo {
  icon: ReactElement;
  title: string;
  content: string;
  subtext: string;
}

const contactInfo: ContactInfo[] = [
  {
    icon: <MailIcon />,
    title: 'Email Us',
    content: 'support@sacredvows.com',
    subtext: 'We\'ll respond within 24 hours'
  },
  {
    icon: <PhoneIcon />,
    title: 'Call Us',
    content: '+1 (555) 123-4567',
    subtext: 'Mon-Fri, 9am-6pm EST'
  },
  {
    icon: <MapPinIcon />,
    title: 'Visit Us',
    content: '123 Love Lane, Suite 100',
    subtext: 'San Francisco, CA 94102'
  },
  {
    icon: <ClockIcon />,
    title: 'Business Hours',
    content: 'Mon-Fri: 9am-6pm EST',
    subtext: 'Weekend support via email'
  }
];

interface Topic {
  value: string;
  label: string;
}

const topics: Topic[] = [
  { value: '', label: 'Select a topic' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'press', label: 'Press & Media' },
  { value: 'feedback', label: 'Feedback & Suggestions' }
];

interface FormData {
  name: string;
  email: string;
  topic: string;
  message: string;
}

function ContactPage(): ReactElement {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    topic: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  return (
    <PageLayout
      title="Get in Touch"
      subtitle="Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
      breadcrumbs={[{ label: 'Company', path: '/about' }, { label: 'Contact' }]}
    >
      <div className="contact-page">
        <div className="contact-grid">
          {/* Contact Form */}
          <div className="contact-form-wrapper">
            <div className="contact-form-card">
              <div className="form-header">
                <MessageIcon />
                <h2>Send Us a Message</h2>
              </div>
              
              {submitted ? (
                <div className="form-success">
                  <div className="success-icon">✓</div>
                  <h3>Thank You!</h3>
                  <p>We've received your message and will get back to you within 24 hours.</p>
                  <button 
                    className="page-btn page-btn-secondary"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="page-form-group">
                      <label className="page-form-label">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        className="page-form-input"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="page-form-group">
                      <label className="page-form-label">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="page-form-input"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="page-form-group">
                    <label className="page-form-label">Topic</label>
                    <select
                      name="topic"
                      className="page-form-select"
                      value={formData.topic}
                      onChange={handleChange}
                      required
                    >
                      {topics.map((topic) => (
                        <option key={topic.value} value={topic.value}>
                          {topic.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="page-form-group">
                    <label className="page-form-label">Message</label>
                    <textarea
                      name="message"
                      className="page-form-textarea"
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <button type="submit" className="page-btn page-btn-primary submit-btn">
                    Send Message
                    <span>→</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <h3>Other Ways to Reach Us</h3>
            <div className="info-cards">
              {contactInfo.map((info, index) => (
                <div key={index} className="info-card">
                  <div className="info-icon">{info.icon}</div>
                  <div className="info-content">
                    <h4>{info.title}</h4>
                    <p className="info-main">{info.content}</p>
                    <p className="info-sub">{info.subtext}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="quick-links">
              <h4>Quick Links</h4>
              <a href="/help" className="quick-link">
                <HelpIcon />
                <span>Help Center</span>
              </a>
              <a href="/faqs" className="quick-link">
                <MessageIcon />
                <span>FAQs</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default ContactPage;

