function Events({ translations, currentLang }) {
  const day1Events = [
    { emoji: '🪔', label: translations['events.tilak.label'] || 'Tilak', tag: translations['events.tilak.tag'] || 'Auspicious beginning', time: '3:00 PM' },
    { emoji: '🌼', label: translations['events.haldi.label'] || 'Haldi', tag: translations['events.haldi.tag'] || 'Turmeric & traditions', time: '6:00 PM' },
    { emoji: '🌺', label: translations['events.mehandi.label'] || 'Mehandi', tag: translations['events.mehandi.tag'] || 'Henna & happiness', time: '9:00 PM' }
  ];

  const day2Events = [
    { emoji: '💐', label: translations['events.jaimala.label'] || 'Jaimala', tag: translations['events.jaimala.tag'] || 'Exchange of garlands', time: '5:00 PM' },
    { emoji: '🍽️', label: translations['events.dinner.label'] || 'Dinner', tag: translations['events.dinner.tag'] || 'Feast with family & friends', time: '8:00 PM' },
    { emoji: null, image: '/assets/photos/icons/3.jpg', label: translations['events.wedding.label'] || 'Wedding', tag: translations['events.wedding.tag'] || 'Sacred vows', time: '9:00 PM' }
  ];

  return (
    <section id="events">
      <div className="section-header">
        <div className="section-eyebrow">{translations['events.eyebrow'] || 'Program Details'}</div>
        <div className="section-title">{translations['events.title'] || 'The Celebrations'}</div>
        <div className="section-subtitle">
          {translations['events.subtitle'] || 'We would be honoured by your presence at each of these moments of joy.'}
        </div>
      </div>

      <div className="card">
        <div className="card-inner event-grid">
          <div className="event-day">
            <div className="event-date-label">{translations['events.day1'] || 'Day One'}</div>
            <div className="event-date-main">Thursday · 22 January 2026</div>

            {day1Events.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-icon-wrapper">
                  {event.emoji ? (
                    <div className="event-icon-emoji">{event.emoji}</div>
                  ) : (
                    <img src={event.image} alt={event.label} className="event-icon-image" />
                  )}
                </div>
                <div className="event-content">
                  <div className="event-left">
                    <div className="event-label">{event.label}</div>
                    <div className="event-tag">{event.tag}</div>
                  </div>
                  <div className="event-time">{event.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="event-day">
            <div className="event-date-label">{translations['events.day2'] || 'Day Two'}</div>
            <div className="event-date-main">Friday · 23 January 2026</div>

            {day2Events.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-icon-wrapper">
                  {event.emoji ? (
                    <div className="event-icon-emoji">{event.emoji}</div>
                  ) : (
                    <img src={event.image} alt={event.label} className="event-icon-image" />
                  )}
                </div>
                <div className="event-content">
                  <div className="event-left">
                    <div className="event-label">{event.label}</div>
                    <div className="event-tag">{event.tag}</div>
                  </div>
                  <div className="event-time">{event.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="muted" style={{ marginTop: '14px', fontSize: '12px' }}>
          {translations['events.complete'] || 'Your presence and blessings at these ceremonies will make our celebration truly complete.'}
        </p>
      </div>
    </section>
  );
}

export default Events;

