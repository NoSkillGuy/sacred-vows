import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { trackCTA } from '../../services/analyticsService';
import PersonalizationModal from './PersonalizationModal';

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

const STORAGE_KEY = 'landing-personalization-data';

// Default values
const DEFAULT_BRIDE_NAME = 'Priya';
const DEFAULT_GROOM_NAME = 'Rahul';
const DEFAULT_DATE = 'December 15, 2025';
const DEFAULT_VENUE = 'The Grand Palace, Mumbai';

// Format date to UPPERCASE format (e.g., "DECEMBER 15, 2025")
function formatDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
  } catch (error) {
    console.error('Date formatting error:', error);
    return null;
  }
}

function HeroSection({ onSectionView }) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [personalizationData, setPersonalizationData] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const sectionRef = useRef(null);
  
  // Refs for input fields
  const brideInputRef = useRef(null);
  const groomInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const venueInputRef = useRef(null);

  // Load personalization data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setPersonalizationData(data);
      } else {
        // Show modal after 15 seconds to give users time to understand the website
        const timer = setTimeout(() => {
          setShowPersonalizationModal(true);
        }, 15000); // 15 seconds delay

        return () => {
          clearTimeout(timer);
        };
      }
    } catch (error) {
      console.error('Failed to load personalization data:', error);
      // Show modal after 15 seconds on error as well
      const timer = setTimeout(() => {
        setShowPersonalizationModal(true);
      }, 15000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    if (onSectionView && sectionRef.current) {
      onSectionView('hero');
    }
  }, []);

  // Handle personalization data save
  const handlePersonalizationSave = (data) => {
    setPersonalizationData(data);
    setShowPersonalizationModal(false);
  };

  // Save personalization data to localStorage
  const savePersonalizationData = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setPersonalizationData(data);
    } catch (error) {
      console.error('Failed to save personalization data:', error);
    }
  };

  // Handle field editing
  const startEditing = (field, currentValue) => {
    setEditingField(field);
    // For date field, use the raw date value if available, otherwise empty string
    if (field === 'weddingDate') {
      setEditValue(currentValue || '');
    } else {
      setEditValue(currentValue || '');
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveField = (field) => {
    if (editingField !== field) return;

    const updatedData = {
      brideName: personalizationData?.brideName || '',
      groomName: personalizationData?.groomName || '',
      weddingDate: personalizationData?.weddingDate || '',
      venue: personalizationData?.venue || '',
      [field]: editValue.trim(),
    };

    savePersonalizationData(updatedData);
    setEditingField(null);
    setEditValue('');
  };

  const handleFieldKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveField(field);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (editingField === 'brideName' && brideInputRef.current) {
      brideInputRef.current.focus();
      brideInputRef.current.select();
    } else if (editingField === 'groomName' && groomInputRef.current) {
      groomInputRef.current.focus();
      groomInputRef.current.select();
    } else if (editingField === 'weddingDate' && dateInputRef.current) {
      dateInputRef.current.focus();
      dateInputRef.current.select();
    } else if (editingField === 'venue' && venueInputRef.current) {
      venueInputRef.current.focus();
      venueInputRef.current.select();
    }
  }, [editingField]);

  // Get display values with fallbacks
  const brideName = personalizationData?.brideName || DEFAULT_BRIDE_NAME;
  const groomName = personalizationData?.groomName || DEFAULT_GROOM_NAME;
  const displayDate = personalizationData?.weddingDate 
    ? formatDate(personalizationData.weddingDate) || DEFAULT_DATE
    : DEFAULT_DATE;
  const venue = personalizationData?.venue || DEFAULT_VENUE;

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
      {/* Personalization Modal */}
      <PersonalizationModal
        isOpen={showPersonalizationModal}
        onClose={() => setShowPersonalizationModal(false)}
        onSave={handlePersonalizationSave}
      />
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
                {editingField === 'brideName' ? (
                  <input
                    ref={brideInputRef}
                    type="text"
                    className="showcase-names showcase-editable-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveField('brideName')}
                    onKeyDown={(e) => handleFieldKeyDown(e, 'brideName')}
                    placeholder={DEFAULT_BRIDE_NAME}
                  />
                ) : (
                  <div 
                    className="showcase-names showcase-editable"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing('brideName', brideName);
                    }}
                    title="Click to edit bride's name"
                  >
                    {brideName}
                  </div>
                )}
                <div className="showcase-and">&</div>
                {editingField === 'groomName' ? (
                  <input
                    ref={groomInputRef}
                    type="text"
                    className="showcase-names showcase-editable-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveField('groomName')}
                    onKeyDown={(e) => handleFieldKeyDown(e, 'groomName')}
                    placeholder={DEFAULT_GROOM_NAME}
                  />
                ) : (
                  <div 
                    className="showcase-names showcase-editable"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing('groomName', groomName);
                    }}
                    title="Click to edit groom's name"
                  >
                    {groomName}
                  </div>
                )}
                {editingField === 'weddingDate' ? (
                  <input
                    ref={dateInputRef}
                    type="date"
                    className="showcase-date showcase-editable-input"
                    value={editValue || ''}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveField('weddingDate')}
                    onKeyDown={(e) => handleFieldKeyDown(e, 'weddingDate')}
                  />
                ) : (
                  <div 
                    className="showcase-date showcase-editable"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing('weddingDate', personalizationData?.weddingDate || '');
                    }}
                    title="Click to edit date"
                  >
                    {displayDate}
                  </div>
                )}
                {editingField === 'venue' ? (
                  <input
                    ref={venueInputRef}
                    type="text"
                    className="showcase-venue showcase-editable-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveField('venue')}
                    onKeyDown={(e) => handleFieldKeyDown(e, 'venue')}
                    placeholder={DEFAULT_VENUE}
                  />
                ) : (
                  <div 
                    className="showcase-venue showcase-editable"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing('venue', venue);
                    }}
                    title="Click to edit venue"
                  >
                    {venue}
                  </div>
                )}
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
