function Couple({ translations, currentLang }) {
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
            {translations['couple.together'] || 'Together, Capt Dr. Priya and Dr. Saurabh look forward to beginning this beautiful journey with your blessings and presence.'}
          </p>
          <div className="couple-grid">
            <div>
              <h3 className="headline">{translations['couple.bride'] || 'The Bride'}</h3>
              <p className="muted">
                <strong>Capt Dr. Priya Singh</strong><br />
                <span className="relation-label">{translations['couple.daughter'] || 'Daughter of'}</span> <strong>Mrs. Geeta Singh</strong> & <strong>Mr. Sanjay Kumar Singh</strong>.
              </p>

              <div className="person-block">
                <div className="person-role">{translations['couple.mother'] || 'Mother'}</div>
                <div className="person-name">Mrs. Geeta Singh</div>
              </div>
              <div className="person-block">
                <div className="person-role">{translations['couple.father'] || 'Father'}</div>
                <div className="person-name">Mr. Sanjay Kumar Singh</div>
              </div>

              <div className="portrait-frame">
                <div className="portrait-inner">
                  <img src="/assets/photos/bride/1.jpeg" alt="Bride - Capt Dr. Priya Singh" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="headline">{translations['couple.groom'] || 'The Groom'}</h3>
              <p className="muted">
                <strong>Dr. Saurabh Singh</strong><br />
                <span className="relation-label">{translations['couple.son'] || 'Son of'}</span> <strong>Mrs. Vibha Singh</strong> & <strong>Mr. Ashok Kumar Singh</strong>.
              </p>

              <div className="person-block">
                <div className="person-role">{translations['couple.mother'] || 'Mother'}</div>
                <div className="person-name">Mrs. Vibha Singh</div>
              </div>
              <div className="person-block">
                <div className="person-role">{translations['couple.father'] || 'Father'}</div>
                <div className="person-name">Mr. Ashok Kumar Singh</div>
              </div>

              <div className="portrait-frame">
                <div className="portrait-inner">
                  <img src="/assets/photos/groom/1.jpeg" alt="Groom - Dr. Saurabh Singh" />
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

