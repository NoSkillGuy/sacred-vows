import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../PageLayout';
import './PricingPage.css';

// SVG Icons
const CheckIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SparkleIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor"/>
  </svg>
);

const HeartIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CrownIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 17L4 7L8 11L12 3L16 11L20 7L22 17H2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17H22V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19V17Z" fill="currentColor" opacity="0.2"/>
  </svg>
);

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  icon: ReactElement;
  features: string[];
  cta: string;
  popular: boolean;
}

interface FAQ {
  question: string;
  answer: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    description: 'Perfect for trying out Sacred Vows',
    price: '0',
    period: 'forever',
    icon: <HeartIcon />,
    features: [
      '1 invitation design',
      'Basic layouts',
      'Share via link',
      'Up to 50 guests',
      'Basic RSVP tracking',
      'Sacred Vows watermark'
    ],
    cta: 'Start Free',
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Everything you need for your special day',
    price: '29',
    period: 'one-time',
    icon: <SparkleIcon />,
    features: [
      'Unlimited invitation designs',
      'All premium layouts',
      'Custom domain support',
      'Unlimited guests',
      'Advanced RSVP & analytics',
      'No watermark',
      'Custom music upload',
      'Priority email support',
      'Photo gallery feature',
      'Multi-language support'
    ],
    cta: 'Get Premium',
    popular: true
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'The ultimate wedding invitation experience',
    price: '79',
    period: 'one-time',
    icon: <CrownIcon />,
    features: [
      'Everything in Premium',
      'Exclusive luxury layouts',
      'Custom design consultation',
      'White-glove setup service',
      'Dedicated support agent',
      'Custom RSVP questions',
      'Guest meal preferences',
      'Seating arrangement tool',
      'Print-ready export',
      'Video invitation support'
    ],
    cta: 'Go Luxury',
    popular: false
  }
];

const faqs: FAQ[] = [
  {
    question: 'Can I upgrade my plan later?',
    answer: 'Absolutely! You can upgrade from any plan at any time. Your existing invitation designs will be preserved, and you\'ll gain access to all new features immediately.'
  },
  {
    question: 'Is this a subscription or one-time payment?',
    answer: 'Our Premium and Luxury plans are one-time payments. Once you purchase, you own it forever - no recurring charges or hidden fees.'
  },
  {
    question: 'What happens after my wedding?',
    answer: 'Your invitation stays live forever! Many couples keep it as a digital keepsake. You can also download all your RSVPs and guest data anytime.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes! We offer a 30-day money-back guarantee. If you\'re not completely satisfied, we\'ll refund your purchase - no questions asked.'
  }
];

function PricingPage(): ReactElement {
  const navigate = useNavigate();

  return (
    <PageLayout
      title="Simple, Transparent Pricing"
      subtitle="Choose the perfect plan for your love story. No hidden fees, no surprises - just beautiful invitations."
      breadcrumbs={[{ label: 'Pricing' }]}
    >
      <div className="pricing-page">
        {/* Pricing Cards */}
        <div className="pricing-grid">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && (
                <div className="popular-badge">
                  <SparkleIcon />
                  <span>Most Popular</span>
                </div>
              )}
              
              <div className="pricing-card-icon">
                {plan.icon}
              </div>
              
              <h3 className="pricing-card-name">{plan.name}</h3>
              <p className="pricing-card-description">{plan.description}</p>
              
              <div className="pricing-card-price">
                <span className="currency">$</span>
                <span className="amount">{plan.price}</span>
                <span className="period">/{plan.period}</span>
              </div>
              
              <ul className="pricing-features">
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <span className="check-icon"><CheckIcon /></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`pricing-cta ${plan.popular ? 'primary' : 'secondary'}`}
                onClick={() => navigate('/signup')}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="pricing-trust">
          <div className="trust-item">
            <span className="trust-icon">🔒</span>
            <span>Secure Payment</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">💳</span>
            <span>All Cards Accepted</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">↩️</span>
            <span>30-Day Guarantee</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">💬</span>
            <span>24/7 Support</span>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <section className="comparison-section">
          <div className="section-header">
            <span className="section-label">Compare Plans</span>
            <h2 className="section-title">Feature Comparison</h2>
          </div>
          
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Starter</th>
                  <th className="highlight">Premium</th>
                  <th>Luxury</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Number of Invitations</td>
                  <td>1</td>
                  <td className="highlight">Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Layout Access</td>
                  <td>Basic (5)</td>
                  <td className="highlight">Premium (50+)</td>
                  <td>All + Exclusive</td>
                </tr>
                <tr>
                  <td>Guest Limit</td>
                  <td>50</td>
                  <td className="highlight">Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Custom Domain</td>
                  <td>—</td>
                  <td className="highlight"><CheckIcon /></td>
                  <td><CheckIcon /></td>
                </tr>
                <tr>
                  <td>Music Upload</td>
                  <td>—</td>
                  <td className="highlight"><CheckIcon /></td>
                  <td><CheckIcon /></td>
                </tr>
                <tr>
                  <td>Photo Gallery</td>
                  <td>—</td>
                  <td className="highlight"><CheckIcon /></td>
                  <td><CheckIcon /></td>
                </tr>
                <tr>
                  <td>Multi-language</td>
                  <td>—</td>
                  <td className="highlight"><CheckIcon /></td>
                  <td><CheckIcon /></td>
                </tr>
                <tr>
                  <td>Design Consultation</td>
                  <td>—</td>
                  <td className="highlight">—</td>
                  <td><CheckIcon /></td>
                </tr>
                <tr>
                  <td>Video Support</td>
                  <td>—</td>
                  <td className="highlight">—</td>
                  <td><CheckIcon /></td>
                </tr>
                <tr>
                  <td>Print Export</td>
                  <td>—</td>
                  <td className="highlight">—</td>
                  <td><CheckIcon /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pricing-faq">
          <div className="section-header">
            <span className="section-label">Questions?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="pricing-cta-section">
          <div className="cta-content">
            <h2>Ready to Create Your Perfect Invitation?</h2>
            <p>Join thousands of happy couples who chose Sacred Vows for their special day.</p>
            <button className="page-btn page-btn-primary" onClick={() => navigate('/signup')}>
              Start Creating Free
              <span>→</span>
            </button>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default PricingPage;

