import { useState } from "react";
import { formatEventDate } from "../../utils/dateFormatter";

/**
 * EventCards - Horizontal card-based event schedule
 * Minimal design with thin borders, no icons
 */
function EventCards({ _translations, _currentLang, config = {} }) {
  const events = config.events || {};
  const eventList = events.events || [];
  const [expandedContentEvents, setExpandedContentEvents] = useState<Set<number>>(new Set());
  const [expandedWidthEvents, setExpandedWidthEvents] = useState<Set<number>>(new Set());

  // Show default event if no events provided
  const defaultEvent = {
    label: "Wedding Ceremony",
    date: config.wedding?.dates?.[0] || "2021-05-15",
    time: "6:00 PM",
    venue: config.wedding?.venue?.name || "Venue TBD",
  };

  const displayEvents = eventList.length > 0 ? eventList : [defaultEvent];

  const toggleContent = (index: number) => {
    setExpandedContentEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleWidth = (index: number) => {
    setExpandedWidthEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
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
        {displayEvents.map((event, index) => {
          const isContentExpanded = expandedContentEvents.has(index);
          const isWidthExpanded = expandedWidthEvents.has(index);
          return (
            <div
              key={index}
              className={`ee-event-card ${isWidthExpanded ? "ee-event-card-width-expanded" : ""}`}
            >
              <div className="ee-event-card-inner">
                <div className="ee-event-card-header">
                  <div className="ee-event-card-header-content">
                    <h3 className="ee-event-name">{event.label}</h3>
                    {formatEventDate(event.date) && (
                      <p className="ee-meta-text ee-event-date">{formatEventDate(event.date)}</p>
                    )}
                  </div>
                  <div className="ee-event-controls">
                    <button
                      onClick={() => toggleContent(index)}
                      className="ee-event-toggle-btn"
                      type="button"
                      aria-label={isContentExpanded ? "Hide details" : "Show details"}
                      title={isContentExpanded ? "Hide details" : "Show details"}
                    >
                      {isContentExpanded ? "−" : "+"}
                    </button>
                    <button
                      onClick={() => toggleWidth(index)}
                      className="ee-event-width-toggle-btn"
                      type="button"
                      aria-label={isWidthExpanded ? "Compact width" : "Full width"}
                      title={isWidthExpanded ? "Compact width" : "Full width"}
                    >
                      ⇄
                    </button>
                  </div>
                </div>
                <div
                  className={`ee-event-details ${isContentExpanded ? "ee-event-details-expanded" : ""}`}
                >
                  <p className="ee-event-venue">{event.venue || "Venue TBD"}</p>
                  <p className="ee-event-time">{event.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default EventCards;
