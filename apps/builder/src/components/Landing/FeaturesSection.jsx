// SVG Icons with elegant design
const PreviewIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M4 10H28" stroke="currentColor" strokeWidth="2"/>
    <circle cx="7" cy="8" r="1" fill="currentColor"/>
    <circle cx="10" cy="8" r="1" fill="currentColor"/>
    <circle cx="13" cy="8" r="1" fill="currentColor"/>
    <path d="M10 16L13 19L22 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GalleryIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M4 22L10 16L14 20L20 14L28 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LanguageIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2"/>
    <ellipse cx="16" cy="16" rx="5" ry="12" stroke="currentColor" strokeWidth="2"/>
    <path d="M4 16H28" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 10H26" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 22H26" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const MobileIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="3" width="16" height="26" rx="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 7H24" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 23H24" stroke="currentColor" strokeWidth="2"/>
    <circle cx="16" cy="26" r="1.5" fill="currentColor"/>
    <path d="M13 5H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="16" r="4" stroke="currentColor" strokeWidth="2"/>
    <circle cx="24" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
    <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M11.5 14L20.5 9.5" stroke="currentColor" strokeWidth="2"/>
    <path d="M11.5 18L20.5 22.5" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const RSVPIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8H26V24C26 25.1046 25.1046 26 24 26H8C6.89543 26 6 25.1046 6 24V8Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 8L16 16L26 8" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 26L13 19" stroke="currentColor" strokeWidth="2"/>
    <path d="M26 26L19 19" stroke="currentColor" strokeWidth="2"/>
    <rect x="10" y="4" width="12" height="4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const features = [
  {
    Icon: PreviewIcon,
    title: 'Real-Time Preview',
    description: 'See your changes instantly as you customize every detail of your invitation.',
  },
  {
    Icon: GalleryIcon,
    title: 'Beautiful Galleries',
    description: 'Showcase your love story with stunning photo galleries and slideshow features.',
  },
  {
    Icon: LanguageIcon,
    title: 'Multi-Language',
    description: 'Reach all your guests with support for multiple languages including English, Hindi, and more.',
  },
  {
    Icon: MobileIcon,
    title: 'Mobile Perfect',
    description: 'Your invitation looks beautiful on every device, from phones to desktops.',
  },
  {
    Icon: ShareIcon,
    title: 'Easy Sharing',
    description: 'Share your invitation via link, WhatsApp, email, or any social platform.',
  },
  {
    Icon: RSVPIcon,
    title: 'RSVP Tracking',
    description: 'Track responses and manage your guest list all in one place.',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="features-section">
      <div className="section-header">
        <p className="section-label">Why Choose Us</p>
        <h2 className="section-title">Everything You Need</h2>
        <p className="section-subtitle">
          Our platform is designed to make creating your perfect wedding invitation 
          effortless and enjoyable.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => {
          const IconComponent = feature.Icon;
          return (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <IconComponent />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FeaturesSection;
