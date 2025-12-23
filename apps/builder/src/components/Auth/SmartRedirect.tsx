import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getInvitations } from '../../services/invitationService';

/**
 * SmartRedirect Component
 * Redirects users based on their state:
 * - Users with existing invitations → Dashboard
 * - New users (no invitations) → Layout Gallery
 */
function SmartRedirect(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [hasInvitations, setHasInvitations] = useState(false);

  useEffect(() => {
    checkUserState();
  }, []);

  async function checkUserState(): Promise<void> {
    try {
      const invitations = await getInvitations();
      setHasInvitations(invitations && invitations.length > 0);
    } catch (error) {
      console.error('Failed to check user state:', error);
      // Default to layouts if we can't determine state
      setHasInvitations(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner">
          <div className="spinner-ring"></div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '2rem', height: '2rem', color: '#e8b4b8' }}>
            <circle cx="8" cy="15" r="5"/>
            <circle cx="16" cy="15" r="5"/>
            <path d="M8 10a5 5 0 0 1 8 0"/>
          </svg>
        </div>
        <p>Preparing your workspace...</p>
        <style>{`
          .auth-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #fef1f0 0%, #fffaf5 50%, #f5e6d3 100%);
            font-family: 'Quicksand', sans-serif;
            color: #4a4a4a;
          }
          .auth-loading-spinner {
            position: relative;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
          }
          .spinner-ring {
            position: absolute;
            inset: 0;
            border: 3px solid #e8b4b8;
            border-top-color: #d4af37;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .auth-loading p {
            font-size: 1rem;
            color: #7a7a7a;
          }
        `}</style>
      </div>
    );
  }

  // Redirect based on user state
  return <Navigate to={hasInvitations ? '/dashboard' : '/layouts'} replace />;
}

export default SmartRedirect;

