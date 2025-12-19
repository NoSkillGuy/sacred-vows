import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestPasswordReset } from '../../services/authService';
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

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generate petals once per mount to avoid animation resets
  const petals = usePetals(10);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtitle">Enter your email address and we'll send you a link to reset your password</p>
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
              If an account with that email exists, we've sent a password reset link. Please check your email.
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="email" className="auth-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="auth-input"
                  required
                  autoComplete="email"
                  aria-describedby={error ? "email-error" : undefined}
                  aria-invalid={error ? "true" : "false"}
                />
                {error && <span id="email-error" className="sr-only" role="alert">{error}</span>}
              </div>

              <button 
                type="submit" 
                className="auth-submit"
                disabled={loading}
              >
                <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/login" className="auth-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
                <span>Back to Login</span>
              </Link>
            </div>
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

export default ForgotPasswordPage;



