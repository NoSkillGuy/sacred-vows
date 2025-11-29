function Footer({ translations, currentLang, config = {} }) {
  // Get custom translations - handle nested paths
  const getTranslation = (key) => {
    let customValue = null;
    if (config?.customTranslations) {
      const keys = key.split('.');
      let current = config.customTranslations;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          current = null;
          break;
        }
      }
      customValue = current || null;
    }
    return customValue || translations[key] || '';
  };

  return (
    <footer className="site-footer">
      <div className="footer-main">{getTranslation('footer.compliments') || 'With Best Compliments'}</div>
      <div className="footer-line">{getTranslation('footer.families') || 'From the families of Capt Dr. Priya Singh & Dr. Saurabh Singh'}</div>
      <div className="footer-flowers">
        {getTranslation('footer.flowers') || 'Awaiting eyes • Blooming hearts • Cherished invitations, timeless blessings'}
      </div>
      <div className="footer-mini">
        {getTranslation('footer.waiting') || 'We look forward to celebrating with you'}
      </div>
    </footer>
  );
}

export default Footer;

