import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function HeroSection() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="hero-section">
      {/* Animated background particles */}
      <div className="hero-particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Floating decorative elements */}
      <div className="hero-decorations">
        <div className="floating-flower flower-1">✿</div>
        <div className="floating-flower flower-2">❀</div>
        <div className="floating-flower flower-3">✾</div>
        <div className="floating-leaf leaf-1">🍃</div>
        <div className="floating-leaf leaf-2">🌿</div>
      </div>

      {/* Navigation */}
      <nav className="hero-nav">
        <div className="nav-logo">
          <span className="logo-icon">💍</span>
          <span className="logo-text">Sacred Vows</span>
        </div>
        <div className="nav-links">
          <a href="#templates">Templates</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <button className="nav-login" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero content */}
      <div className={`hero-content ${mounted ? 'mounted' : ''}`}>
        <p className="hero-tagline">The Modern Way to Share Your Love Story</p>
        <h1 className="hero-title">
          Your Love Story Deserves a 
          <span className="title-accent"> Beautiful Beginning</span>
        </h1>
        <p className="hero-subtitle">
          Create stunning, personalized digital wedding invitations that capture the 
          magic of your special day. Share your joy with the world through beautiful, 
          interactive designs that your guests will treasure forever.
        </p>
        <div className="hero-cta">
          <button className="cta-primary" onClick={() => navigate('/signup')}>
            Start Creating — It's Free
            <span className="cta-arrow">→</span>
          </button>
          <button className="cta-secondary" onClick={() => document.getElementById('templates').scrollIntoView({ behavior: 'smooth' })}>
            View Templates
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">10,000+</span>
            <span className="stat-label">Invitations Created</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-number">50+</span>
            <span className="stat-label">Beautiful Templates</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-number">98%</span>
            <span className="stat-label">Happy Couples</span>
          </div>
        </div>
      </div>

      {/* Hero image showcase */}
      <div className={`hero-showcase ${mounted ? 'mounted' : ''}`}>
        <div className="showcase-frame">
          <div className="showcase-screen">
            <div className="mock-invitation">
              <div className="mock-header">
                <div className="mock-ornament">❧</div>
              </div>
              <div className="mock-names">Priya & Rahul</div>
              <div className="mock-date">December 15, 2025</div>
              <div className="mock-venue">The Grand Palace, Mumbai</div>
              <div className="mock-footer">
                <div className="mock-ornament">❧</div>
              </div>
            </div>
          </div>
          <div className="showcase-reflection" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <span>Discover More</span>
        <div className="scroll-arrow">↓</div>
      </div>
    </section>
  );
}

export default HeroSection;

