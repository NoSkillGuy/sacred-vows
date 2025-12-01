import { useNavigate } from 'react-router-dom';

// Floating petal SVG
const FloatingPetal = ({ style }) => (
  <div className="cta-petal" style={style}>
    <svg viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="30" height="40">
      <path d="M15 0C15 0 30 12 30 25C30 33 23.284 40 15 40C6.716 40 0 33 0 25C0 12 15 0 15 0Z" />
    </svg>
  </div>
);

function CTASection() {
  const navigate = useNavigate();

  // Generate floating petals
  const petals = [
    { top: '10%', left: '5%', animationDelay: '0s' },
    { top: '20%', right: '10%', animationDelay: '2s' },
    { bottom: '15%', left: '8%', animationDelay: '4s' },
    { top: '40%', right: '5%', animationDelay: '1s' },
    { bottom: '30%', right: '15%', animationDelay: '3s' },
    { top: '60%', left: '3%', animationDelay: '5s' },
  ];

  return (
    <section className="cta-section">
      {/* Background pattern */}
      <div className="cta-bg-pattern" />
      
      {/* Floating particles */}
      <div className="cta-particles">
        {petals.map((style, index) => (
          <FloatingPetal key={index} style={style} />
        ))}
      </div>
      
      {/* Central glow effect */}
      <div className="cta-glow" />

      <div className="cta-content">
        <h2 className="cta-title">
          Ready to Begin
          <span className="cta-title-accent">Your Forever?</span>
        </h2>
        <p className="cta-subtitle">
          Join thousands of couples who have created their perfect wedding 
          invitation with Sacred Vows. Start for free and make your love story shine.
        </p>
        <button className="cta-button" onClick={() => navigate('/signup')}>
          <span>Create Your Invitation</span>
          <span className="cta-button-arrow">→</span>
        </button>

        <div className="cta-trust">
          <div className="trust-item">
            <span className="trust-number">10,000+</span>
            <span className="trust-label">Invitations Created</span>
          </div>
          <div className="trust-item">
            <span className="trust-number">50+</span>
            <span className="trust-label">Templates Available</span>
          </div>
          <div className="trust-item">
            <span className="trust-number">4.9/5</span>
            <span className="trust-label">Customer Rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
