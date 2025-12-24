import { useEffect, ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trackCTA } from "../../services/analyticsService";

// SVG Icons
const RingIcon = (): ReactElement => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="10" stroke="#d4af37" strokeWidth="2" fill="none" />
    <circle cx="16" cy="6" r="2.5" fill="#d4af37" />
    <path d="M13.5 6L16 2L18.5 6" stroke="#d4af37" strokeWidth="1.5" fill="none" />
  </svg>
);

const InstagramIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="6" r="1.5" fill="currentColor" />
  </svg>
);

const PinterestIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 6C9 6 7 8.5 7 11C7 13 8 14.5 9.5 15C9.5 14.5 9.5 13.5 9.8 12.8C10 12.2 10.8 9 10.8 9C10.8 9 10.5 8.5 10.5 7.8C10.5 6.8 11 6 11.8 6C12.5 6 12.8 6.5 12.8 7.2C12.8 8 12.3 9.2 12 10C11.8 10.8 12.3 11.5 13 11.5C14.5 11.5 15.5 10 15.5 8C15.5 6.5 14.3 5.5 12 5.5C9.5 5.5 8 7.2 8 9.2C8 10 8.3 10.8 8.8 11.2C8.5 11.5 8.5 12 8.3 12C8 12 7.3 11.5 7.3 10C7.3 7.5 9 5 12 5C15 5 17 7 17 9.5C17 12.5 15 14.5 12.5 14.5C11.5 14.5 10.8 14 10.5 13.5L10 15.5C9.8 16.2 9.3 17 9 17.5L12 18C15.5 18 18 15 18 12C18 8.7 15.3 6 12 6Z"
      fill="currentColor"
    />
  </svg>
);

const FacebookIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TwitterIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 4L10.5 12.5L4 20H6L11.5 14L16 20H20L13 10.5L19 4H17L12 9L8 4H4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface LandingFooterProps {
  onSectionView?: (sectionId: string) => void;
}

function LandingFooter({ onSectionView }: LandingFooterProps): ReactElement {
  const navigate = useNavigate();

  useEffect(() => {
    if (onSectionView) onSectionView("footer");
  }, [onSectionView]);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="footer-cta">
        <div>
          <p className="section-label">Start in minutes</p>
          <h3>Ready to create your invitation?</h3>
          <p className="section-subtitle">Private links, instant previews, no credit card.</p>
        </div>
        <div className="footer-cta-actions">
          <button
            className="cta-button"
            onClick={() => {
              trackCTA("footer_start");
              navigate("/signup");
            }}
          >
            Start free →
          </button>
          <button
            className="cta-secondary"
            onClick={() => {
              trackCTA("footer_layouts");
              navigate("/layouts-gallery");
            }}
          >
            Browse layouts
          </button>
        </div>
      </div>

      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-icon">
              <RingIcon />
            </span>
            <span className="footer-logo-text">Sacred Vows</span>
          </div>
          <p>
            Create beautiful digital wedding invitations that capture the magic of your love story.
            Share your joy with the world.
          </p>
          <div className="footer-social">
            <a
              href="https://instagram.com"
              className="social-link"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://pinterest.com"
              className="social-link"
              aria-label="Pinterest"
              target="_blank"
              rel="noopener noreferrer"
            >
              <PinterestIcon />
            </a>
            <a
              href="https://facebook.com"
              className="social-link"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://twitter.com"
              className="social-link"
              aria-label="Twitter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterIcon />
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h4>Layouts</h4>
          <ul>
            <li>
              <Link to="/layouts-gallery">All Layouts</Link>
            </li>
            <li>
              <Link to="/layouts/traditional">Traditional</Link>
            </li>
            <li>
              <Link to="/layouts/modern">Modern</Link>
            </li>
            <li>
              <Link to="/layouts/minimal">Minimal</Link>
            </li>
            <li>
              <Link to="/layouts/floral">Floral</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column secondary">
          <h4>Company</h4>
          <ul>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
            <li>
              <Link to="/careers">Careers</Link>
            </li>
            <li>
              <Link to="/press">Press</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column secondary">
          <h4>Support</h4>
          <ul>
            <li>
              <Link to="/help">Help Center</Link>
            </li>
            <li>
              <Link to="/faqs">FAQs</Link>
            </li>
            <li>
              <Link to="/pricing">Pricing</Link>
            </li>
            <li>
              <Link to="/tutorials">Tutorials</Link>
            </li>
            <li>
              <Link to="/api-docs">API</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          © {currentYear} Sacred Vows. Made with <span>♥</span> for couples everywhere.
        </p>
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/cookies">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
