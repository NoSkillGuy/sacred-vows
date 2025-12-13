import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../PageLayout';
import './FAQsPage.css';

// SVG Icons
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const faqCategories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: '🚀',
    faqs: [
      {
        question: 'How do I create my first wedding invitation?',
        answer: 'Creating your first invitation is easy! Simply sign up for a free account, browse our layout gallery, and select a design you love. Then customize it with your wedding details using our intuitive drag-and-drop editor. You can preview your invitation at any time and share it when ready.'
      },
      {
        question: 'Do I need any design experience?',
        answer: 'Not at all! Sacred Vows is designed for everyone. Our layouts are professionally designed, and our editor makes customization simple. Just click, type, and drag to make changes. If you ever need help, our support team is always available.'
      },
      {
        question: 'How long does it take to create an invitation?',
        answer: 'Most couples complete their invitation in 15-30 minutes. You can save your progress at any time and come back later. Our real-time preview lets you see changes instantly, making the process quick and enjoyable.'
      },
      {
        question: 'Can I see a preview before sharing?',
        answer: 'Absolutely! You can preview your invitation at any time during the creation process. We also recommend sending a test link to yourself before sharing with guests to make sure everything looks perfect.'
      }
    ]
  },
  {
    id: 'layouts',
    name: 'Layouts & Design',
    icon: '🎨',
    faqs: [
      {
        question: 'How many layouts are available?',
        answer: 'We offer over 50 professionally designed layouts across various styles including Traditional, Modern, Minimal, Floral, and more. New layouts are added regularly. Premium and Luxury plans unlock access to exclusive layouts.'
      },
      {
        question: 'Can I switch layouts after starting?',
        answer: 'Yes! You can switch layouts at any time, and your content will automatically transfer to the new design. This makes it easy to experiment with different looks until you find the perfect one.'
      },
      {
        question: 'Can I customize colors and fonts?',
        answer: 'Premium and Luxury plans allow full customization of colors, fonts, and layouts. Free plan users can customize text content but use the layout\'s preset design elements.'
      },
      {
        question: 'Can I upload my own images?',
        answer: 'Yes! All plans allow image uploads. You can add engagement photos, venue pictures, or any other images to personalize your invitation. We support JPG, PNG, and WebP formats.'
      }
    ]
  },
  {
    id: 'sharing',
    name: 'Sharing & Guests',
    icon: '📤',
    faqs: [
      {
        question: 'How do I share my invitation?',
        answer: 'You get a unique link to your invitation that you can share via text, email, WhatsApp, social media, or any messaging platform. You can also generate a QR code for printed materials.'
      },
      {
        question: 'Can I personalize invitations for each guest?',
        answer: 'Yes! Our guest name feature allows you to create personalized links that display each guest\'s name on the invitation. This adds a special touch that guests love.'
      },
      {
        question: 'Is there a guest limit?',
        answer: 'Free plans support up to 50 guests. Premium and Luxury plans have unlimited guest capacity. Guest limits refer to the number of people who can access personalized links, not viewers of your general invitation link.'
      },
      {
        question: 'Can guests save the invitation?',
        answer: 'Yes! Guests can save your invitation to their device and even add your wedding date directly to their calendar with one click.'
      }
    ]
  },
  {
    id: 'rsvp',
    name: 'RSVP & Tracking',
    icon: '✅',
    faqs: [
      {
        question: 'How does RSVP tracking work?',
        answer: 'When guests visit your invitation, they can respond to your RSVP directly. You\'ll see all responses in your dashboard with details like guest count, meal preferences (if enabled), and any messages they include.'
      },
      {
        question: 'Can I customize RSVP questions?',
        answer: 'Luxury plan users can add custom RSVP questions. All plans include standard options like attendance confirmation and guest count. Premium adds meal preference options.'
      },
      {
        question: 'How do I track who has viewed my invitation?',
        answer: 'Your dashboard shows real-time analytics including total views, unique visitors, and RSVP status. Premium and Luxury plans include detailed analytics with geographic data and device information.'
      },
      {
        question: 'Can I export RSVP data?',
        answer: 'Yes! All plans allow you to export your guest list and RSVP responses to CSV or Excel format. This makes it easy to share with venues, caterers, or wedding planners.'
      }
    ]
  },
  {
    id: 'billing',
    name: 'Pricing & Billing',
    icon: '💳',
    faqs: [
      {
        question: 'Is there really a free plan?',
        answer: 'Yes! Our Starter plan is completely free forever. It includes one invitation design, basic layouts, up to 50 guests, and essential RSVP features. No credit card required to sign up.'
      },
      {
        question: 'Are paid plans a subscription or one-time payment?',
        answer: 'Our Premium ($29) and Luxury ($79) plans are one-time payments, not subscriptions. You pay once and own it forever - no recurring charges or hidden fees.'
      },
      {
        question: 'Can I upgrade my plan later?',
        answer: 'Absolutely! You can upgrade from any plan at any time. Your existing invitation designs and data will be preserved, and you\'ll gain immediate access to all new features.'
      },
      {
        question: 'What\'s your refund policy?',
        answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not completely satisfied, contact us for a full refund - no questions asked.'
      }
    ]
  },
  {
    id: 'technical',
    name: 'Technical Support',
    icon: '🔧',
    faqs: [
      {
        question: 'What browsers are supported?',
        answer: 'Sacred Vows works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience. Our invitations also display beautifully on mobile devices.'
      },
      {
        question: 'How long will my invitation stay online?',
        answer: 'Your invitation stays online forever! Many couples keep their invitation live as a digital keepsake. You can also disable access at any time if you prefer.'
      },
      {
        question: 'Can I use a custom domain?',
        answer: 'Premium and Luxury plans support custom domains. You can use your own domain (like www.johnandjanewedding.com) for a more personal touch.'
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes! We use industry-standard encryption and security practices to protect your data. We never share your information with third parties. See our Privacy Policy for details.'
      }
    ]
  }
];

function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (categoryId, faqIndex) => {
    const key = `${categoryId}-${faqIndex}`;
    setExpandedFaqs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const currentCategory = faqCategories.find(cat => cat.id === activeCategory);

  // Filter FAQs based on search
  const filteredCategories = searchQuery
    ? faqCategories.map(cat => ({
        ...cat,
        faqs: cat.faqs.filter(faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.faqs.length > 0)
    : null;

  return (
    <PageLayout
      title="Frequently Asked Questions"
      subtitle="Find answers to common questions about Sacred Vows. Can't find what you're looking for? Contact our support team."
      breadcrumbs={[{ label: 'Support', path: '/help' }, { label: 'FAQs' }]}
    >
      <div className="faqs-page">
        {/* Search Bar */}
        <div className="faqs-search">
          <div className="search-input-wrapper">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {searchQuery ? (
          /* Search Results */
          <div className="search-results">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <div key={category.id} className="search-category">
                  <h3>
                    <span>{category.icon}</span>
                    {category.name}
                  </h3>
                  <div className="faqs-list">
                    {category.faqs.map((faq, index) => {
                      const key = `search-${category.id}-${index}`;
                      const isExpanded = expandedFaqs[key];
                      return (
                        <div key={index} className={`faq-item ${isExpanded ? 'expanded' : ''}`}>
                          <button
                            className="faq-question"
                            onClick={() => toggleFaq(`search-${category.id}`, index)}
                          >
                            <span>{faq.question}</span>
                            <ChevronDownIcon />
                          </button>
                          <div className="faq-answer">
                            <p>{faq.answer}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No results found for "{searchQuery}"</p>
                <button 
                  className="page-btn page-btn-ghost"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Category View */
          <div className="faqs-content">
            {/* Category Tabs */}
            <div className="faqs-categories">
              {faqCategories.map(category => (
                <button
                  key={category.id}
                  className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="faqs-panel">
              <div className="panel-header">
                <span className="panel-icon">{currentCategory?.icon}</span>
                <h2>{currentCategory?.name}</h2>
              </div>
              <div className="faqs-list">
                {currentCategory?.faqs.map((faq, index) => {
                  const key = `${activeCategory}-${index}`;
                  const isExpanded = expandedFaqs[key];
                  return (
                    <div key={index} className={`faq-item ${isExpanded ? 'expanded' : ''}`}>
                      <button
                        className="faq-question"
                        onClick={() => toggleFaq(activeCategory, index)}
                      >
                        <span>{faq.question}</span>
                        <ChevronDownIcon />
                      </button>
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Still Need Help */}
        <section className="faqs-help">
          <h2>Still Have Questions?</h2>
          <p>Our support team is here to help you with any questions.</p>
          <div className="help-buttons">
            <Link to="/contact" className="page-btn page-btn-primary">
              Contact Support
            </Link>
            <Link to="/help" className="page-btn page-btn-secondary">
              Visit Help Center
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default FAQsPage;

