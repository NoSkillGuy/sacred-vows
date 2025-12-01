import HeroSection from './HeroSection';
import TemplateShowcase from './TemplateShowcase';
import FeaturesSection from './FeaturesSection';
import HowItWorks from './HowItWorks';
import Testimonials from './Testimonials';
import CTASection from './CTASection';
import LandingFooter from './LandingFooter';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <HeroSection />
      <TemplateShowcase />
      <FeaturesSection />
      <HowItWorks />
      <Testimonials />
      <CTASection />
      <LandingFooter />
    </div>
  );
}

export default LandingPage;

