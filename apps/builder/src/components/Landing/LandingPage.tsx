import HeroSection from "./HeroSection";
import LayoutShowcase from "./LayoutShowcase";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import CTASection from "./CTASection";
import LandingFooter from "./LandingFooter";
import { useEffect } from "react";
import {
  trackExperiment,
  trackPageView,
  trackSectionViewed,
} from "../../services/analyticsService";
import "./LandingPage.css";

function LandingPage(): JSX.Element {
  useEffect(() => {
    trackPageView({ page: "landing" });
    trackExperiment("landing_nav", "sticky_v1");
  }, []);

  const handleSectionVisible = (sectionId: string): void => trackSectionViewed(sectionId);

  return (
    <div className="landing-page">
      <HeroSection onSectionView={handleSectionVisible} />
      <LayoutShowcase onSectionView={handleSectionVisible} />
      <HowItWorks onSectionView={handleSectionVisible} />
      <Testimonials onSectionView={handleSectionVisible} />
      <CTASection onSectionView={handleSectionVisible} />
      <LandingFooter onSectionView={handleSectionVisible} />
    </div>
  );
}

export default LandingPage;
