import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTemplates, formatPrice } from '../../services/templateService';
import { createInvitation } from '../../services/invitationService';
import { getCurrentUser, logout } from '../../services/authService';
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

const TemplateIcon = () => (
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

function TemplateGallery() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadTemplates();
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

  async function loadTemplates() {
    try {
      setLoading(true);
      const data = await getTemplates({ 
        category: selectedCategory !== 'all' ? selectedCategory : undefined 
      });
      setTemplates(data.templates);
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  }

  function loadUser() {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }

  async function handleSelectTemplate(template) {
    if (!template.isAvailable) return;
    
    try {
      setCreating(template.id);
      const invitation = await createInvitation({
        templateId: template.id,
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
      <div className="template-gallery-page">
        <div className="gallery-container">
          <div className="page-loading">
            <div className="page-loading-spinner">
              <RingsIcon />
            </div>
            <p>Loading beautiful templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="template-gallery-page">
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
          <h2>Choose Your Perfect Template</h2>
          <p>
            Select from our beautifully crafted wedding invitation templates. 
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

        {/* Template Grid */}
        <div className="template-grid">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={handleSelectTemplate}
              isCreating={creating === template.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, onSelect, isCreating }) {
  const {
    id,
    name,
    description,
    price,
    currency,
    previewImage,
    tags,
    isAvailable,
    isComingSoon,
    isFeatured,
  } = template;

  return (
    <article className={`template-card ${isFeatured ? 'featured' : ''}`}>
      {isFeatured && (
        <div className="template-featured-badge">
          <StarIcon />
          Featured
        </div>
      )}
      
      <div className="template-preview">
        {previewImage ? (
          <img 
            src={previewImage} 
            alt={name}
            className="template-preview-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="template-preview-placeholder" style={{ display: previewImage ? 'none' : 'flex' }}>
          <TemplateIcon />
          <span>Preview coming soon</span>
        </div>
        
        {isComingSoon && (
          <div className="template-coming-soon">
            <span className="template-coming-soon-badge">Coming Soon</span>
            <span>We're working on this design</span>
          </div>
        )}
      </div>
      
      <div className="template-info">
        <div className="template-header">
          <h3 className="template-name">{name}</h3>
          <div className="template-price">
            {formatPrice(price, currency)}
          </div>
        </div>
        
        <p className="template-description">{description}</p>
        
        {tags && tags.length > 0 && (
          <div className="template-tags">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="template-tag">{tag}</span>
            ))}
          </div>
        )}
        
        <div className="template-actions">
          <button 
            className="btn btn-primary"
            onClick={() => onSelect(template)}
            disabled={!isAvailable || isCreating}
          >
            {isCreating ? (
              <>
                <span className="loading-spinner" style={{ width: '1rem', height: '1rem' }}></span>
                Creating...
              </>
            ) : isAvailable ? (
              'Select Template'
            ) : (
              'Coming Soon'
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default TemplateGallery;

