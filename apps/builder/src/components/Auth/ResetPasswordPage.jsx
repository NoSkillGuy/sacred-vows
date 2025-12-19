import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import { usePetals } from './usePetals';
import './AuthPage.css';

// SVG Icons
const RingIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" stroke="#d4af37" strokeWidth="2.5" fill="none"/>
    <circle cx="20" cy="8" r="3" fill="#d4af37"/>
    <path d="M17 8L20 3L23 8" stroke="#d4af37" strokeWidth="1.5" fill="none"/>
  </svg>
);

const FlowerSVG = () => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="6" fill="#d4af37"/>
    <ellipse cx="30" cy="14" rx="6" ry="10" fill="currentColor" opacity="0.6"/>
    <ellipse cx="30" cy="46" rx="6" ry="10" fill="currentColor" opacity="0.6"/>
    <ellipse cx="14" cy="30" rx="10" ry="6" fill="currentColor" opacity="0.6"/>
    <ellipse cx="46" cy="30" rx="10" ry="6" fill="currentColor" opacity="0.6"/>
  </svg>
);

const LeafSVG = () => (
  <svg viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M20 0C20 0 40 15 40 35C40 48.807 31.046 60 20 60C8.954 60 0 48.807 0 35C0 15 20 0 20 0Z" 
      fill="currentColor"
    />
    <path d="M20 10V55" stroke="white" strokeWidth="1" opacity="0.3"/>
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

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  // Generate petals once per mount to avoid animation resets
  const petals = usePetals(10);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please try again.');
      setLoading(false);
      return;
    }

    // Validate password strength (basic check)
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(token, formData.password);
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired or is invalid.');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return null; // Still loading token
  }

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
              height: petal.size * 1.3
            }}
          >
            <PetalSVG color={petal.color} />
          </div>
        ))}
        <div className="floating-element float-1"><FlowerSVG /></div>
        <div className="floating-element float-2"><FlowerSVG /></div>
        <div className="floating-element float-3"><FlowerSVG /></div>
        <div className="floating-element float-4"><LeafSVG /></div>
        <div className="floating-element float-5"><LeafSVG /></div>
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
            <h1 className="auth-title">Reset Your Password</h1>
            <p className="auth-subtitle">Enter your new password below</p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div className="auth-success" style={{ 
              background: 'var(--sage-light)', 
              color: 'var(--sage-dark)', 
              padding: '1rem', 
              borderRadius: '10px', 
              marginBottom: '1rem',
              border: '1px solid var(--sage)'
            }}>
              Password reset successfully! Redirecting to login...
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="password" className="auth-label">New Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  className="auth-input"
                  required
                  autoComplete="new-password"
                  minLength="8"
                  aria-describedby={error ? "password-error" : undefined}
                  aria-invalid={error ? "true" : "false"}
                />
                {error && <span id="password-error" className="sr-only" role="alert">{error}</span>}
              </div>

              <div className="auth-field">
                <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  className="auth-input"
                  required
                  autoComplete="new-password"
                  minLength="8"
                />
              </div>

              <button 
                type="submit" 
                className="auth-submit"
                disabled={loading || !token}
              >
                <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
              </button>
            </form>
          )}

          <p className="auth-switch">
            Remember your password?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>

        <p className="auth-footer-text">
          By using this service, you agree to our{' '}
          <a href="#">Terms of Service</a> and{' '}
          <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;



