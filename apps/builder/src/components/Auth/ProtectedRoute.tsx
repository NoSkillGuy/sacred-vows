import { useEffect, useState, useRef, ReactNode } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import {
  isAuthenticated,
  getCurrentUserFromAPI,
  refreshAccessToken,
} from "../../services/authService";
import { setAccessToken } from "../../services/tokenStorage";

interface ProtectedRouteProps {
  children: ReactNode;
}

// Handle OAuth callback token
function handleOAuthToken(token: string): boolean {
  if (token) {
    // Store access token in memory (not localStorage)
    setAccessToken(token);
    // Clean the URL
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url.pathname);
    return true;
  }
  return false;
}

function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isMountedRef = useRef(true);
  const checkInProgressRef = useRef(false);

  useEffect(() => {
    // Prevent multiple concurrent checks
    if (checkInProgressRef.current) {
      return;
    }

    checkInProgressRef.current = true;
    isMountedRef.current = true;

    // Set a timeout fallback to ensure setIsChecking(false) always runs
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        setIsValid(false);
        setIsChecking(false);
        checkInProgressRef.current = false;
      }
    }, 10000); // 10 second timeout

    const checkAuth = async (): Promise<void> => {
      // Check for OAuth callback token in URL
      const oauthToken = searchParams.get("token");
      if (oauthToken) {
        handleOAuthToken(oauthToken);
      }

      // If no access token, try to refresh using refresh token from cookie
      const authenticated = isAuthenticated();
      if (!authenticated) {
        try {
          await refreshAccessToken();
        } catch (_refreshError) {
          if (isMountedRef.current) {
            setIsValid(false);
            setIsChecking(false);
            checkInProgressRef.current = false;
            clearTimeout(timeoutId);
          }
          return;
        }
      }

      try {
        await getCurrentUserFromAPI();
        if (isMountedRef.current) {
          setIsValid(true);
        }
      } catch (_error) {
        if (isMountedRef.current) {
          setIsValid(false);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMountedRef.current) {
          setIsChecking(false);
          checkInProgressRef.current = false;
        }
      }
    };

    checkAuth();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      checkInProgressRef.current = false;
      clearTimeout(timeoutId);
    };
  }, [searchParams, location.pathname]);

  if (isChecking) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner">
          <div className="spinner-ring"></div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "2rem", height: "2rem", color: "#e8b4b8" }}
          >
            <circle cx="8" cy="15" r="5" />
            <circle cx="16" cy="15" r="5" />
            <path d="M8 10a5 5 0 0 1 8 0" />
          </svg>
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
          .auth-loading-spinner svg {
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

  return <>{children}</>;
}

export default ProtectedRoute;
