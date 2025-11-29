function FathersLetter({ translations, currentLang }) {
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

  const bodyText = (translations['father.body'] || '').replace('{name}', displayName);

  return (
    <section id="fathers-letter">
      <div className="section-header">
        <div className="section-eyebrow">{translations['father.eyebrow'] || "From Priya's Father"}</div>
        <div className="section-title">{translations['father.title'] || 'A Few Words From the Heart'}</div>
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

