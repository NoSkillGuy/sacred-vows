import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getLayouts } from '../../services/layoutService';
import { createInvitation } from '../../services/invitationService';
import { getCurrentUser, logout } from '../../services/authService';
import LayoutCardUnified from '../Layouts/LayoutCardUnified';
import './Dashboard.css';

// SVG Icons
const RingsIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2.5" fill="none"/>
    <circle cx="20" cy="8" r="3" fill="currentColor"/>
    <path d="M17 8L20 3L23 8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const LayoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18"/>
    <path d="M9 21V9"/>
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9"/>
    <rect x="14" y="3" width="7" height="5"/>
    <rect x="14" y="12" width="7" height="9"/>
    <rect x="3" y="16" width="7" height="5"/>
  </svg>
);

function LayoutGallery() {
  const navigate = useNavigate();
  const [layouts, setLayouts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(null);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadLayouts();
    loadUser();
  }, [selectedCategory]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadLayouts() {
    try {
      setLoading(true);
      setError(null);
      const data = await getLayouts({ 
        category: selectedCategory !== 'all' ? selectedCategory : undefined 
      });
      setLayouts(data?.layouts || []);
      setCategories(data?.categories || ['all']);
    } catch (error) {
      console.error('Failed to load layouts:', error);
      setError(error.message || 'Failed to load layouts. Please try again.');
      setLayouts([]);
      setCategories(['all']);
    } finally {
      setLoading(false);
    }
  }

  function loadUser() {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }

  async function handleSelectLayout(layout) {
    if (!layout.isAvailable) return;
    
    try {
      setCreating(layout.id);
      const invitation = await createInvitation({
        layoutId: layout.id,
        title: 'My Wedding Invitation',
      });
      navigate(`/builder/${invitation.id}`);
    } catch (error) {
      console.error('Failed to create invitation:', error);
      alert('Failed to create invitation. Please try again.');
    } finally {
      setCreating(null);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  if (loading) {
    return (
      <div className="layout-gallery-page">
        <div className="gallery-container">
          <div className="page-loading">
            <div className="page-loading-spinner">
              <RingsIcon />
            </div>
            <p>Loading beautiful layouts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-gallery-page">
      <div className="gallery-container">
        {/* Header */}
        <header className="gallery-header">
          <div className="header-left">
            <Link to="/" className="header-logo">
              <div className="header-logo-icon">
                <RingsIcon />
              </div>
              <span className="header-logo-text">Sacred Vows</span>
            </Link>
          </div>
          
          <div className="header-actions">
            <Link to="/dashboard" className="btn btn-secondary">
              <DashboardIcon />
              <span>My Invitations</span>
            </Link>
            
            <div className="user-menu" ref={dropdownRef}>
              <div 
                className="user-avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {getInitials(user?.name)}
              </div>
              
              <div className={`user-dropdown ${dropdownOpen ? 'open' : ''}`}>
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{user?.name || 'Guest'}</div>
                  <div className="user-dropdown-email">{user?.email || ''}</div>
                </div>
                <button className="user-dropdown-item logout" onClick={handleLogout}>
                  <LogoutIcon />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Intro */}
        <div className="gallery-intro">
          <h2>Choose Your Perfect Layout</h2>
          <p>
            Select from our beautifully crafted wedding invitation layouts. 
            Each design is customizable to match your unique love story.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="gallery-error">
            <div className="error-icon">⚠️</div>
            <h3>Unable to Load Layouts</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadLayouts}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && !loading && layouts.length === 0 && (
          <div className="gallery-empty">
            <div className="empty-icon">
              <LayoutIcon />
            </div>
            <h3>No Layouts Available</h3>
            <p>There are no layouts available at the moment. Please check back later.</p>
          </div>
        )}

        {/* Layout Grid */}
        {!error && layouts.length > 0 && (
          <div className="layout-grid">
            {layouts.map((layout) => {
              const isCreating = creating === layout.id;
              const isReady = layout.status === 'ready' || layout.isAvailable;
              return (
                <LayoutCardUnified
                  key={layout.id}
                  layout={layout}
                  onPrimaryAction={handleSelectLayout}
                  primaryLabel={isCreating ? 'Creating...' : isReady ? 'Select Layout' : 'Coming Soon'}
                  primaryDisabled={!isReady || isCreating}
                  primaryLoading={isCreating}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LayoutGallery;

