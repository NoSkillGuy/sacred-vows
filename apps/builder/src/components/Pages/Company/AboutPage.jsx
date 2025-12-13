import { useNavigate } from 'react-router-dom';
import PageLayout from '../PageLayout';
import './AboutPage.css';

// SVG Icons
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor"/>
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 12H22" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const values = [
  {
    icon: <HeartIcon />,
    title: 'Love First',
    description: 'Every feature we build, every design we create, starts with understanding the love story behind it. We celebrate the unique journey of each couple.'
  },
  {
    icon: <SparkleIcon />,
    title: 'Excellence in Craft',
    description: 'We obsess over every pixel, every animation, every interaction. Your special day deserves nothing less than perfection in every detail.'
  },
  {
    icon: <GlobeIcon />,
    title: 'Accessible Beauty',
    description: 'Beautiful wedding invitations should be available to everyone, regardless of budget. We democratize elegance through thoughtful design.'
  },
  {
    icon: <UsersIcon />,
    title: 'Customer Obsessed',
    description: 'Your success is our success. We\'re here to support you through every step, from your first design to your last RSVP.'
  }
];

const team = [
  {
    name: 'Priya Sharma',
    role: 'Founder & CEO',
    bio: 'Former wedding planner turned tech entrepreneur. Priya started Sacred Vows after seeing couples struggle with expensive, outdated invitation options.',
    initial: 'PS'
  },
  {
    name: 'Arjun Mehta',
    role: 'Head of Design',
    bio: 'Award-winning designer with 10+ years in luxury branding. Arjun brings timeless elegance to every layout we create.',
    initial: 'AM'
  },
  {
    name: 'Sarah Chen',
    role: 'Head of Engineering',
    bio: 'Previously at Google and Stripe. Sarah leads our team in building the most reliable and beautiful invitation platform.',
    initial: 'SC'
  },
  {
    name: 'Rahul Kapoor',
    role: 'Customer Success Lead',
    bio: 'Passionate about making couples\' dreams come true. Rahul ensures every customer has a magical experience with Sacred Vows.',
    initial: 'RK'
  }
];

const stats = [
  { number: '50,000+', label: 'Happy Couples' },
  { number: '2M+', label: 'Guests Reached' },
  { number: '50+', label: 'Countries' },
  { number: '98%', label: 'Satisfaction Rate' }
];

function AboutPage() {
  const navigate = useNavigate();

  return (
    <PageLayout
      title="Our Story"
      subtitle="Building the future of wedding invitations, one love story at a time."
      breadcrumbs={[{ label: 'Company', path: '/about' }, { label: 'About Us' }]}
    >
      <div className="about-page">
        {/* Origin Story */}
        <section className="about-story">
          <div className="story-content">
            <span className="section-label">How It Started</span>
            <h2 className="section-title">Born From Love</h2>
            <p>
              Sacred Vows was born in 2022 when our founder, Priya, was planning her own wedding. 
              Frustrated by expensive paper invitations and clunky digital alternatives, she envisioned 
              something better: beautiful, personalized digital invitations that capture the magic of 
              love stories.
            </p>
            <p>
              What started as a passion project has grown into a platform trusted by over 50,000 couples 
              worldwide. Every day, we're honored to be a small part of the most important day in people's 
              lives.
            </p>
            <p>
              Today, Sacred Vows is more than a product—it's a celebration of love in the digital age. 
              We combine timeless elegance with modern technology to create invitations that your guests 
              will treasure forever.
            </p>
          </div>
          <div className="story-visual">
            <div className="story-card">
              <div className="story-quote">
                "Every love story is unique. Every invitation should be too."
              </div>
              <div className="story-author">
                <span className="author-avatar">PS</span>
                <div>
                  <strong>Priya Sharma</strong>
                  <span>Founder & CEO</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="about-stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </section>

        {/* Values */}
        <section className="about-values">
          <div className="section-header">
            <span className="section-label">Our Values</span>
            <h2 className="section-title">What We Believe</h2>
            <p className="section-subtitle">
              These principles guide everything we do at Sacred Vows.
            </p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="about-team">
          <div className="section-header">
            <span className="section-label">Our Team</span>
            <h2 className="section-title">Meet the People Behind Sacred Vows</h2>
            <p className="section-subtitle">
              A passionate team dedicated to making your special day even more beautiful.
            </p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-avatar">
                  <span>{member.initial}</span>
                </div>
                <h3>{member.name}</h3>
                <span className="team-role">{member.role}</span>
                <p>{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta">
          <h2>Ready to Create Your Invitation?</h2>
          <p>Join thousands of couples who chose Sacred Vows for their special day.</p>
          <div className="cta-buttons">
            <button className="page-btn page-btn-primary" onClick={() => navigate('/signup')}>
              Start Creating Free
            </button>
            <button className="page-btn page-btn-secondary" onClick={() => navigate('/contact')}>
              Contact Us
            </button>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default AboutPage;

