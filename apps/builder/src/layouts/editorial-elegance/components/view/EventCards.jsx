/**
 * EventCards - Horizontal card-based event schedule
 * Minimal design with thin borders, no icons
 */
function EventCards({ translations, currentLang, config = {} }) {
  const events = config.events || {};
  const eventList = events.events || [];
  
  if (!eventList.length) return null;
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).toUpperCase();
  };
  
  return (
    <section className="ee-section ee-events-section">
      {/* Section Heading */}
      <div className="ee-section-header">
        <h2 className="ee-section-heading">Events</h2>
        <div className="ee-divider" />
      </div>
      
      {/* Event Cards */}
      <div className="ee-event-cards">
        {eventList.map((event, index) => (
          <div key={index} className="ee-event-card">
            <div className="ee-event-card-inner">
              <h3 className="ee-event-name">{event.label}</h3>
              <p className="ee-meta-text ee-event-date">
                {formatDate(event.date)}
              </p>
              <div className="ee-event-details">
                <p className="ee-event-venue">{event.venue || 'Venue TBD'}</p>
                <p className="ee-event-time">{event.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EventCards;

