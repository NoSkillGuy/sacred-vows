function Footer({ translations, currentLang }) {
  return (
    <footer className="site-footer">
      <div className="footer-main">{translations['footer.compliments'] || 'With Best Compliments'}</div>
      <div className="footer-line">{translations['footer.families'] || 'From the families of Capt (Dr) Priya Singh & Dr Saurabh Singh'}</div>
      <div className="footer-flowers">
        {translations['footer.flowers'] || 'Awaiting eyes • Blooming hearts • Cherished invitations, timeless blessings'}
      </div>
      <div className="footer-mini">
        {translations['footer.waiting'] || 'We look forward to celebrating with you'}
      </div>
    </footer>
  );
}

export default Footer;

