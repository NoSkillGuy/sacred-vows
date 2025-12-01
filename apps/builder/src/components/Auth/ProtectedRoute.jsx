import { useEffect, useState } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { isAuthenticated, getCurrentUserFromAPI } from '../../services/authService';

// Handle OAuth callback token
function handleOAuthToken(token) {
  if (token) {
    localStorage.setItem('auth_token', token);
    // Clean the URL
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, '', url.pathname);
    return true;
  }
  return false;
}

function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      // Check for OAuth callback token in URL
      const oauthToken = searchParams.get('token');
      if (oauthToken) {
        handleOAuthToken(oauthToken);
      }

      if (!isAuthenticated()) {
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      try {
        // Verify token is still valid by fetching user
        await getCurrentUserFromAPI();
        setIsValid(true);
      } catch {
        // Token is invalid
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [searchParams]);

  if (isChecking) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner">
          <div className="spinner-ring"></div>
          <span>💒</span>
        </div>
        <p>Loading your workspace...</p>
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
          .auth-loading-spinner span {
            font-size: 2rem;
            animation: pulse 1.5s ease-in-out infinite;
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
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .auth-loading p {
            font-size: 1rem;
            color: #7a7a7a;
          }
        `}</style>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;

