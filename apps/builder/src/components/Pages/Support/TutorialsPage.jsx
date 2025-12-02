import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../PageLayout';
import './TutorialsPage.css';

// SVG Icons
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const tutorials = [
  {
    id: 1,
    category: 'Getting Started',
    title: 'Creating Your First Wedding Invitation',
    description: 'A complete walkthrough of creating your beautiful wedding invitation from scratch.',
    duration: '8 min',
    difficulty: 'Beginner',
    steps: [
      'Sign up for your free account',
      'Browse and select a template',
      'Add your wedding details',
      'Customize colors and fonts',
      'Preview and publish'
    ]
  },
  {
    id: 2,
    category: 'Getting Started',
    title: 'Understanding the Dashboard',
    description: 'Navigate your Sacred Vows dashboard and learn about all available features.',
    duration: '5 min',
    difficulty: 'Beginner',
    steps: [
      'Overview of dashboard sections',
      'Managing your invitations',
      'Accessing RSVP data',
      'Account settings'
    ]
  },
  {
    id: 3,
    category: 'Design',
    title: 'Customizing Your Template',
    description: 'Learn how to personalize your invitation with custom colors, fonts, and layouts.',
    duration: '10 min',
    difficulty: 'Intermediate',
    steps: [
      'Using the visual editor',
      'Changing color schemes',
      'Selecting font combinations',
      'Adjusting layout sections',
      'Adding custom elements'
    ]
  },
  {
    id: 4,
    category: 'Design',
    title: 'Working with Images',
    description: 'Upload and optimize photos for your wedding invitation gallery.',
    duration: '6 min',
    difficulty: 'Beginner',
    steps: [
      'Supported image formats',
      'Uploading engagement photos',
      'Creating a photo gallery',
      'Image optimization tips'
    ]
  },
  {
    id: 5,
    category: 'Sharing',
    title: 'Sharing Your Invitation',
    description: 'Learn all the ways to share your invitation with guests.',
    duration: '7 min',
    difficulty: 'Beginner',
    steps: [
      'Getting your invitation link',
      'Sharing via messaging apps',
      'Email sharing tips',
      'Social media sharing',
      'Creating QR codes'
    ]
  },
  {
    id: 6,
    category: 'Sharing',
    title: 'Personalizing for Each Guest',
    description: 'Create personalized links that display each guest\'s name.',
    duration: '5 min',
    difficulty: 'Intermediate',
    steps: [
      'Setting up guest names',
      'Creating personalized links',
      'Bulk link generation',
      'Tracking personalized responses'
    ]
  },
  {
    id: 7,
    category: 'RSVP',
    title: 'Managing RSVPs',
    description: 'Track responses and manage your guest list effectively.',
    duration: '8 min',
    difficulty: 'Beginner',
    steps: [
      'Viewing RSVP responses',
      'Understanding response status',
      'Exporting guest data',
      'Sending reminders'
    ]
  },
  {
    id: 8,
    category: 'Advanced',
    title: 'Using Custom Domains',
    description: 'Set up a custom domain for your wedding invitation.',
    duration: '12 min',
    difficulty: 'Advanced',
    steps: [
      'Purchasing a domain',
      'DNS configuration',
      'Connecting to Sacred Vows',
      'SSL setup',
      'Troubleshooting tips'
    ]
  },
  {
    id: 9,
    category: 'Advanced',
    title: 'Multi-language Invitations',
    description: 'Create invitations in multiple languages for international guests.',
    duration: '10 min',
    difficulty: 'Advanced',
    steps: [
      'Enabling multi-language',
      'Adding translations',
      'Language switcher setup',
      'RTL language support'
    ]
  }
];

const categories = ['All', 'Getting Started', 'Design', 'Sharing', 'RSVP', 'Advanced'];

const difficultyColors = {
  Beginner: 'sage',
  Intermediate: 'gold',
  Advanced: 'rose'
};

function TutorialsPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTutorials = activeCategory === 'All'
    ? tutorials
    : tutorials.filter(t => t.category === activeCategory);

  return (
    <PageLayout
      title="Tutorials & Guides"
      subtitle="Step-by-step tutorials to help you create the perfect wedding invitation."
      breadcrumbs={[{ label: 'Support', path: '/help' }, { label: 'Tutorials' }]}
    >
      <div className="tutorials-page">
        {/* Category Filter */}
        <div className="tutorial-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tutorials Grid */}
        <div className="tutorials-grid">
          {filteredTutorials.map(tutorial => (
            <div key={tutorial.id} className="tutorial-card">
              <div className="tutorial-thumbnail">
                <div className="play-overlay">
                  <div className="play-button">
                    <PlayIcon />
                  </div>
                </div>
                <span className="tutorial-category">{tutorial.category}</span>
              </div>
              
              <div className="tutorial-content">
                <div className="tutorial-meta">
                  <span className="tutorial-duration">
                    <ClockIcon />
                    {tutorial.duration}
                  </span>
                  <span className={`tutorial-difficulty ${difficultyColors[tutorial.difficulty]}`}>
                    {tutorial.difficulty}
                  </span>
                </div>
                
                <h3>{tutorial.title}</h3>
                <p>{tutorial.description}</p>
                
                <div className="tutorial-steps">
                  <strong>What you'll learn:</strong>
                  <ul>
                    {tutorial.steps.slice(0, 3).map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                    {tutorial.steps.length > 3 && (
                      <li className="more">+ {tutorial.steps.length - 3} more steps</li>
                    )}
                  </ul>
                </div>
                
                <button className="tutorial-cta">
                  Start Tutorial →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <section className="tutorials-help">
          <h2>Can't Find What You're Looking For?</h2>
          <p>Browse our FAQ or contact support for personalized help.</p>
          <div className="help-buttons">
            <Link to="/faqs" className="page-btn page-btn-primary">
              View FAQs
            </Link>
            <Link to="/contact" className="page-btn page-btn-secondary">
              Contact Support
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default TutorialsPage;

