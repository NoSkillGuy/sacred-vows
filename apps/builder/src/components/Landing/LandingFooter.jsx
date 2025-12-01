function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-icon">💍</span>
            <span className="footer-logo-text">Sacred Vows</span>
          </div>
          <p>
            Create beautiful digital wedding invitations that capture the magic 
            of your love story. Share your joy with the world.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Instagram">📷</a>
            <a href="#" className="social-link" aria-label="Pinterest">📌</a>
            <a href="#" className="social-link" aria-label="Facebook">👤</a>
            <a href="#" className="social-link" aria-label="Twitter">🐦</a>
          </div>
        </div>

        <div className="footer-column">
          <h4>Templates</h4>
          <ul>
            <li><a href="#templates">All Templates</a></li>
            <li><a href="#templates">Traditional</a></li>
            <li><a href="#templates">Modern</a></li>
            <li><a href="#templates">Minimal</a></li>
            <li><a href="#templates">Floral</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Press</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Tutorials</a></li>
            <li><a href="#">API</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          © {currentYear} Sacred Vows. Made with ❤️ for couples everywhere.
        </p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;

