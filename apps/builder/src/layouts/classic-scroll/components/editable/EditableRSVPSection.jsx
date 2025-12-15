import EditableText from '../shared/EditableText';

/**
 * EditableRSVPSection - WYSIWYG editable version of RSVP section
 */
function EditableRSVPSection({ onRSVPClick, translations, currentLang, config = {}, onUpdate }) {
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
      (getTranslation('rsvp.whatsapp_share') || defaultMessage) + pageUrl
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <section id="rsvp">
      <div className="section-header">
        <EditableText
          value={getTranslation('rsvp.eyebrow') || 'RSVP'}
          onUpdate={onUpdate}
          path="customTranslations.rsvp.eyebrow"
          className="section-eyebrow"
          tag="div"
        />
        <EditableText
          value={getTranslation('rsvp.title') || 'With Warm Regards'}
          onUpdate={onUpdate}
          path="customTranslations.rsvp.title"
          className="section-title"
          tag="div"
        />
        <EditableText
          value={getTranslation('rsvp.subtitle') || 'Kindly confirm your presence and feel free to reach out for any assistance.'}
          onUpdate={onUpdate}
          path="customTranslations.rsvp.subtitle"
          className="section-subtitle"
          tag="div"
          multiline={true}
        />
      </div>

      <div className="card">
        <div className="card-inner">
          <EditableText
            value={getTranslation('rsvp.text') || 'On behalf of both families, you may contact the following for confirmations, travel details, or any other queries:'}
            onUpdate={onUpdate}
            path="customTranslations.rsvp.text"
            className="rsvp-text"
            tag="p"
            multiline={true}
          />

          <div className="rsvp-grid">
            {contacts.map((contact, index) => (
              <div key={index} className="rsvp-pill">
                <EditableText
                  value={contact.badge}
                  onUpdate={onUpdate}
                  path={`rsvp.contacts.${index}.badge`}
                  className="rsvp-badge"
                  tag="div"
                />
                <EditableText
                  value={contact.name}
                  onUpdate={onUpdate}
                  path={`rsvp.contacts.${index}.name`}
                  tag="span"
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
            <button className="btn btn-primary" id="rsvpButton" onClick={onRSVPClick}>
              {getTranslation('hero.actions.rsvp') || 'RSVP Now'}
              <span className="btn-icon">✓</span>
            </button>
            <a
              className="btn btn-ghost"
              href="#"
              onClick={handleWhatsAppShare}
              target="_blank"
              rel="noopener noreferrer"
            >
              {getTranslation('rsvp.share.button') || 'Share Invitation on WhatsApp'}
            </a>
            <EditableText
              value={getTranslation('rsvp.share.note') || 'You may share this link with friends and family whom you wish to invite.'}
              onUpdate={onUpdate}
              path="customTranslations.rsvp.share.note"
              className="small-note"
              tag="p"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditableRSVPSection;


