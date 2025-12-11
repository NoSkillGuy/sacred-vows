function Couple({ translations, currentLang, config = {} }) {
  const couple = config.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  
  const brideName = bride.name || 'Capt (Dr) Priya Singh';
  const brideTitle = bride.title || 'Capt (Dr)';
  const brideMother = bride.parents?.mother || 'Mrs. Geeta Singh';
  const brideFather = bride.parents?.father || 'Mr. Sanjay Kumar Singh';
  const brideImage = bride.image || '/assets/photos/bride/1.jpeg';
  
  const groomName = groom.name || 'Dr Saurabh Singh';
  const groomTitle = groom.title || 'Dr';
  const groomMother = groom.parents?.mother || 'Mrs. Vibha Singh';
  const groomFather = groom.parents?.father || 'Mr. Ashok Kumar Singh';
  const groomImage = groom.image || '/assets/photos/groom/1.jpeg';
  
  const togetherText = translations['couple.together'] || `Together, ${brideName} and ${groomName} look forward to beginning this beautiful journey with your blessings and presence.`;

  return (
    <section id="couple">
      <div className="section-header">
        <div className="section-eyebrow">{translations['couple.eyebrow'] || 'Couple & Families'}</div>
        <div className="section-title">{translations['couple.title'] || 'In Honoured Union'}</div>
        <div className="section-subtitle">
          {translations['couple.subtitle'] || 'With immense joy, the families invite you to join them in celebrating the union of their children.'}
        </div>
      </div>

      <div className="card">
        <div className="card-inner">
          <p className="muted" style={{ marginBottom: '20px', textAlign: 'center' }}>
            {togetherText}
          </p>
          <div className="couple-grid">
            <div>
              <h3 className="headline">{translations['couple.bride'] || 'The Bride'}</h3>
              <p className="muted">
                <strong>{brideName}</strong><br />
                <span className="relation-label">{translations['couple.daughter'] || 'Daughter of'}</span> <strong>{brideMother}</strong> & <strong>{brideFather}</strong>.
              </p>

              <div className="person-block">
                <div className="person-role">{translations['couple.mother'] || 'Mother'}</div>
                <div className="person-name">{brideMother}</div>
              </div>
              <div className="person-block">
                <div className="person-role">{translations['couple.father'] || 'Father'}</div>
                <div className="person-name">{brideFather}</div>
              </div>

              <div className="portrait-frame">
                <div className="portrait-inner">
                  <img src={brideImage} alt={`Bride - ${brideName}`} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="headline">{translations['couple.groom'] || 'The Groom'}</h3>
              <p className="muted">
                <strong>{groomName}</strong><br />
                <span className="relation-label">{translations['couple.son'] || 'Son of'}</span> <strong>{groomMother}</strong> & <strong>{groomFather}</strong>.
              </p>

              <div className="person-block">
                <div className="person-role">{translations['couple.mother'] || 'Mother'}</div>
                <div className="person-name">{groomMother}</div>
              </div>
              <div className="person-block">
                <div className="person-role">{translations['couple.father'] || 'Father'}</div>
                <div className="person-name">{groomFather}</div>
              </div>

              <div className="portrait-frame">
                <div className="portrait-inner">
                  <img src={groomImage} alt={`Groom - ${groomName}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Couple;

