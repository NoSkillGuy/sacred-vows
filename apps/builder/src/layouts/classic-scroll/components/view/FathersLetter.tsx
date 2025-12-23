function FathersLetter({ translations, currentLang, config = {} }) {
  const storedName = localStorage.getItem('wedding-guest-name');
  const storedTitle = localStorage.getItem('wedding-guest-title') || '';
  const fallbackName = currentLang === 'hi'
    ? 'परिवार सदस्य और आदरणीय अतिथि'
    : currentLang === 'te'
    ? 'కుటుంబ సభ్యుడు మరియు గౌరవనీయ అతిథి'
    : 'family member and respected guest';
  
  let displayName = (storedName && storedName.trim()) || fallbackName;
  if (storedName && storedName.trim() && storedTitle.trim()) {
    displayName = `${storedTitle.trim()} ${storedName.trim()}`;
  }

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

  const bodyText = (getTranslation('father.body') || '').replace('{name}', displayName);

  return (
    <section id="fathers-letter">
      <div className="section-header">
        <div className="section-eyebrow">{getTranslation('father.eyebrow') || "From Priya's Father"}</div>
        <div className="section-title">{getTranslation('father.title') || 'A Few Words From the Heart'}</div>
      </div>

      <div className="card">
        <div className="card-inner">
          <p className="muted" style={{ whiteSpace: 'pre-line' }}>
            {bodyText}
          </p>
        </div>
      </div>
    </section>
  );
}

export default FathersLetter;

