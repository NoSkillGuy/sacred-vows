function RSVP({ onRSVPClick, translations, currentLang, config = {} }) {
  const rsvp = config.rsvp || {};
  const contacts = rsvp.contacts || [
    { badge: 'RSVP', name: 'Anil Kumar Singh' },
    { badge: 'RSVP', name: 'Arun Kumar Singh' },
    { badge: 'RSVP', name: 'Ashok Kumar Singh' },
    { badge: 'RSVP', name: 'Arvind Kumar Singh' },
    { badge: 'Host', name: 'Siva Praveen Rayapudi' },
    { badge: 'Host', name: 'Pooja Singh' }
  ];
  
  const couple = config.couple || {};
  const wedding = config.wedding || {};
  const brideName = couple.bride?.name || 'Capt (Dr) Priya Singh';
  const groomName = couple.groom?.name || 'Dr Saurabh Singh';
  const dates = wedding.dates || ['2026-01-22', '2026-01-23'];
  const venue = wedding.venue || {};
  const venueName = venue.name || 'Royal Lotus View Resotel';
  const venueCity = venue.city || 'Bengaluru';
  
  const formatDates = (dates) => {
    if (dates.length === 1) {
      return new Date(dates[0]).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return dates.map(d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })).join(' and ') + ' ' + new Date(dates[0]).getFullYear();
  };
  
  const handleWhatsAppShare = (e) => {
    e.preventDefault();
    const pageUrl = window.location.href;
    const formattedDates = formatDates(dates);
    const defaultMessage = `You are warmly invited to the wedding of ${brideName} and ${groomName} on ${formattedDates} at ${venueName}, ${venueCity}.\n\nPlease tap the link to view the full invitation:\n`;
    const message = encodeURIComponent(
      (translations['rsvp.whatsapp_share'] || defaultMessage) + pageUrl
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

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
            <button className="btn btn-primary" id="rsvpButton" onClick={onRSVPClick}>
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

