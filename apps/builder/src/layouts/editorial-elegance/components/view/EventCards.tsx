import { formatEventDate } from "../../utils/dateFormatter";

/**
 * EventCards - Horizontal card-based event schedule
 * Minimal design with thin borders, no icons
 */
function EventCards({ _translations, _currentLang, config = {} }) {
  const events = config.events || {};
  const eventList = events.events || [];

  // Show default event if no events provided
  const defaultEvent = {
    label: "Wedding Ceremony",
    date: config.wedding?.dates?.[0] || "2021-05-15",
    time: "6:00 PM",
    venue: config.wedding?.venue?.name || "Venue TBD",
  };

  const displayEvents = eventList.length > 0 ? eventList : [defaultEvent];

  return (
    <section className="ee-section ee-events-section">
      {/* Section Heading */}
      <div className="ee-section-header">
        <h2 className="ee-section-heading">Events</h2>
        <div className="ee-divider" />
      </div>

      {/* Event Cards */}
      <div className="ee-event-cards">
        {displayEvents.map((event, index) => (
          <div key={index} className="ee-event-card">
            <div className="ee-event-card-inner">
              <h3 className="ee-event-name">{event.label}</h3>
              {formatEventDate(event.date) && (
                <p className="ee-meta-text ee-event-date">{formatEventDate(event.date)}</p>
              )}
              <div className="ee-event-details">
                <p className="ee-event-venue">{event.venue || "Venue TBD"}</p>
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
