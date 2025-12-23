import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../PageLayout';
import './CareersPage.css';

// SVG Icons
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

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

const jobs: Job[] = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build beautiful, performant user interfaces that help couples create their perfect wedding invitations.'
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Design',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'Design elegant, user-centric experiences that bring joy to couples planning their special day.'
  },
  {
    id: 3,
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Scale our infrastructure to support millions of wedding invitations and RSVPs worldwide.'
  },
  {
    id: 4,
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote',
    type: 'Full-time',
    description: 'Help couples have the best possible experience with Sacred Vows from signup to wedding day.'
  },
  {
    id: 5,
    title: 'Content Marketing Specialist',
    department: 'Marketing',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'Create compelling content that inspires and educates couples planning their weddings.'
  },
  {
    id: 6,
    title: 'Wedding Industry Partnerships',
    department: 'Business Development',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build relationships with wedding venues, planners, and vendors to expand our reach.'
  }
];

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  { icon: '🏠', title: 'Remote-First', description: 'Work from anywhere in the world' },
  { icon: '🏖️', title: 'Unlimited PTO', description: 'Take the time you need to recharge' },
  { icon: '💰', title: 'Competitive Pay', description: 'Top-tier salaries and equity' },
  { icon: '🏥', title: 'Health Benefits', description: 'Full medical, dental, and vision' },
  { icon: '📚', title: 'Learning Budget', description: '$1,500/year for professional development' },
  { icon: '👶', title: 'Parental Leave', description: '16 weeks paid leave for all parents' },
  { icon: '💻', title: 'Home Office Setup', description: '$1,000 to set up your workspace' },
  { icon: '🎉', title: 'Team Events', description: 'Annual retreats and virtual celebrations' }
];

interface Value {
  title: string;
  description: string;
}

const values: Value[] = [
  {
    title: 'Love What You Do',
    description: 'We\'re passionate about helping couples celebrate their love stories.'
  },
  {
    title: 'Ship with Care',
    description: 'Every feature we build impacts someone\'s most important day.'
  },
  {
    title: 'Grow Together',
    description: 'We invest in each other\'s growth and celebrate wins as a team.'
  },
  {
    title: 'Stay Curious',
    description: 'We\'re always learning, experimenting, and pushing boundaries.'
  }
];

function CareersPage(): ReactElement {
  return (
    <PageLayout
      title="Join Our Team"
      subtitle="Help us build the future of wedding invitations. We're looking for passionate people to join our mission."
      breadcrumbs={[{ label: 'Company', path: '/about' }, { label: 'Careers' }]}
    >
      <div className="careers-page">
        {/* Culture Section */}
        <section className="careers-culture">
          <div className="culture-content">
            <span className="section-label">Our Culture</span>
            <h2 className="section-title">Why Work at Sacred Vows?</h2>
            <p>
              We're a small, passionate team on a mission to make wedding invitations beautiful, 
              accessible, and meaningful. Every day, we get to be a part of the most important 
              day in people's lives—and that's incredibly rewarding.
            </p>
            <p>
              We believe in work-life balance, continuous learning, and creating an inclusive 
              environment where everyone can do their best work.
            </p>
          </div>
          <div className="culture-values">
            {values.map((value, index) => (
              <div key={index} className="value-item">
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="careers-benefits">
          <div className="section-header">
            <span className="section-label">Benefits & Perks</span>
            <h2 className="section-title">We Take Care of Our Team</h2>
          </div>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <span className="benefit-icon">{benefit.icon}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section className="careers-positions">
          <div className="section-header">
            <span className="section-label">Open Positions</span>
            <h2 className="section-title">Join Our Growing Team</h2>
            <p className="section-subtitle">
              We're always looking for talented individuals. Don't see a perfect fit? 
              Send us your resume anyway!
            </p>
          </div>
          <div className="jobs-list">
            {jobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div>
                    <h3>{job.title}</h3>
                    <span className="job-department">{job.department}</span>
                  </div>
                  <button className="apply-btn">Apply Now</button>
                </div>
                <p className="job-description">{job.description}</p>
                <div className="job-meta">
                  <span className="job-location">
                    <MapPinIcon />
                    {job.location}
                  </span>
                  <span className="job-type">
                    <ClockIcon />
                    {job.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="careers-cta">
          <h2>Don't See the Right Role?</h2>
          <p>We're always interested in meeting talented people. Send us your resume and tell us how you'd like to contribute.</p>
          <Link to="/contact" className="page-btn page-btn-primary">
            Get in Touch
          </Link>
        </section>
      </div>
    </PageLayout>
  );
}

export default CareersPage;

