import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { login, isAuthenticated, getCurrentUserFromAPI } from "../../services/authService";
import { usePetals } from "./usePetals";
import "./AuthPage.css";

// SVG Icons
const RingIcon = (): JSX.Element => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" stroke="#d4af37" strokeWidth="2.5" fill="none" />
    <circle cx="20" cy="8" r="3" fill="#d4af37" />
    <path d="M17 8L20 3L23 8" stroke="#d4af37" strokeWidth="1.5" fill="none" />
  </svg>
);

const FlowerSVG = (): JSX.Element => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="6" fill="#d4af37" />
    <ellipse cx="30" cy="14" rx="6" ry="10" fill="currentColor" opacity="0.6" />
    <ellipse cx="30" cy="46" rx="6" ry="10" fill="currentColor" opacity="0.6" />
    <ellipse cx="14" cy="30" rx="10" ry="6" fill="currentColor" opacity="0.6" />
    <ellipse cx="46" cy="30" rx="10" ry="6" fill="currentColor" opacity="0.6" />
  </svg>
);

const LeafSVG = (): JSX.Element => (
  <svg viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 0C20 0 40 15 40 35C40 48.807 31.046 60 20 60C8.954 60 0 48.807 0 35C0 15 20 0 20 0Z"
      fill="currentColor"
    />
    <path d="M20 10V55" stroke="white" strokeWidth="1" opacity="0.3" />
  </svg>
);

interface PetalSVGProps {
  color?: string;
}

const PetalSVG = ({ color = "#e8b4b8" }: PetalSVGProps): JSX.Element => (
  <svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 0C12 0 24 10 24 20C24 26.627 18.627 32 12 32C5.373 32 0 26.627 0 20C0 10 12 0 12 0Z"
      fill={color}
      opacity="0.7"
    />
  </svg>
);

function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Generate petals once per mount to avoid animation resets
  const petals = usePetals(10);

  // Check for OAuth error in URL params
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      const errorMessages: Record<string, string> = {
        no_code: "Google OAuth did not return an authorization code. Please try again.",
        oauth_failed: "Google OAuth authentication failed. Please try again.",
        token_failed: "Failed to generate authentication token. Please try again.",
      };
      setError(errorMessages[oauthError] || "OAuth authentication failed. Please try again.");
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams]);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      if (isAuthenticated()) {
        try {
          // Verify token is still valid
          await getCurrentUserFromAPI();
          // If valid, redirect to app
          navigate("/app", { replace: true });
        } catch (error) {
          // Token is invalid, stay on login page
          console.error("Token validation failed:", error);
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      navigate("/app");
    } catch (err) {
      setError((err as Error).message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = (): void => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg" />
      <div className="auth-grain" />

      {/* Floating decorations */}
      <div className="auth-decorations">
        {petals.map((petal) => (
          <div
            key={petal.id}
            className="auth-petal"
            style={{
              left: petal.left,
              animationDelay: petal.delay,
              animationDuration: petal.duration,
              width: petal.size,
              height: petal.size * 1.3,
            }}
          >
            <PetalSVG color={petal.color} />
          </div>
        ))}
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

      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-icon">
            <RingIcon />
          </span>
          <span className="auth-logo-text">Sacred Vows</span>
        </Link>

        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue creating your beautiful invitation</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="auth-input"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="auth-input"
                required
              />
            </div>

            <div className="auth-options">
              <label className="auth-remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-forgot">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              <span>{loading ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <button className="auth-google" onClick={handleGoogleLogin}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/signup">Create one for free</Link>
          </p>
        </div>

        <p className="auth-footer-text">
          By signing in, you agree to our <a href="#">Terms of Service</a> and{" "}
          <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
