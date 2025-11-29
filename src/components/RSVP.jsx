function RSVP({ onRSVPClick, translations, currentLang }) {
  const handleWhatsAppShare = (e) => {
    e.preventDefault();
    const pageUrl = window.location.href;
    const message = encodeURIComponent(
      (translations['rsvp.whatsapp_share'] || 'You are warmly invited to the wedding of Capt Dr. Priya Singh and Dr. Saurabh Singh on 22 and 23 January 2026 at Royal Lotus View Resotel, Bengaluru.\n\nPlease tap the link to view the full invitation:\n') + pageUrl
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const contacts = [
    { badge: 'RSVP', name: 'Anil Kumar Singh' },
    { badge: 'RSVP', name: 'Arun Kumar Singh' },
    { badge: 'RSVP', name: 'Ashok Kumar Singh' },
    { badge: 'RSVP', name: 'Arvind Kumar Singh' },
    { badge: 'Host', name: 'Siva Praveen Rayapudi' },
    { badge: 'Host', name: 'Pooja Singh' }
  ];

  return (
    <section id="rsvp">
      <div className="section-header">
        <div className="section-eyebrow">{translations['rsvp.eyebrow'] || 'RSVP'}</div>
        <div className="section-title">{translations['rsvp.title'] || 'With Warm Regards'}</div>
        <div className="section-subtitle">
          {translations['rsvp.subtitle'] || 'Kindly confirm your presence and feel free to reach out for any assistance.'}
        </div>
      </div>

      <div className="card">
        <div className="card-inner">
          <p className="rsvp-text">
            {translations['rsvp.text'] || 'On behalf of both families, you may contact the following for confirmations, travel details, or any other queries:'}
          </p>

          <div className="rsvp-grid">
            {contacts.map((contact, index) => (
              <div key={index} className="rsvp-pill">
                <div className="rsvp-badge">{contact.badge}</div>
                <span>{contact.name}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
            <button className="btn btn-primary" onClick={onRSVPClick}>
              {translations['hero.actions.rsvp'] || 'RSVP Now'}
              <span className="btn-icon">✓</span>
            </button>
            <a
              className="btn btn-ghost"
              href="#"
              onClick={handleWhatsAppShare}
              target="_blank"
              rel="noopener noreferrer"
            >
              {translations['rsvp.share.button'] || 'Share Invitation on WhatsApp'}
            </a>
            <p className="small-note">
              {translations['rsvp.share.note'] || 'You may share this link with friends and family whom you wish to invite.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RSVP;

