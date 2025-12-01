const features = [
  {
    icon: '✨',
    title: 'Real-Time Preview',
    description: 'See your changes instantly as you customize every detail of your invitation.',
  },
  {
    icon: '📸',
    title: 'Beautiful Galleries',
    description: 'Showcase your love story with stunning photo galleries and slideshow features.',
  },
  {
    icon: '🌍',
    title: 'Multi-Language',
    description: 'Reach all your guests with support for multiple languages including English, Hindi, and more.',
  },
  {
    icon: '📱',
    title: 'Mobile Perfect',
    description: 'Your invitation looks beautiful on every device, from phones to desktops.',
  },
  {
    icon: '🔗',
    title: 'Easy Sharing',
    description: 'Share your invitation via link, WhatsApp, email, or any social platform.',
  },
  {
    icon: '📊',
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
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;

