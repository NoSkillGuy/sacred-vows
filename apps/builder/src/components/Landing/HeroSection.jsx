import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { trackCTA } from '../../services/analyticsService';

// SVG Components for premium look
const RingIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" stroke="#d4af37" strokeWidth="2.5" fill="none"/>
    <circle cx="20" cy="8" r="3" fill="#d4af37"/>
    <path d="M17 8L20 3L23 8" stroke="#d4af37" strokeWidth="1.5" fill="none"/>
  </svg>
);

const PetalSVG = ({ color = '#e8b4b8' }) => (
  <svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 0C12 0 24 10 24 20C24 26.627 18.627 32 12 32C5.373 32 0 26.627 0 20C0 10 12 0 12 0Z" 
      fill={color}
      opacity="0.7"
    />
  </svg>
);

const FlowerSVG = () => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="6" fill="#d4af37"/>
    <ellipse cx="30" cy="14" rx="6" ry="10" fill="currentColor" opacity="0.6"/>
    <ellipse cx="30" cy="46" rx="6" ry="10" fill="currentColor" opacity="0.6"/>
    <ellipse cx="14" cy="30" rx="10" ry="6" fill="currentColor" opacity="0.6"/>
    <ellipse cx="46" cy="30" rx="10" ry="6" fill="currentColor" opacity="0.6"/>
    <ellipse cx="18.5" cy="18.5" rx="6" ry="10" fill="currentColor" opacity="0.5" transform="rotate(-45 18.5 18.5)"/>
    <ellipse cx="41.5" cy="41.5" rx="6" ry="10" fill="currentColor" opacity="0.5" transform="rotate(-45 41.5 41.5)"/>
    <ellipse cx="41.5" cy="18.5" rx="6" ry="10" fill="currentColor" opacity="0.5" transform="rotate(45 41.5 18.5)"/>
    <ellipse cx="18.5" cy="41.5" rx="6" ry="10" fill="currentColor" opacity="0.5" transform="rotate(45 18.5 41.5)"/>
  </svg>
);

const LeafSVG = () => (
  <svg viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M20 0C20 0 40 15 40 35C40 48.807 31.046 60 20 60C8.954 60 0 48.807 0 35C0 15 20 0 20 0Z" 
      fill="currentColor"
    />
    <path d="M20 10V55" stroke="white" strokeWidth="1" opacity="0.3"/>
    <path d="M20 20L10 28" stroke="white" strokeWidth="0.5" opacity="0.3"/>
    <path d="M20 20L30 28" stroke="white" strokeWidth="0.5" opacity="0.3"/>
    <path d="M20 32L8 42" stroke="white" strokeWidth="0.5" opacity="0.3"/>
    <path d="M20 32L32 42" stroke="white" strokeWidth="0.5" opacity="0.3"/>
  </svg>
);

const OrnamentSVG = () => (
  <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 20C30 20 20 10 10 10C5 10 0 15 0 20C0 25 5 30 10 30C20 30 30 20 30 20Z" fill="currentColor"/>
    <path d="M30 20C30 20 40 10 50 10C55 10 60 15 60 20C60 25 55 30 50 30C40 30 30 20 30 20Z" fill="currentColor"/>
    <circle cx="30" cy="20" r="4" fill="currentColor"/>
  </svg>
);

// Petal colors for variety
const petalColors = ['#f5d0d3', '#e8b4b8', '#fce4e2', '#d4969c', '#c9a1a6'];

function HeroSection({ onSectionView }) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (onSectionView && sectionRef.current) {
      onSectionView('hero');
    }
  }, []);

  // Generate petals with random properties
  const petals = [...Array(15)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${12 + Math.random() * 8}s`,
    size: 16 + Math.random() * 12,
    color: petalColors[Math.floor(Math.random() * petalColors.length)]
  }));

  const scrollToLayouts = () => {
    document.getElementById('layouts')?.scrollIntoView({ behavior: 'smooth' });
    trackCTA('scroll_to_layouts', { source: 'hero' });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <section ref={sectionRef} className="hero-section">
      {/* Animated gradient background */}
      <div className="hero-bg" />
      
      {/* Subtle grain texture */}
      <div className="hero-grain" />

      {/* Floating rose petals */}
      <div className="hero-petals">
        {petals.map((petal) => (
          <div 
            key={petal.id} 
            className="petal" 
            style={{
              left: petal.left,
              animationDelay: petal.delay,
              animationDuration: petal.duration,
              width: petal.size,
              height: petal.size * 1.3
            }}
          >
            <PetalSVG color={petal.color} />
          </div>
        ))}
      </div>

      {/* Floating decorative elements */}
      <div className="hero-decorations">
        <div className="floating-element float-1">
          <FlowerSVG />
        </div>
        <div className="floating-element float-2">
          <FlowerSVG />
        </div>
        <div className="floating-element float-3">
          <FlowerSVG />
        </div>
        <div className="floating-element float-4">
          <LeafSVG />
        </div>
        <div className="floating-element float-5">
          <LeafSVG />
        </div>
      </div>

      {/* Navigation */}
      <nav className="hero-nav">
        <a href="/" className="nav-logo">
          <span className="logo-icon">
            <RingIcon />
          </span>
          <span className="logo-text">Sacred Vows</span>
        </a>
        
        {/* Desktop Navigation */}
        <div className="nav-links">
          <a href="#layouts">Layouts</a>
          <a href="#how-it-works">How It Works</a>
          <button className="nav-cta" onClick={() => { trackCTA('nav_start_free'); navigate('/signup'); }}>
            <span>Start Free</span>
          </button>
          <button className="nav-login" onClick={() => { trackCTA('nav_sign_in'); navigate('/login'); }}>
            <span>Sign In</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <a href="#layouts" onClick={() => { closeMobileMenu(); trackCTA('mobile_nav_layouts'); }}>Layouts</a>
        <a href="#how-it-works" onClick={() => { closeMobileMenu(); trackCTA('mobile_nav_how'); }}>How It Works</a>
        <button className="nav-cta" onClick={() => { closeMobileMenu(); trackCTA('mobile_nav_start_free'); navigate('/signup'); }}>
          <span>Start Free</span>
        </button>
        <button className="nav-login" onClick={() => { closeMobileMenu(); trackCTA('mobile_nav_sign_in'); navigate('/login'); }}>
          <span>Sign In</span>
        </button>
      </div>

      {/* Main Hero Content */}
      <div className="hero-main">
        <div className={`hero-content ${mounted ? 'mounted' : ''}`}>
          <p className="hero-tagline">Digital Wedding Invitations</p>
          <h1 className="hero-title">
            Your Love Story Deserves
            <span className="title-accent">A Beautiful Beginning</span>
          </h1>
          <p className="hero-subtitle">
            Create stunning, personalized digital wedding invitations that capture the 
            magic of your special day. Share your joy with loved ones through beautiful, 
            interactive designs they'll treasure forever.
          </p>
          <div className="hero-cta">
            <button className="cta-primary" onClick={() => { trackCTA('hero_start_free'); navigate('/signup'); }}>
              <span>Start Creating Free</span>
              <span className="cta-arrow">→</span>
            </button>
            <button className="cta-secondary" onClick={scrollToLayouts}>
              View Layouts
            </button>
          </div>
          <p className="hero-trust">Private links, no spam. Live preview before sharing.</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Invitations Created</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Beautiful Layouts</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">98%</span>
              <span className="stat-label">Happy Couples</span>
            </div>
          </div>
        </div>

        {/* Hero Showcase - 3D Invitation Card */}
        <div className={`hero-showcase ${mounted ? 'mounted' : ''}`}>
          <div className="hero-showcase-meta">
            <span className="live-pill">Live preview</span>
            <span className="hero-meta-copy">See changes instantly</span>
          </div>
          <div className="showcase-wrapper">
            <div className="showcase-card">
              <div className="showcase-inner">
                <div className="showcase-ornament">
                  <OrnamentSVG />
                </div>
                <div className="showcase-names">Priya</div>
                <div className="showcase-and">&</div>
                <div className="showcase-names">Rahul</div>
                <div className="showcase-date">December 15, 2025</div>
                <div className="showcase-venue">The Grand Palace, Mumbai</div>
                <div className="showcase-ornament" style={{ transform: 'rotate(180deg)' }}>
                  <OrnamentSVG />
                </div>
              </div>
            </div>
            <div className="showcase-glow" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator" onClick={scrollToLayouts}>
        <span>Discover More</span>
        <div className="scroll-arrow">↓</div>
      </div>
    </section>
  );
}

export default HeroSection;
