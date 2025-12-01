import { useNavigate } from 'react-router-dom';

function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="cta-section">
      <div className="cta-decorations">
        <div className="cta-flower cta-flower-1">✿</div>
        <div className="cta-flower cta-flower-2">❀</div>
        <div className="cta-flower cta-flower-3">✾</div>
        <div className="cta-flower cta-flower-4">❁</div>
      </div>

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
          Create Your Invitation
          <span>→</span>
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

