import HeroSection from './HeroSection';
import TemplateShowcase from './TemplateShowcase';
import FeaturesSection from './FeaturesSection';
import HowItWorks from './HowItWorks';
import Testimonials from './Testimonials';
import CTASection from './CTASection';
import LandingFooter from './LandingFooter';
import { useEffect } from 'react';
import { trackExperiment, trackPageView, trackSectionViewed } from '../../services/analyticsService';
import './LandingPage.css';

function LandingPage() {
  useEffect(() => {
    trackPageView({ page: 'landing' });
    trackExperiment('landing_nav', 'sticky_v1');
  }, []);

  const handleSectionVisible = (sectionId) => trackSectionViewed(sectionId);

  return (
    <div className="landing-page">
      <HeroSection onSectionView={handleSectionVisible} />
      <TemplateShowcase onSectionView={handleSectionVisible} />
      <FeaturesSection onSectionView={handleSectionVisible} />
      <HowItWorks onSectionView={handleSectionVisible} />
      <Testimonials onSectionView={handleSectionVisible} />
      <CTASection onSectionView={handleSectionVisible} />
      <LandingFooter onSectionView={handleSectionVisible} />
    </div>
  );
}

export default LandingPage;

