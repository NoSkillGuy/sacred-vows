import HeroSection from "./HeroSection";
import LayoutShowcase from "./LayoutShowcase";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import CTASection from "./CTASection";
import LandingFooter from "./LandingFooter";
import { useEffect, useState } from "react";
import {
  trackExperiment,
  trackPageView,
  trackSectionViewed,
} from "../../services/analyticsService";
import {
  isAuthenticated,
  getCurrentUserFromAPI,
  refreshAccessToken,
  getCurrentUser,
  type User,
} from "../../services/authService";
import "./LandingPage.css";

function LandingPage(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);

  // Check authentication state and load user data
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        // If no access token, try to refresh using refresh token from cookie
        let authenticated = isAuthenticated();
        if (!authenticated) {
          try {
            await refreshAccessToken();
            authenticated = isAuthenticated();
          } catch {
            // No valid refresh token, user is not authenticated
            setIsAuthChecked(true);
            return;
          }
        }

        // If authenticated, verify token and get user data
        if (authenticated) {
          try {
            await getCurrentUserFromAPI();
            const currentUser = getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // Token is invalid, user is not authenticated
            console.error("Token validation failed:", error);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    trackPageView({ page: "landing" });
    trackExperiment("landing_nav", "sticky_v1");
  }, []);

  const handleSectionVisible = (sectionId: string): void => trackSectionViewed(sectionId);

  return (
    <div className="landing-page">
      <HeroSection
        onSectionView={handleSectionVisible}
        user={user}
        isAuthenticated={!!user}
        isAuthChecked={isAuthChecked}
      />
      <LayoutShowcase onSectionView={handleSectionVisible} />
      <HowItWorks onSectionView={handleSectionVisible} />
      <Testimonials onSectionView={handleSectionVisible} />
      <CTASection onSectionView={handleSectionVisible} />
      <LandingFooter onSectionView={handleSectionVisible} />
    </div>
  );
}

export default LandingPage;
