import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getInvitations, deleteInvitation, updateInvitation } from '../../services/invitationService';
import { getCurrentUser, logout } from '../../services/authService';
import { useToast } from '../Toast/ToastProvider';
import EditableText from '../WYSIWYG/EditableText';
import './Dashboard.css';

// SVG Icons
const RingsIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2.5" fill="none"/>
    <circle cx="20" cy="8" r="3" fill="currentColor"/>
    <path d="M17 8L20 3L23 8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const InvitationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    <path d="M18 15.28c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2"/>
    <path d="M20 22v.01"/>
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const HeartIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const WELCOME_TOAST_KEY_PREFIX = 'sv_welcome_toast_shown';
const WELCOME_TOAST_DELAY_MS = 280;

function Dashboard() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadInvitations();
    loadUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadInvitations() {
    try {
      setLoading(true);
      const data = await getInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setLoading(false);
    }
  }

  function loadUser() {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this invitation?')) return;
    
    try {
      await deleteInvitation(id);
      setInvitations(invitations.filter(inv => inv.id !== id));
    } catch (error) {
      console.error('Failed to delete invitation:', error);
      alert('Failed to delete invitation. Please try again.');
    }
  }

  function getWelcomeToastKey(currentUser) {
    const identifier = currentUser?.id || currentUser?.email || currentUser?.name || 'guest';
    return `${WELCOME_TOAST_KEY_PREFIX}_${identifier}`;
  }

  function handleLogout() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(getWelcomeToastKey(user));
    }
    logout();
    navigate('/login');
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function getFirstName(name) {
    if (!name) return 'there';
    return name.trim().split(' ')[0] || 'there';
  }

  function truncateLabel(text, maxLength = 28) {
    if (!text) return '';
    return text.length <= maxLength ? text : `${text.slice(0, maxLength - 3)}...`;
  }

  function getToastDurationMs() {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches) {
      return 5000;
    }
    return 6000;
  }

  async function handleInvitationTitleUpdate(id, newTitle) {
    const trimmedTitle = newTitle?.trim() || 'Untitled Invitation';
    const previousInvitations = invitations;

    // Optimistically update UI
    setInvitations(prev => prev.map(inv => (
      inv.id === id ? { ...inv, title: trimmedTitle } : inv
    )));

    try {
      await updateInvitation(id, { title: trimmedTitle });
    } catch (error) {
      console.error('Failed to update invitation title:', error);
      alert('Could not update the invitation name. Please try again.');
      // Revert on failure
      setInvitations(previousInvitations);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  // Calculate stats
  const totalInvitations = invitations.length;
  const publishedCount = invitations.filter(inv => inv.status === 'published').length;
  const draftCount = invitations.filter(inv => inv.status === 'draft').length;

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (typeof sessionStorage === 'undefined') return;

    const toastKey = getWelcomeToastKey(user);
    if (sessionStorage.getItem(toastKey)) return;

    const firstName = getFirstName(user.name);
    const displayName = truncateLabel(firstName);
    const fullLine = `${firstName} — Everything you need to wow your guests.`;
    const displayLine = `${displayName} — Everything you need to wow your guests.`;

    const timer = setTimeout(() => {
      addToast({
        title: 'Welcome back',
        description: displayLine,
        tooltip: fullLine,
        duration: getToastDurationMs(),
        icon: 'heart',
        tone: 'info',
        ariaLive: 'polite',
      });
      sessionStorage.setItem(toastKey, 'true');
    }, WELCOME_TOAST_DELAY_MS);

    return () => clearTimeout(timer);
  }, [addToast, loading, user]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="page-loading">
            <div className="page-loading-spinner">
              <RingsIcon />
            </div>
            <p>Loading your invitations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <Link to="/" className="header-logo">
              <div className="header-logo-icon">
                <RingsIcon />
              </div>
              <span className="header-logo-text">Sacred Vows</span>
            </Link>
          </div>

          <div className="header-actions">
            <Link to="/layouts" className="btn btn-primary">
              <PlusIcon />
              <span>New Invitation</span>
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

        <div className="dashboard-quickstart">
          <div className="quickstart-copy">
            <p className="section-label">Quick start</p>
            <h2>Launch your invitation in 3 steps</h2>
            <p className="section-subtitle">Pick a layout, add details, share your link.</p>
          </div>
          <div className="quickstart-actions">
            <button className="btn btn-primary" onClick={() => navigate('/layouts')}>
              <PlusIcon />
              Choose layout
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              <EyeIcon />
              Preview later
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/layouts')}>
              See examples
            </button>
          </div>
        </div>

        {/* Stats */}
        {totalInvitations > 0 && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon gold">
                <InvitationIcon />
              </div>
              <div className="stat-content">
                <h3>{totalInvitations}</h3>
                <p>Total Invitations</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon sage">
                <GlobeIcon />
              </div>
              <div className="stat-content">
                <h3>{publishedCount}</h3>
                <p>Published</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon rose">
                <EditIcon />
              </div>
              <div className="stat-content">
                <h3>{draftCount}</h3>
                <p>Drafts</p>
              </div>
            </div>
          </div>
        )}

        {/* Invitations */}
        {totalInvitations === 0 ? (
          <div className="dashboard-empty">
            <HeartIcon className="dashboard-empty-icon" />
            <h3>No Invitations Yet</h3>
            <p>Start creating your beautiful wedding invitation. Choose from our premium layouts.</p>
            <Link to="/layouts" className="btn btn-primary">
              <PlusIcon />
              Create Your First Invitation
            </Link>
          </div>
        ) : (
          <>
            <div className="section-header">
              <h2>Your Invitations</h2>
            </div>
            
            <div className="invitations-grid">
              {/* Create New Card */}
              <Link to="/layouts" className="create-new-card">
                <div className="create-new-icon">
                  <PlusIcon />
                </div>
                <span className="create-new-text">Create New</span>
                <span className="create-new-subtext">Start from a layout</span>
              </Link>
              
              {/* Invitation Cards */}
              {invitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onEdit={() => navigate(`/builder/${invitation.id}`)}
                  onDelete={() => handleDelete(invitation.id)}
                  onTitleUpdate={handleInvitationTitleUpdate}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InvitationCard({ invitation, onEdit, onDelete, onTitleUpdate, formatDate }) {
  const { id, title, data, status, layoutId, createdAt } = invitation;
  
  // Extract couple names from data if available (used as fallback)
  const coupleData = data?.couple || {};
  const fallbackCoupleName = coupleData.bride && coupleData.groom 
    ? `${coupleData.bride} & ${coupleData.groom}`
    : 'Untitled Invitation';
  const displayTitle = title?.trim() || fallbackCoupleName;
  
  const weddingDate = data?.weddingDate || createdAt;

  return (
    <article className="invitation-card">
      <div className="invitation-preview">
        {/* Preview placeholder - could be an actual preview image */}
        <div className="layout-preview-placeholder" style={{ display: 'flex' }}>
          <RingsIcon />
        </div>
        <span className={`invitation-status ${status || 'draft'}`}>
          {status || 'Draft'}
        </span>
      </div>
      
      <div className="invitation-info">
        <EditableText
          value={displayTitle}
          onUpdate={(path, value) => onTitleUpdate?.(id, value)}
          path={`invitations.${id}.title`}
          className="invitation-couple"
          tag="h3"
          placeholder="Click to name your invitation"
        />
        <div className="invitation-date">
          <CalendarIcon />
          {formatDate(weddingDate)}
        </div>
        <div className="invitation-layout">
          Layout: {layoutId || 'Classic Scroll'}
        </div>
        
        <div className="invitation-actions">
          <button className="btn btn-primary" onClick={onEdit}>
            <EditIcon />
            Edit
          </button>
          <button className="btn btn-secondary" onClick={onEdit}>
            <EyeIcon />
            Preview
          </button>
          <button 
            className="btn btn-icon btn-secondary" 
            onClick={onDelete}
            style={{ flex: 'none' }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

export default Dashboard;

